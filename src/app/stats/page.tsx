"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface MonthlyStat {
  month: string;
  completionRate: number;
  total: number;
  completed: number;
}

export default function StatsPage() {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const [data, setData] = useState<MonthlyStat[]>([]);
  const [loading, setLoading] = useState(true);

  // 백엔드에서 월별 통계 가져오기
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) return;

    fetch(`http://localhost:5000/api/todos/stats/monthly?userId=${userId}`)
      .then((res) => res.json())
      .then((stats) => {
        setData(stats);
        setLoading(false);
      })
      .catch((err) => {
        console.error("통계 불러오기 실패:", err);
        setLoading(false);
      });
  }, [isLoaded, isSignedIn, userId]);

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-slate-600">통계를 불러오는 중...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    window.location.href = "/";
    return null;
  }

  return (
    <div className="flex flex-col items-center p-10">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">
        📊 월별 할 일 완료 비율
      </h2>

      <div className="w-full max-w-3xl h-96 bg-white rounded-xl shadow-lg p-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "#555" }}
              tickMargin={10}
            />
            <YAxis
              unit="%"
              tick={{ fontSize: 12, fill: "#555" }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                backgroundColor: "rgba(255,255,255,0.9)",
                border: "1px solid #eee",
              }}
            />

            <Bar
              dataKey="completionRate"
              fill="#4F46E5"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
