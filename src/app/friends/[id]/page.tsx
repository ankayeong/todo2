"use client";

import React, { useEffect, useState } from "react";

interface Friend {
  _id: string;
  name: string;
  calendar: Record<string, string[]>;
}

export default function FriendCalendarPage(
  props: { params: Promise<{ id: string }> }
) {
  const { id } = React.use(props.params);

  const [friend, setFriend] = useState<Friend | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetch(`http://localhost:5000/api/friends/${id}`)
      .then((res) => res.json())
      .then(setFriend);
  }, [id]);

  if (!friend) {
    return <p className="p-6">친구 정보를 불러오는 중...</p>;
  }

  const getDateString = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const todayKey = getDateString(selectedDate);
  const tasks = friend.calendar[todayKey] || [];

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6 text-center">
        {friend.name}님의 캘린더
      </h1>

      <p className="text-center text-lg mb-4">
        {selectedDate.toLocaleDateString()}
      </p>

      <ul className="space-y-3">
        {tasks.length === 0 && (
          <p className="text-gray-400 text-center">할 일이 없습니다.</p>
        )}

        {tasks.map((t, i) => (
          <li
            key={i}
            className="p-3 bg-white shadow rounded text-slate-800"
          >
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
