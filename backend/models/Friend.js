import mongoose from "mongoose";

const friendSchema = new mongoose.Schema(
  {
    // 친구 요청을 보낸 사람 (Clerk userId)
    requesterId: {
      type: String,
      required: true,
    },
    requesterName: {
      type: String,
      required: true,
    },
    // 친구 요청을 받은 사람 (Clerk userId)
    recipientId: {
      type: String,
      required: true,
    },
    recipientName: {
      type: String,
      required: true,
    },
    // 요청 상태: pending(대기), accepted(수락), rejected(거절)
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// 동일한 쌍으로 중복 요청 방지
friendSchema.index({ requesterId: 1, recipientId: 1 }, { unique: true });

export default mongoose.model("Friend", friendSchema);
