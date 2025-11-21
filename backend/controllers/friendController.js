import Friend from "../models/Friend.js";

// 모든 친구 가져오기
export const getFriends = async (req, res) => {
  try {
    const { userId } = req.query; // Clerk userId
    const friends = await Friend.find({ requesterId: userId });
    res.json(friends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 친구 추가
export const createFriend = async (req, res) => {
  try {
    const { name, requesterId } = req.body;

    const newFriend = await Friend.create({
      name,
      requesterId,
      calendar: {}
    });

    res.json(newFriend);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 특정 친구 가져오기
export const getFriendById = async (req, res) => {
  try {
    const friend = await Friend.findById(req.params.id);
    res.json(friend);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 친구 캘린더 업데이트
export const updateFriendCalendar = async (req, res) => {
  try {
    const { date, task } = req.body; // 예: "2025-11-20", "과제하기"

    const friend = await Friend.findById(req.params.id);

    if (!friend.calendar.has(date)) {
      friend.calendar.set(date, []);
    }

    friend.calendar.get(date).push(task);

    await friend.save();
    res.json(friend);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
