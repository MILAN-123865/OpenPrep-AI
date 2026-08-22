import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Brain,
  Clock,
  BookOpen,
  Calendar,
  AlertCircle,
} from 'lucide-react';

const CategoryIcons = {
  quiz: <Brain className="w-4 h-4 text-purple-400" />,
  flashcard: <BookOpen className="w-4 h-4 text-pink-400" />,
  focus: <Clock className="w-4 h-4 text-amber-400" />,
  study_plan: <Calendar className="w-4 h-4 text-sky-400" />,
};

const PriorityBorders = {
  high: 'border-rose-950/80 bg-rose-950/10 hover:border-rose-800 text-rose-200',
  medium: 'border-amber-950/80 bg-amber-950/10 hover:border-amber-800 text-amber-200',
  low: 'border-slate-800 bg-slate-900/10 hover:border-slate-700 text-slate-200',
};

const PriorityBadges = {
  high: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
  medium: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
  low: 'bg-slate-800 border-slate-700 text-slate-400',
};

export default function StudyRecommendations({ data = [] }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="p-5 rounded-2xl border border-slate-800 bg-slate-950/40 backdrop-blur-xl shadow-lg flex flex-col"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            AI Study Recommendations
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Priority study actions tailored to your performance trends</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-[150px] flex items-center justify-center text-xs text-slate-500 gap-1.5">
          <AlertCircle className="w-4 h-4 text-slate-600" />
          No recommendations available at this time
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${PriorityBorders[rec.priority] || 'border-slate-800'}`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-850 flex-shrink-0 mt-0.5">
                  {CategoryIcons[rec.category] || <Sparkles className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-slate-100">{rec.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${PriorityBadges[rec.priority]}`}>
                      {rec.priority} Priority
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xl">
                    {rec.description}
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(rec.actionUrl)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition self-start sm:self-auto cursor-pointer shadow-md shadow-indigo-600/10"
              >
                <span>{rec.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
