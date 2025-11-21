"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

interface Friend {
  _id: string;
  name: string;
}

export default function FriendsPage() {
  const { userId } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/api/friends?userId=${userId}`)
      .then(res => res.json())
      .then(setFriends);
  }, [userId]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">친구 목록</h1>

      <Link
        href="/friends/add"
        className="inline-block mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        친구 추가하기
      </Link>

      <ul className="space-y-2">
        {friends.map(f => (
          <li key={f._id}>
            <Link
              href={`/friends/${f._id}`}
              className="block p-3 bg-white border rounded shadow hover:bg-slate-100"
            >
              {f.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
