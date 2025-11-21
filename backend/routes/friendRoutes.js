import express from "express";
import {
  getFriends,
  createFriend,
  getFriendById,
  updateFriendCalendar
} from "../controllers/friendController.js";

const router = express.Router();

// ?userId=ClerkID
router.get("/", getFriends);

// 새 친구 추가
router.post("/", createFriend);

// 특정 친구
router.get("/:id", getFriendById);

// 특정 친구 캘린더 업데이트
router.put("/:id/calendar", updateFriendCalendar);

export default router;
