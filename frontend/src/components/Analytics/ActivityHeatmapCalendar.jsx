import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Sun, Moon, Sunrise, Sunset } from 'lucide-react';

const PeriodIcons = {
  'Morning': <Sunrise className="w-4 h-4 text-amber-400" />,
  'Afternoon': <Sun className="w-4 h-4 text-orange-400" />,
  'Evening': <Sunset className="w-4 h-4 text-indigo-400" />,
  'Night': <Moon className="w-4 h-4 text-sky-400" />,
};

const PeriodBg = {
  'Morning': 'bg-amber-950/20 border-amber-900/40 text-amber-300',
  'Afternoon': 'bg-orange-950/20 border-orange-900/40 text-orange-300',
  'Evening': 'bg-indigo-950/20 border-indigo-900/40 text-indigo-300',
  'Night': 'bg-sky-950/20 border-sky-900/40 text-sky-300',
};

export default function ActivityHeatmapCalendar({ data = [], peakHour = '12 PM', peakPeriod = 'Afternoon' }) {
  // Find max count to normalize color mapping
  const maxCount = Math.max(...data.map(d => d.count), 1);

  const getHeatmapClass = (count) => {
    if (count === 0) return 'bg-slate-950 border-slate-900 text-slate-700';
    
    const percentage = count / maxCount;
    if (percentage <= 0.25) return 'bg-indigo-950/40 border-indigo-900/40 text-indigo-400';
    if (percentage <= 0.5) return 'bg-indigo-900/60 border-indigo-800/60 text-indigo-300';
    if (percentage <= 0.75) return 'bg-indigo-700/80 border-indigo-600/80 text-indigo-100';
    return 'bg-indigo-600 border-indigo-500 text-white font-bold shadow-md shadow-indigo-500/10';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="p-5 rounded-2xl border border-slate-800 bg-slate-950/40 backdrop-blur-xl shadow-lg flex flex-col h-auto min-h-[380px]"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            Activity Time Pattern
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Study hour intensity over a 24-hour cycle</p>
        </div>

        {/* Peak stats badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">Peak Hour:</span>
            <strong className="text-slate-200">{peakHour}</strong>
          </div>
          
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] ${PeriodBg[peakPeriod] || 'border-slate-800 bg-slate-900/60 text-slate-200'}`}>
            {PeriodIcons[peakPeriod] || <Sun className="w-3.5 h-3.5" />}
            <span className="opacity-90">Peak Period:</span>
            <strong className="font-bold">{peakPeriod}</strong>
          </div>
        </div>
      </div>

      {/* Grid of 24 Hour blocks */}
      <div className="flex-1 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3 min-h-[180px] items-center">
        {data.map((item, index) => (
          <motion.div
            key={item.hour}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.015 }}
            className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center relative group transition cursor-default ${getHeatmapClass(item.count)}`}
          >
            <span className="text-[10px] opacity-60 uppercase font-semibold">{item.displayHour}</span>
            <span className="text-sm font-extrabold mt-1">{item.count}</span>

            {/* Hover Tooltip inside heat cell */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-[10px] text-slate-200 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-xl z-10">
              {item.count} activities in {item.period}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3 mt-6 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
        <span>Less Intensity</span>
        <div className="flex items-center gap-1">
          <div className="w-3.5 h-3.5 rounded border border-slate-900 bg-slate-950" />
          <div className="w-3.5 h-3.5 rounded border border-indigo-900/40 bg-indigo-950/40" />
          <div className="w-3.5 h-3.5 rounded border border-indigo-800/60 bg-indigo-900/60" />
          <div className="w-3.5 h-3.5 rounded border border-indigo-600 bg-indigo-700" />
          <div className="w-3.5 h-3.5 rounded border border-indigo-500 bg-indigo-600" />
        </div>
        <span>More Intensity</span>
      </div>
    </motion.div>
  );
}
