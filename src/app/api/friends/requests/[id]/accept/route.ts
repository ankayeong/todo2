import { NextResponse } from "next/server";
import Friend from "@/lib/models/Friend";
import { connectMongo } from "@/lib/mongo";

type Params = {
  params: {
    id: string;
  };
};

export async function POST(request: Request, { params }: Params) {
  try {
    await connectMongo();

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId 는 필수입니다." },
        { status: 400 }
      );
    }

    const requestDoc = await Friend.findOne({
      _id: params.id,
      recipientId: userId,
      status: "pending",
    });

    if (!requestDoc) {
      return NextResponse.json(
        { error: "대기 중인 친구 요청을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    requestDoc.status = "accepted";
    await requestDoc.save();

    return NextResponse.json(requestDoc);
  } catch (error) {
    console.error("친구 요청 수락 중 오류", error);
    return NextResponse.json(
      { error: "친구 요청을 수락하는 데 실패했습니다." },
      { status: 500 }
    );
  }
}