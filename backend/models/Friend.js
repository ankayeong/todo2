// backend/models/Friend.js
import mongoose from "mongoose";

const friendSchema = new mongoose.Schema({
  // 이 친구를 추가한 사람 (Clerk userId)
  ownerId: {
    type: String,
    required: true,
  },
  // 실제 친구의 Clerk userId
  friendId: {
    type: String,
    required: true,
  },
  // 화면에 보여줄 친구 이름 (닉네임)
  friendName: {
    type: String,
    required: true,
  },
  // 필요하다면 나중에 쓸 수 있는 친구용 메모/캘린더
  calendar: {
    type: Map,
    of: [String],
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Friend", friendSchema);
