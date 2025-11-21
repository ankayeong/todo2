// backend/controllers/todoController.js
import Todo from "../models/Todo.js";

// 🔧 공통: 오늘 날짜를 "YYYY-MM-DD" 문자열로 만드는 함수
const getDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// 새 할 일 추가
export const createTodo = async (req, res) => {
  try {
    const { userId, title, description, createdAt } = req.body;

    if (!userId || !title) {
      return res.status(400).json({ error: "userId와 title은 필수입니다." });
    }

    // 프론트에서 createdAt을 안 보내면, 서버에서 오늘 날짜로 세팅
    const dateStr = createdAt || getDateString(new Date());

    const todo = await Todo.create({
      userId,
      title,
      description: description || "",
      completed: false,
      createdAt: dateStr,
    });

    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 유저별 할 일 전체 가져오기 (메인 페이지에서 사용)
export const getTodosByUser = async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.params.userId }).sort({
      createdAt: -1,
    });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 할 일 삭제
export const deleteTodo = async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: "Todo deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 할 일 업데이트 (제목/완료 상태)
export const updateTodo = async (req, res) => {
  try {
    const { title, completed } = req.body;
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (completed !== undefined) updateData.completed = completed;

    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedTodo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔥 특정 날짜의 할 일 가져오기 (캘린더)
export const getTodosByDate = async (req, res) => {
  try {
    const { userId, date } = req.query;

    if (!userId || !date) {
      return res
        .status(400)
        .json({ error: "userId와 date 쿼리 파라미터가 필요합니다." });
    }

    // createdAt은 "YYYY-MM-DD" 문자열이니까, 그냥 문자열로 비교하면 됨
    const todos = await Todo.find({
      userId,
      createdAt: date, // ← 여기!
    });

    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 월별 완료 통계
export const getMonthlyStats = async (req, res) => {
  try {
    const { userId } = req.query;

    const todos = await Todo.find({ userId });

    // 데이터 누적
    const monthly = {};

    todos.forEach(todo => {
      const date = new Date(todo.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!monthly[key]) {
        monthly[key] = { total: 0, completed: 0 };
      }

      monthly[key].total++;
      if (todo.completed) monthly[key].completed++;
    });

    const result = Object.entries(monthly).map(([month, data]) => ({
      month,
      total: data.total,
      completed: data.completed,
      completionRate: data.total ? Math.round((data.completed / data.total) * 100) : 0,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
