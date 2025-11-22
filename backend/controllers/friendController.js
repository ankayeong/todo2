import Friend from "../models/Friend.js";

/**
 * 친구 요청 보내기
 * POST /api/friends/requests
 * body: { requesterId, requesterName, recipientId, recipientName }
 */
export const sendFriendRequest = async (req, res) => {
  try {
    const { requesterId, requesterName, recipientId, recipientName } = req.body;

    if (!requesterId || !requesterName || !recipientId || !recipientName) {
      return res.status(400).json({
        error:
          "requesterId, requesterName, recipientId, recipientName 는 모두 필수입니다.",
      });
    }

    if (requesterId === recipientId) {
      return res
        .status(400)
        .json({ error: "자기 자신에게 친구 요청을 보낼 수 없습니다." });
    }

    // 이미 친구이거나 대기 중인지 확인 (양방향)
    const existing = await Friend.findOne({
      status: { $in: ["pending", "accepted"] },
      $or: [
        { requesterId, recipientId },
        { requesterId: recipientId, recipientId: requesterId },
      ],
    });

    if (existing) {
      const message =
        existing.status === "accepted"
          ? "이미 친구로 연결되어 있습니다."
          : "이미 대기 중인 친구 요청이 있습니다.";
      return res.status(400).json({ error: message });
    }

    const request = await Friend.create({
      requesterId,
      requesterName,
      recipientId,
      recipientName,
      status: "pending",
    });

    res.status(201).json(request);
  } catch (err) {
    console.error("sendFriendRequest error:", err);
    res.status(500).json({ error: "서버 오류" });
  }
};

/**
 * 친구 요청 수락
 * POST /api/friends/requests/:id/accept
 * body: { userId }  // 요청을 수락하는 사람 (recipientId)
 */
export const acceptFriendRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId 는 필수입니다." });
    }

    const request = await Friend.findOne({
      _id: id,
      recipientId: userId,
      status: "pending",
    });

    if (!request) {
      return res
        .status(404)
        .json({ error: "대기 중인 친구 요청을 찾을 수 없습니다." });
    }

    request.status = "accepted";
    await request.save();

    res.json(request);
  } catch (err) {
    console.error("acceptFriendRequest error:", err);
    res.status(500).json({ error: "서버 오류" });
  }
};

/**
 * 친구 요청 거절 / 취소
 * POST /api/friends/requests/:id/reject
 * body: { userId }
 */
export const rejectFriendRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId 는 필수입니다." });
    }

    const request = await Friend.findOne({
      _id: id,
      status: "pending",
      $or: [{ recipientId: userId }, { requesterId: userId }],
    });

    if (!request) {
      return res
        .status(404)
        .json({ error: "대기 중인 친구 요청을 찾을 수 없습니다." });
    }

    request.status = "rejected";
    await request.save();

    res.json(request);
  } catch (err) {
    console.error("rejectFriendRequest error:", err);
    res.status(500).json({ error: "서버 오류" });
  }
};

/**
 * 내 친구 목록 (양방향)
 * GET /api/friends?userId=xxx
 * 반환: [{ _id, friendId, friendName, createdAt, updatedAt }]
 */
export const getFriends = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res
        .status(400)
        .json({ error: "userId 쿼리 파라미터가 필요합니다." });
    }

    const friends = await Friend.find({
      status: "accepted",
      $or: [{ requesterId: userId }, { recipientId: userId }],
    }).sort({ updatedAt: -1 });

    const normalized = friends.map((doc) => {
      const isRequester = doc.requesterId === userId;
      return {
        _id: doc._id,
        friendId: isRequester ? doc.recipientId : doc.requesterId,
        friendName: isRequester ? doc.recipientName : doc.requesterName,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    });

    res.json(normalized);
  } catch (err) {
    console.error("getFriends error:", err);
    res.status(500).json({ error: "서버 오류" });
  }
};

/**
 * 대기 중인 요청 목록
 * GET /api/friends/requests?userId=xxx
 */
export const getPendingRequests = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res
        .status(400)
        .json({ error: "userId 쿼리 파라미터가 필요합니다." });
    }

    const requests = await Friend.find({
      status: "pending",
      $or: [{ requesterId: userId }, { recipientId: userId }],
    }).sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error("getPendingRequests error:", err);
    res.status(500).json({ error: "서버 오류" });
  }
};

/**
 * 친구 상세 조회 (친구 캘린더용)
 * GET /api/friends/:id?userId=xxx
 * 반환: { _id, friendId, friendName }
 */
export const getFriendDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res
        .status(400)
        .json({ error: "userId 쿼리 파라미터가 필요합니다." });
    }

    const doc = await Friend.findById(id);

    if (!doc || doc.status !== "accepted") {
      return res.status(404).json({ error: "Friend document not found" });
    }

    if (doc.requesterId !== userId && doc.recipientId !== userId) {
      return res.status(403).json({ error: "이 친구 관계에 속한 유저가 아닙니다." });
    }

    const isRequester = doc.requesterId === userId;

    const normalized = {
      _id: doc._id,
      friendId: isRequester ? doc.recipientId : doc.requesterId,
      friendName: isRequester ? doc.recipientName : doc.requesterName,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };

    res.json(normalized);
  } catch (err) {
    console.error("getFriendDetail error:", err);
    res.status(500).json({ error: "서버 오류" });
  }
};
