import express from "express";
import {
  createTodo,
  getTodosByUser,
  deleteTodo,
  updateTodo,
  getTodosByDate,
  getMonthlyStats,
} from "../controllers/todoController.js";

const router = express.Router();

// 반드시 userId 라우트보다 위에 있어야 함 진짜 
router.get("/by-date", getTodosByDate);
router.get("/stats/monthly", getMonthlyStats);

router.post("/", createTodo);
router.get("/:userId", getTodosByUser);
router.delete("/:id", deleteTodo);
router.put("/:id", updateTodo);

export default router;
