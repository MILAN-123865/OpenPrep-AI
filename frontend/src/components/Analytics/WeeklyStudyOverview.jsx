import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-lg shadow-xl text-xs">
        <p className="font-semibold text-slate-200 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 my-0.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-400">{entry.name}:</span>
            <span className="font-bold text-slate-100">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function WeeklyStudyOverview({ data = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-5 rounded-2xl border border-slate-800 bg-slate-950/40 backdrop-blur-xl shadow-lg flex flex-col h-[400px] justify-between"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            Weekly Study Overview
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Daily breakdown of study metrics</p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500">
            No activity recorded this week
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="quizGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="flashcardGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#eab308" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }}
              />
              <Bar
                name="Quiz Questions"
                dataKey="quizQuestions"
                fill="url(#quizGrad)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                name="Flashcards Reviewed"
                dataKey="flashcards"
                fill="url(#flashcardGrad)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                name="Focus Minutes"
                dataKey="focusMinutes"
                fill="url(#focusGrad)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
