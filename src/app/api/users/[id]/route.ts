import { NextResponse } from "next/server";
import User from "@/lib/models/User";
import { connectMongo } from "@/lib/mongo";

type Params = {
  params: {
    id: string;
  };
};

export async function GET(request: Request, { params }: Params) {
  try {
    await connectMongo();

    const user = await User.findById(params.id);

    if (!user) {
      return NextResponse.json(
        { message: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("사용자 조회 중 오류", error);
    return NextResponse.json(
      { message: "사용자 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}
