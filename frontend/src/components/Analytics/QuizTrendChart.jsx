import React from 'react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

const TrendTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-lg shadow-xl text-xs">
        <p className="font-semibold text-slate-200 mb-1">Date: {label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 my-0.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-400">{entry.name}:</span>
            <span className="font-bold text-slate-100">{entry.value}%</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function QuizTrendChart({ data = [], direction = 'stable', currentAverage = 0 }) {
  const getTrendIcon = () => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-rose-400" />;
      default:
        return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTrendText = () => {
    switch (direction) {
      case 'up':
        return { title: 'Improving', desc: 'Your average quiz score is showing solid gains. Keep practicing!', color: 'text-emerald-400 border-emerald-950 bg-emerald-950/20' };
      case 'down':
        return { title: 'Declining', desc: 'Recent quiz attempts are slipping. Try reviewing card decks or notes before retaking.', color: 'text-rose-400 border-rose-950 bg-rose-950/20' };
      default:
        return { title: 'Stable', desc: 'Performance is steady. Focus on weak topics to break past your ceiling.', color: 'text-slate-400 border-slate-900 bg-slate-900/40' };
    }
  };

  const trendDetails = getTrendText();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="p-5 rounded-2xl border border-slate-800 bg-slate-950/40 backdrop-blur-xl shadow-lg flex flex-col md:flex-row gap-5 h-auto min-h-[380px]"
    >
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            {getTrendIcon()}
            Quiz Performance Trend
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Attempt scores and rolling 7-day average</p>
        </div>

        <div className="flex-1 w-full min-h-[220px] mt-4">
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No quiz attempts logged yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<TrendTooltip />} />
                <Area
                  name="Quiz Score"
                  type="monotone"
                  dataKey="score"
                  stroke="#818cf8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#scoreGrad)"
                />
                <Line
                  name="7-Day Rolling Avg"
                  type="monotone"
                  dataKey="rollingAverage"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Trend Direction Card */}
      <div className="w-full md:w-[220px] flex flex-col justify-center gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/10">
        <div className="text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Average Accuracy</p>
          <h4 className="text-4xl font-extrabold text-slate-100 mt-1">{currentAverage}%</h4>
        </div>

        <div className={`p-3 rounded-lg border text-xs ${trendDetails.color}`}>
          <div className="flex items-center gap-1.5 font-bold mb-1">
            {getTrendIcon()}
            <span>{trendDetails.title}</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">{trendDetails.desc}</p>
        </div>

        <div className="flex items-start gap-1.5 text-[10px] text-slate-500 leading-normal">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>Rolling average factors the score weightage of previous attempts over a moving 7-day window.</span>
        </div>
      </div>
    </motion.div>
  );
}
