'use client';

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

interface Todo {
  _id: string;
  userId: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string; // "YYYY-MM-DD"
}

export default function CalendarPage() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const lastDateOfMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let d = 1; d <= lastDateOfMonth; d++) days.push(d);

  // 🔧 날짜 문자열 만드는 함수 (YYYY-MM-DD) - 메인이랑 똑같이
  const getDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // 📌 선택한 날짜의 투두 가져오기
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) return;

    const dateStr = getDateString(selectedDate);

    fetch(
      `http://localhost:5000/api/todos/by-date?userId=${userId}&date=${dateStr}`
    )
      .then((res) => res.json())
      .then((data: Todo[]) => setTasks(data))
      .catch((err) => console.error("Error fetching todos:", err));
  }, [selectedDate, isLoaded, isSignedIn, userId]);

  if (!isLoaded)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  if (!isSignedIn) {
    window.location.href = "/";
    return null;
  }

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  // 📌 투두 추가
  const addTask = () => {
    if (!input.trim() || !userId) return;

    const dateStr = getDateString(selectedDate); // 🔥 선택한 날짜 문자열

    fetch("http://localhost:5000/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        title: input.trim(),
        description: "",
        createdAt: dateStr, // 🔥 메인과 동일하게 createdAt으로 저장
      }),
    })
      .then((res) => res.json())
      .then((newTodo: Todo) => {
        setTasks((prev) => [...prev, newTodo]);
        setInput("");
      })
      .catch((err) => console.error("Error creating todo:", err));
  };

  const removeTask = (id: string) => {
    fetch(`http://localhost:5000/api/todos/${id}`, { method: "DELETE" })
      .then(() => setTasks((prev) => prev.filter((t) => t._id !== id)))
      .catch((err) => console.error("Error deleting todo:", err));
  };

  const toggleCompleted = (task: Todo, completed: boolean) => {
    fetch(`http://localhost:5000/api/todos/${task._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    })
      .then(() =>
        setTasks((prev) =>
          prev.map((t) => (t._id === task._id ? { ...t, completed } : t))
        )
      )
      .catch((err) => console.error("Error updating todo:", err));
  };

  const saveEditing = (task: Todo) => {
    if (!editingText.trim()) return;

    fetch(`http://localhost:5000/api/todos/${task._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editingText.trim() }),
    })
      .then((res) => res.json())
      .then((updated: Todo) => {
        setTasks((prev) =>
          prev.map((t) => (t._id === updated._id ? updated : t))
        );
        setEditingId(null);
        setEditingText("");
      })
      .catch((err) => console.error("Error editing todo:", err));
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm p-4">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white text-center py-4">
          Calendar
        </h1>
      </header>

      {/* 메인 */}
      <main className="flex-1 overflow-y-auto py-10 flex flex-col md:flex-row gap-6 justify-center">
        {/* 달력 */}
        <div className="w-full md:w-1/2 max-w-md mx-auto md:mx-0">
          <div className="flex itemscenter justify-between mb-4 py-3">
            <button
              onClick={handlePrevMonth}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200"
            >
              ◀
            </button>
            <p className="text-base font-bold text-slate-900 dark:text:white">
              {year}년 {month + 1}월
            </p>
            <button
              onClick={handleNextMonth}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200"
            >
              ▶
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              const isToday =
                day === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear();

              const isSelected =
                day === selectedDate.getDate() &&
                month === selectedDate.getMonth() &&
                year === selectedDate.getFullYear();

              return (
                <button
                  key={idx}
                  className={`h-10 flex items-center justify-center rounded hover:bg-slate-200
                    ${isToday ? "text-blue-500" : ""}
                    ${isSelected ? "bg-slate-200" : ""}`}
                  onClick={() =>
                    day && setSelectedDate(new Date(year, month, day))
                  }
                  disabled={!day}
                >
                  {day || ""}
                </button>
              );
            })}
          </div>
        </div>

        {/* 오른쪽: 투두 목록 */}
        <div className="w-full md:w-1/2 max-w-md">
          <p className="text-lg font-bold text-slate-900 dark:text-white text-center">
            {selectedDate.toLocaleDateString()} 할 일
          </p>

          <div className="flex w-full mb-4 mt-6">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="Add a new task..."
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-800 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              onClick={addTask}
              type="button"
              className="ml-2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-800 hover:bg-slate-200"
            >
              <span className="material-symbols-outlined text-2xl">add</span>
            </button>
          </div>

          <ul className="relative space-y-4 max-h-96 overflow-y-auto pr-3">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={(e) => toggleCompleted(task, e.target.checked)}
                  className="h-5 w-5 rounded border-slate-300 text-blue-500"
                />

                {editingId === task._id ? (
                  <>
                    <input
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="flex-1 rounded border border-slate-300 px-2 py-1 text-base text-slate-800"
                    />
                    <button
                      onClick={() => saveEditing(task)}
                      className="ml-2 text-blue-500 hover:underline"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditingText("");
                      }}
                      className="ml-2 text-gray-400"
                    >
                      취소
                    </button>
                  </>
                ) : (
                  <>
                    <p
                      className={`flex-1 text-base break-words ${
                        task.completed
                          ? "line-through text-slate-400"
                          : "text-slate-800"
                      }`}
                    >
                      {task.title}
                    </p>
                    <button
                      onClick={() => {
                        setEditingId(task._id);
                        setEditingText(task.title);
                      }}
                      className="ml-2 text-blue-500 hover:underline"
                    >
                      수정
                    </button>
                  </>
                )}

                <button
                  onClick={() => removeTask(task._id)}
                  className="ml-2 text-sm text-slate-400 hover:text-red-500"
                >
                  삭제
                </button>
              </div>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
