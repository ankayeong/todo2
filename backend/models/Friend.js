import mongoose from "mongoose";

const friendSchema = new mongoose.Schema({
  name: String,
  requesterId: String,    // 누가 추가했는지
  calendar: {
    type: Map,
    of: [String],         // 날짜별 문자열 배열
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Friend", friendSchema);
