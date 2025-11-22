import express from "express";
import {
  getFriends,
  createFriend,
  getFriendById,
  updateFriendCalendar,
  deleteFriend,
} from "../controllers/friendController.js";

const router = express.Router();

// 내 친구 목록 (?userId=ClerkID)
router.get("/", getFriends);

// 새 친구 추가
router.post("/", createFriend);

// 특정 친구
router.get("/:id", getFriendById);

// 특정 친구 캘린더 업데이트 (선택 기능)
router.put("/:id/calendar", updateFriendCalendar);

// 친구 삭제
router.delete("/:id", deleteFriend);

export default router;
