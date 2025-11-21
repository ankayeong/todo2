'use client';

import { useUser } from '@clerk/nextjs';

export default function ProfilePage() {
  const { user } = useUser();

  return (
    <div className="flex-1 flex flex-col items-center px-6 py-15">
      <h1 className="text-4xl font-bold text-slate-800 mb-6">Profile</h1>
      
      <div className="flex flex-col items-center p-6 rounded-lg">
        <img
          src={user?.imageUrl || "/default-image.jpg"}
          alt="profile"
          className="h-40 w-40 rounded-full mb-4 shadow-lg"
        />
        <h2 className="text-xl p-3 font-semibold">{user?.fullName || "No Name"}</h2>
        <p className="text-m text-slate-500">{user?.primaryEmailAddress?.emailAddress || "No Email"}</p>
        <p className="text-m text-slate-400">회원가입일: {user?.createdAt?.toLocaleDateString("ko-KR")}</p>
        {/* 여기에 ID 표시 */}
        <p className="text-m text-slate-400 mt-2">User ID: {user?.id}</p>
      </div>
    </div>
  )
}
