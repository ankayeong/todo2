import express from "express";
import {
  acceptFriendRequest,
  getFriends,
  getFriendDetail,
  getPendingRequests,
  rejectFriendRequest,
  sendFriendRequest,
} from "../controllers/friendController.js";

const router = express.Router();

// 친구 요청 보내기
router.post("/requests", sendFriendRequest);

// 친구 요청 수락 / 거절
router.post("/requests/:id/accept", acceptFriendRequest);
router.post("/requests/:id/reject", rejectFriendRequest);

// 대기 중 요청 조회
router.get("/requests", getPendingRequests);

// 친구 목록 조회
router.get("/", getFriends);

// 친구 상세 (캘린더용)
router.get("/:id", getFriendDetail);

export default router;
