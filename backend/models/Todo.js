import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  userId: String,
  title: String,
  description: String,
  completed: {
    type: Boolean,
    default: false,
  },
  // 날짜를 "YYYY-MM-DD" 문자열로만 저장
  createdAt: {
    type: String, // 예: "2025-11-21"
    required: true,
  },
});

export default mongoose.model("Todo", todoSchema);
