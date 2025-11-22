"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

interface Friend {
  _id: string;
  name: string;        // 내가 붙인 별명
  requesterId: string; // 나
  receiverId: string;  // 친구 Clerk userId
}

export default function FriendsPage() {
  const { userId, isLoaded, isSignedIn } = useAuth();

  const [friendCode, setFriendCode] = useState("");  // 친구 Clerk ID
  const [friendName, setFriendName] = useState("");  // 친구 별명
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  // 친구 목록 로드
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) return;

    fetch(`http://localhost:5000/api/friends?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setFriends(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("친구 목록 불러오기 실패:", err);
        setLoading(false);
      });
  }, [isLoaded, isSignedIn, userId]);

  // 친구 추가
  const addFriend = () => {
    if (!friendCode.trim() || !friendName.trim() || !userId) return;

    fetch("http://localhost:5000/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requesterId: userId,
        receiverId: friendCode.trim(),
        name: friendName.trim(),
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || "친구 추가 실패");
          return;
        }

        setFriends((prev) => [data, ...prev]);
        setFriendCode("");
        setFriendName("");
      })
      .catch((err) => {
        console.error("친구 추가 실패:", err);
        alert("친구 추가 중 오류가 발생했습니다.");
      });
  };

  // 친구 삭제
  const deleteFriend = (friendId: string) => {
    if (!confirm("정말 이 친구를 삭제하시겠습니까?")) return;

    fetch(`http://localhost:5000/api/friends/${friendId}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => {
        setFriends((prev) => prev.filter((f) => f._id !== friendId));
      })
      .catch((err) => {
        console.error("친구 삭제 실패:", err);
        alert("삭제 중 오류가 발생했습니다.");
      });
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!isSignedIn) {
    window.location.href = "/";
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 flex justify-center">
      <div className="w-full max-w-3xl">
        {/* 헤더 */}
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">
          친구 관리
        </h1>

        {/* 친구 추가 영역 */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            친구 추가
          </h2>
          <p className="text-xs text-slate-400 mb-3">
            친구의 Clerk User ID를 입력하고, 표시할 별명을 정해 주세요.
          </p>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
              <input
                value={friendCode}
                onChange={(e) => setFriendCode(e.target.value)}
                placeholder="친구 Clerk User ID (예: user_xxxxx)"
                className="flex-1 bg-transparent outline-none text-sm md:text-base text-slate-700"
              />
            </div>
            <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
              <input
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                placeholder="친구 별명 (화면에 표시될 이름)"
                className="flex-1 bg-transparent outline-none text-sm md:text-base text-slate-700"
              />
            </div>
            <button
              onClick={addFriend}
              className="md:w-auto w-full rounded-2xl bg-blue-600 text-white px-5 py-3 text-sm md:text-base font-semibold shadow hover:bg-blue-700 transition"
            >
              추가
            </button>
          </div>
        </section>

        {/* 친구 목록 */}
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            내 친구 목록
          </h2>

          {friends.length === 0 ? (
            <p className="text-slate-400 text-sm">
              아직 친구가 없어요. 위에서 친구의 Clerk ID를 입력해 추가해 보세요.
            </p>
          ) : (
            <ul className="space-y-3">
              {friends.map((f) => (
                <li
                  key={f._id}
                  className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow hover:border-slate-400 hover:shadow-md transition"
                >
                  <div className="flex flex-col flex-1">
                    <Link
                      href={`/friends/${f._id}`}
                      className="text-slate-800 font-medium hover:underline"
                    >
                      {f.name}
                    </Link>
                    <span className="text-[11px] text-slate-400 mt-1">
                      친구 ID: {f.receiverId}
                    </span>
                  </div>

                  <button
                    onClick={() => deleteFriend(f._id)}
                    className="px-3 py-1 text-sm rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
