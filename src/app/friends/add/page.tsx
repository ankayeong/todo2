"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function AddFriendPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");

  const addFriend = async () => {
    if (!name.trim() || !userId) return;

    await fetch("http://localhost:5000/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        requesterId: userId
      })
    });

    router.push("/friends");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">친구 추가</h1>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="친구 이름"
        className="border p-2 rounded w-full"
      />

      <button
        onClick={addFriend}
        className="mt-4 px-4 py-2 text-white bg-blue-500 rounded"
      >
        추가
      </button>
    </div>
  );
}
