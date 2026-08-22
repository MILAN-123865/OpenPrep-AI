import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, LayoutDashboard, AlertTriangle, Sparkles } from 'lucide-react';
import API from '../services/api';

// Import subcomponents
import WeeklyStudyOverview from '../components/Analytics/WeeklyStudyOverview';
import SubjectMasteryGrid from '../components/Analytics/SubjectMasteryGrid';
import QuizTrendChart from '../components/Analytics/QuizTrendChart';
import ActivityHeatmapCalendar from '../components/Analytics/ActivityHeatmapCalendar';
import StudyRecommendations from '../components/Analytics/StudyRecommendations';

export default function StudyAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const response = await API.get('/analytics-insights/overview');
      if (response.data && response.data.success) {
        setData(response.data.data);
      } else {
        throw new Error(response.data?.message || 'Failed to retrieve metrics.');
      }
    } catch (err) {
      console.error('Error fetching study analytics:', err);
      setError(err.message || 'An unexpected error occurred while loading your metrics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Premium Skeleton Loading States
  const renderSkeleton = () => (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="h-10 w-64 bg-slate-900 animate-pulse rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[400px] bg-slate-900/60 animate-pulse rounded-2xl border border-slate-800" />
        <div className="h-[400px] bg-slate-900/60 animate-pulse rounded-2xl border border-slate-800" />
      </div>
      <div className="h-[280px] bg-slate-900/60 animate-pulse rounded-2xl border border-slate-800" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-[380px] lg:col-span-2 bg-slate-900/60 animate-pulse rounded-2xl border border-slate-800" />
        <div className="h-[380px] bg-slate-900/60 animate-pulse rounded-2xl border border-slate-800" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between pt-16">
        {renderSkeleton()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 pb-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
              <LayoutDashboard className="w-6 h-6 text-indigo-400" />
              Study Analytics & Insights
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Personalized data-driven trends to optimize your learning strategy.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-850 bg-slate-900/60 hover:bg-slate-900 text-xs font-semibold text-slate-200 cursor-pointer disabled:opacity-55 transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Insights'}</span>
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 rounded-2xl border border-rose-950 bg-rose-950/10 text-center max-w-md mx-auto my-12"
            >
              <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-rose-300">Data Fetch Failed</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{error}</p>
              <button
                onClick={() => fetchAnalytics()}
                className="mt-4 px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition cursor-pointer"
              >
                Retry Request
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Row 1: Weekly overview & Quiz accuracy trend */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WeeklyStudyOverview data={data?.weeklyOverview} />
                <QuizTrendChart
                  data={data?.quizTrend?.attempts}
                  direction={data?.quizTrend?.direction}
                  currentAverage={data?.quizTrend?.currentAverage}
                />
              </div>

              {/* Row 2: Subject Mastery grid */}
              <SubjectMasteryGrid data={data?.subjectMastery} />

              {/* Row 3: Activity Pattern Heatmap & AI Recommendations */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ActivityHeatmapCalendar
                    data={data?.activityPattern?.pattern}
                    peakHour={data?.activityPattern?.peakHour}
                    peakPeriod={data?.activityPattern?.peakPeriod}
                  />
                </div>
                <div className="lg:col-span-1">
                  <StudyRecommendations data={data?.recommendations} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
