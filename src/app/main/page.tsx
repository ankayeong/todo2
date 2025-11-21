'use client';

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

interface Todo {
  _id: string;
  userId: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt?: string; // 문자열 날짜
}

export default function MainPage() {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const [tasks, setTasks] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // 🔧 날짜 문자열 만드는 함수 (YYYY-MM-DD)
  const getDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // 오늘 날짜 문자열 (UI 표시용)
  const today = new Date();
  const todayString = today.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
  });

  // 서버에서 할 일 가져오기
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) return;

    fetch(`http://localhost:5000/api/todos/${userId}`)
      .then((res) => res.json())
      .then((data: Todo[]) => setTasks(data))
      .catch((err) => console.error("Error fetching todos:", err));
  }, [isLoaded, isSignedIn, userId]);

  // 로딩 화면
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-xl font-semibold text-slate-700">Loading...</p>
      </div>
    );
  }

  // 로그인 안 됨 → 루트 이동
  if (!isSignedIn) {
    window.location.href = "/";
    return null;
  }

  // 할 일 추가
  const addTask = () => {
    if (!input.trim() || !userId) return;

    const createdAt = getDateString(new Date()); // 🔥 여기! 오늘 날짜 문자열로 저장

    fetch("http://localhost:5000/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        title: input.trim(),
        description: "",
        createdAt, // 🔥 문자열로 보냄
      }),
    })
      .then((res) => res.json())
      .then((newTodo: Todo) => {
        setTasks((prev) => [...prev, newTodo]);
        setInput("");
      })
      .catch((err) => console.error("Error creating todo:", err));
  };

  // 할 일 삭제
  const removeTask = (id: string) => {
    fetch(`http://localhost:5000/api/todos/${id}`, { method: "DELETE" })
      .then(() => setTasks((prev) => prev.filter((t) => t._id !== id)))
      .catch((err) => console.error("Error deleting todo:", err));
  };

  // 체크/언체크
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

  // 제목 수정 저장
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
    <div className="flex-1 flex flex-col items-center px-6 py-4">
      <h1 className="text-4xl font-bold text-slate-800 p-10 text-center w-full">
        My Tasks
      </h1>

      {/* Input + Add Button */}
      <div className="flex w-full max-w-2xl mb-6">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Add a new task..."
          className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-800 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus:outline-none"
        />
        <button
          onClick={addTask}
          type="button"
          className="ml-2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-800 hover:bg-slate-200"
          aria-label="add task"
        >
          <span className="material-symbols-outlined text-2xl">add</span>
        </button>
      </div>

      {/* Task List */}
      <main className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-slate-700">Today</h2>
          <span className="text-sm text-slate-500">{todayString}</span>
        </div>

        <div className="relative space-y-4 max-h-96 overflow-y-auto p-2">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={(e) => toggleCompleted(task, e.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
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
                    className="ml-2 text-sm text-blue-500 hover:text-blue-700"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditingText("");
                    }}
                    className="ml-2 text-sm text-gray-400 hover:text-gray-600"
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
                    className="ml-2 text-sm text-blue-500 hover:text-blue-700"
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
        </div>
      </main>
    </div>
  );
}
