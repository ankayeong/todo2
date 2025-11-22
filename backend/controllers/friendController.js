// backend/controllers/friendController.js
import Friend from "../models/Friend.js";

// 내 친구 목록 가져오기 (ownerId = 나의 Clerk userId)
export const getFriends = async (req, res) => {
  try {
    const { userId } = req.query; // Clerk userId

    if (!userId) {
      return res.status(400).json({ error: "userId 쿼리 파라미터가 필요합니다." });
    }

    const friends = await Friend.find({ ownerId: userId }).sort({ createdAt: -1 });
    res.json(friends);
  } catch (err) {
    console.error("getFriends error:", err);
    res.status(500).json({ error: "서버 오류" });
  }
};

// 친구 추가 (ownerId: 나, friendId: 친구 Clerk ID)
export const createFriend = async (req, res) => {
  try {
    const { ownerId, friendId, friendName } = req.body;

    if (!ownerId || !friendId || !friendName) {
      return res
        .status(400)
        .json({ error: "ownerId, friendId, friendName 은 모두 필수입니다." });
    }

    // 자기 자신은 친구 추가 불가
    if (ownerId === friendId) {
      return res.status(400).json({ error: "자기 자신을 친구로 추가할 수 없습니다." });
    }

    // 이미 추가된 친구인지 검사
    const existing = await Friend.findOne({ ownerId, friendId });
    if (existing) {
      return res.status(400).json({ error: "이미 추가된 친구입니다." });
    }

    const newFriend = await Friend.create({
      ownerId,
      friendId,
      friendName,
    });

    res.json(newFriend);
  } catch (err) {
    console.error("createFriend error:", err);
    res.status(500).json({ error: "서버 오류" });
  }
};

// 특정 친구 문서 가져오기 (Friend 도큐먼트 _id 기준)
export const getFriendById = async (req, res) => {
  try {
    const friend = await Friend.findById(req.params.id);

    if (!friend) {
      return res.status(404).json({ error: "Friend not found" });
    }

    res.json(friend);
  } catch (err) {
    console.error("getFriendById error:", err);
    res.status(500).json({ error: "서버 오류" });
  }
};

// 친구 삭제
export const deleteFriend = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Friend.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Friend not found" });
    }

    res.json({ message: "Friend deleted", id });
  } catch (err) {
    console.error("deleteFriend error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// (선택) 친구 캘린더 직접 수정용 – 기존 구조 유지
export const updateFriendCalendar = async (req, res) => {
  try {
    const { date, task } = req.body; // 예: "2025-11-20", "과제하기"

    if (!date || !task) {
      return res
        .status(400)
        .json({ error: "date와 task는 필수입니다." });
    }

    const friend = await Friend.findById(req.params.id);
    if (!friend) {
      return res.status(404).json({ error: "Friend not found" });
    }

    if (!friend.calendar.has(date)) {
      friend.calendar.set(date, []);
    }

    friend.calendar.get(date).push(task);

    await friend.save();
    res.json(friend);
  } catch (err) {
    console.error("updateFriendCalendar error:", err);
    res.status(500).json({ error: err.message });
  }
};
