"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from "recharts";

// Seeded random for consistent values
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Generate jagged growth data with RNG
const dates = [
  "Jul 2024", "Aug 2024", "Sep 2024", "Oct 2024", "Nov 2024", "Dec 2024",
  "Jan 2025", "Feb 2025", "Mar 2025", "Apr 2025", "May 2025", "Jun 2025",
  "Jul 2025", "Aug 2025", "Sep 2025", "Oct 2025", "Nov 2025", "Dec 2025",
];

const data = dates.map((date, i) => {
  if (i === 0) return { date, sonder: 0, reflex: 0 };
  
  // Base growth trajectory
  const progress = i / (dates.length - 1);
  const baseSonder = progress * 500;
  const baseReflex = progress * 1500;
  
  // Add jagged variation (±30% of current value)
  const sonderJag = (seededRandom(i * 7) - 0.5) * baseSonder * 0.6;
  const reflexJag = (seededRandom(i * 11 + 3) - 0.5) * baseReflex * 0.6;
  
  // Ensure last point hits target
  if (i === dates.length - 1) {
    return { date, sonder: 500, reflex: 1500 };
  }
  
  return {
    date,
    sonder: Math.max(0, Math.round(baseSonder + sonderJag)),
    reflex: Math.max(0, Math.round(baseReflex + reflexJag)),
  };
});

const projects = [
  { id: "sonder", name: "Sonder", color: "#3b82f6" }, // blue
  { id: "reflex", name: "Reflex", color: "#24292e" }, // black
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 px-4 py-3 rounded-lg shadow-lg">
        <p className="text-[#24292e] dark:text-gray-200 font-semibold mb-2 text-sm">{label}</p>
        <div className="space-y-1">
          {payload.sort((a: any, b: any) => b.value - a.value).map((entry: any, index: number) => (
            <div key={index} className="flex justify-between items-center gap-6">
              <span className="text-xs font-medium" style={{ color: entry.color }}>
                {entry.name}
              </span>
              <span className="text-[#24292e] dark:text-gray-200 font-mono text-xs">
                ${entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function RevenueChart() {
  return (
    <div className="my-2 overflow-hidden border border-gray-100 dark:border-gray-900 rounded-lg p-3 bg-white dark:bg-transparent">
      {/* Header */}
      <div className="mb-2">
        <p className="text-[11px] text-[#656d76] dark:text-[#8b949e] italic">
          WIP, linking to trustMRR soon
        </p>
      </div>

      {/* Chart */}
      <div className="h-[220px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 80, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gradient-sonder" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="gradient-reflex" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#24292e" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#24292e" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#656d76", fontSize: 11 }}
              dy={10}
              interval={2}
            />
            <YAxis hide domain={[0, 'dataMax + 2000']} />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: '#d1d5da', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            {/* Reflex - main revenue */}
            <Area
              type="monotone"
              dataKey="reflex"
              name="Reflex"
              stroke="#24292e"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#gradient-reflex)"
            />
            {/* Sonder - smaller */}
            <Area
              type="monotone"
              dataKey="sonder"
              name="Sonder"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#gradient-sonder)"
            />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Right-side labels */}
        <div className="absolute right-0 top-0 bottom-8 flex flex-col text-[11px] font-medium pr-1">
          <div className="mt-4 text-[#24292e] dark:text-gray-400">Reflex</div>
          <div className="mt-auto mb-8 text-[#3b82f6]">Sonder</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 text-[11px] text-[#656d76] dark:text-[#8b949e]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-[#24292e] dark:bg-gray-400" />
            <span>Reflex</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6]" />
            <span>Sonder</span>
          </div>
        </div>
        <span className="italic">*approximate</span>
      </div>
    </div>
  );
}
