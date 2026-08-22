import React from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle2, Award as BadgeIcon } from 'lucide-react';

const BadgeColors = {
  'Mastered': 'bg-emerald-950/60 text-emerald-400 border-emerald-800',
  'Proficient': 'bg-indigo-950/60 text-indigo-400 border-indigo-800',
  'Developing': 'bg-amber-950/60 text-amber-400 border-amber-800',
  'Needs Work': 'bg-rose-950/60 text-rose-400 border-rose-800',
};

const StrokeColors = {
  'Mastered': '#10b981',
  'Proficient': '#6366f1',
  'Developing': '#f59e0b',
  'Needs Work': '#f43f5e',
};

export default function SubjectMasteryGrid({ data = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="p-5 rounded-2xl border border-slate-800 bg-slate-950/40 backdrop-blur-xl shadow-lg flex flex-col"
    >
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-400" />
          Subject Mastery levels
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">Aggregated scores and course completion percentages</p>
      </div>

      {data.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center text-xs text-slate-500">
          No subjects created yet
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((subj, index) => {
            const radius = 32;
            const stroke = 6;
            const normalizedRadius = radius - stroke * 2;
            const circumference = normalizedRadius * 2 * Math.PI;
            const strokeDashoffset = circumference - (subj.mastery / 100) * circumference;

            return (
              <motion.div
                key={subj.subjectId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 flex items-center gap-4 hover:border-slate-700 transition"
              >
                {/* Circular Progress Ring */}
                <div className="relative flex items-center justify-center w-16 h-16 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      className="text-slate-800"
                      strokeWidth={stroke}
                      stroke="currentColor"
                      fill="transparent"
                      r={normalizedRadius}
                      cx={radius}
                      cy={radius}
                    />
                    <circle
                      strokeWidth={stroke}
                      strokeDasharray={circumference + ' ' + circumference}
                      style={{ strokeDashoffset }}
                      strokeLinecap="round"
                      stroke={StrokeColors[subj.badge] || '#6366f1'}
                      fill="transparent"
                      r={normalizedRadius}
                      cx={radius}
                      cy={radius}
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-slate-200">
                    {subj.mastery}%
                  </span>
                </div>

                {/* Subject Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className="text-xs font-semibold text-slate-200 truncate" title={subj.subjectName}>
                      {subj.subjectName}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${BadgeColors[subj.badge] || 'bg-slate-800 text-slate-400'}`}>
                      {subj.badge}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-slate-500" />
                      <span>Completion: <strong>{subj.completionPercentage}%</strong></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BadgeIcon className="w-3 h-3 text-slate-500" />
                      <span>Quiz Avg: <strong>{subj.quizAverage}%</strong></span>
                    </div>
                    <div className="col-span-2 mt-0.5 text-[9px] text-slate-500">
                      Flashcards Mastered: <strong className="text-slate-300">{subj.flashcardsMastered}</strong> / {subj.totalFlashcards}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
