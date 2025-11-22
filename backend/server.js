// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import friendRoutes from "./routes/friendRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB 연결
mongoose
  .connect(process.env.MONGO_URI, { dbName: "todoDB" })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// 라우터 연결
app.use("/api/users", userRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/friends", friendRoutes);


// 서버 실행
app.listen(5000, () => console.log("🚀 Server running on port 5000"));
