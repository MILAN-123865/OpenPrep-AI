/**
 * @fileoverview Service for aggregating study metrics and generating performance insights.
 * Aggregates data across QuizAttempt, FocusSession, Flashcard, Progress, and ActivityLog models.
 */

const {
  QuizAttempt,
  FocusSession,
  Flashcard,
  Progress,
  ActivityLog,
  Subject,
  Quiz,
  StudyPlan
} = require('../models');
const { Op } = require('sequelize');

/**
 * Get daily study overview for the last 7 days.
 * Includes quiz questions solved, flashcards reviewed, and focus minutes.
 * @param {string} userId - UUID of the user.
 * @returns {Promise<Array<Object>>} List of daily study statistics.
 */
const getWeeklyOverview = async (userId) => {
  const weeklyData = [];
  const today = new Date();
  
  // Calculate start date (7 days ago, normalized to midnight)
  const startDate = new Date();
  startDate.setDate(today.getDate() - 6);
  startDate.setHours(0, 0, 0, 0);

  // Fetch all QuizAttempts in the last 7 days
  const quizAttempts = await QuizAttempt.findAll({
    where: {
      user: userId,
      createdAt: {
        [Op.gte]: startDate,
      },
    },
  });

  // Fetch all flashcard reviews in the last 7 days from ActivityLog
  const flashcardLogs = await ActivityLog.findAll({
    where: {
      user: userId,
      activityType: 'flashcard_review',
      createdAt: {
        [Op.gte]: startDate,
      },
    },
  });

  // Fetch all FocusSessions in the last 7 days
  const focusSessions = await FocusSession.findAll({
    where: {
      user: userId,
      createdAt: {
        [Op.gte]: startDate,
      },
    },
  });

  // Helper arrays for dates
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Initialize and populate 7 days
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date();
    currentDate.setDate(today.getDate() - (6 - i));
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayName = daysOfWeek[currentDate.getDay()];

    // Filter data for current date
    const dailyQuizzes = quizAttempts.filter(q => {
      const qDateStr = new Date(q.createdAt).toISOString().split('T')[0];
      return qDateStr === dateStr;
    });

    const dailyFlashcards = flashcardLogs.filter(f => {
      const fDateStr = new Date(f.createdAt).toISOString().split('T')[0];
      return fDateStr === dateStr;
    });

    const dailyFocus = focusSessions.filter(s => {
      const sDateStr = new Date(s.createdAt).toISOString().split('T')[0];
      return sDateStr === dateStr;
    });

    // Sum quiz questions
    const quizQuestions = dailyQuizzes.reduce((sum, q) => sum + (q.totalQuestions || 0), 0);

    // Sum flashcards reviewed: count the logs.
    // (If the description indicates an import of multiple cards, we could parse it,
    // but counting logs or using an SM-2 check is standard. Let's count reviews)
    let flashcardsCount = dailyFlashcards.length;
    // Inspect description to see if multiple cards were reviewed or generated
    dailyFlashcards.forEach(log => {
      const match = log.description.match(/(\d+)\s+flashcard/);
      if (match) {
        flashcardsCount += parseInt(match[1], 10) - 1; // already counted 1 for the log entry itself
      }
    });

    // Sum focus minutes
    const focusSeconds = dailyFocus.reduce((sum, s) => sum + (s.activeSeconds || 0), 0);
    const focusMinutes = Math.round((focusSeconds / 60) * 10) / 10;

    weeklyData.push({
      date: dateStr,
      name: dayName,
      quizQuestions,
      flashcards: Math.max(0, flashcardsCount),
      focusMinutes,
    });
  }

  return weeklyData;
};

/**
 * Get subject mastery grid data.
 * Lists all subjects with progress, quiz scores, and flashcard metrics to decide mastery level.
 * @param {string} userId - UUID of the user.
 * @returns {Promise<Array<Object>>} Subject mastery list.
 */
const getSubjectMastery = async (userId) => {
  // Fetch all user subjects
  const subjects = await Subject.findAll({
    where: { user: userId },
  });

  if (!subjects.length) {
    return [];
  }

  const subjectIds = subjects.map(s => s.id);

  // Fetch subject progress records
  const progresses = await Progress.findAll({
    where: {
      user: userId,
      subject: { [Op.in]: subjectIds },
      topic: null, // subject-level progress
    },
  });

  // Fetch all user QuizAttempts
  const quizAttempts = await QuizAttempt.findAll({
    where: { user: userId },
    include: [
      {
        model: Quiz,
        as: 'quizRef',
        attributes: ['id', 'subject'],
      },
    ],
  });

  // Fetch user flashcard counts grouped by subject
  const flashcards = await Flashcard.findAll({
    where: { user: userId },
  });

  // Process mastery for each subject
  const masteryGrid = subjects.map(subj => {
    const progress = progresses.find(p => p.subject === subj.id);
    const completionPercentage = progress ? progress.completionPercentage : 0;
    
    // Filter attempts for this subject
    const subjectAttempts = quizAttempts.filter(att => att.quizRef && att.quizRef.subject === subj.id);
    const quizAverage = subjectAttempts.length > 0
      ? subjectAttempts.reduce((sum, att) => sum + att.score, 0) / subjectAttempts.length
      : null;

    // Flashcards stats
    const subjectFlashcards = flashcards.filter(f => f.subject === subj.id);
    const totalFlashcards = subjectFlashcards.length;
    // Flashcard is mastered if interval > 3 or reps > 2
    const masteredFlashcards = subjectFlashcards.filter(f => f.repetitions > 2 || f.interval > 3).length;

    // Calculate dynamic subject mastery percentage
    let masteryPercentage = 0;
    if (quizAverage !== null) {
      // 60% quiz performance, 40% completion
      masteryPercentage = (quizAverage * 0.6) + (completionPercentage * 0.4);
    } else {
      masteryPercentage = completionPercentage;
    }

    // Limit range
    masteryPercentage = Math.min(100, Math.max(0, masteryPercentage));

    // Determine badge and difficulty recommendations
    let badge = 'Needs Work';
    if (masteryPercentage >= 85) {
      badge = 'Mastered';
    } else if (masteryPercentage >= 70) {
      badge = 'Proficient';
    } else if (masteryPercentage >= 50) {
      badge = 'Developing';
    }

    return {
      subjectId: subj.id,
      subjectName: subj.name,
      completionPercentage: Math.round(completionPercentage),
      quizAverage: quizAverage !== null ? Math.round(quizAverage) : 0,
      totalFlashcards,
      flashcardsMastered: progress ? progress.flashcardsMastered : masteredFlashcards,
      mastery: Math.round(masteryPercentage),
      badge,
    };
  });

  return masteryGrid;
};

/**
 * Get quiz score trends with 7-day rolling averages and trend directions.
 * @param {string} userId - UUID of the user.
 * @returns {Promise<Object>} Trend data including list of attempts and trend details.
 */
const getQuizTrend = async (userId) => {
  // Fetch user's quiz attempts in chronological order
  const attempts = await QuizAttempt.findAll({
    where: { user: userId },
    order: [['createdAt', 'ASC']],
    include: [
      {
        model: Quiz,
        as: 'quizRef',
        attributes: ['id', 'title'],
      },
    ],
  });

  if (!attempts.length) {
    return {
      attempts: [],
      direction: 'stable',
      currentAverage: 0,
    };
  }

  // Calculate rolling averages
  const trends = attempts.map((attempt, index) => {
    const attemptDate = new Date(attempt.createdAt);
    
    // Find all attempts in the 7 days preceding this attempt (inclusive)
    const sevenDaysAgo = new Date(attemptDate);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const windowAttempts = attempts.slice(0, index + 1).filter(att => {
      const d = new Date(att.createdAt);
      return d >= sevenDaysAgo && d <= attemptDate;
    });

    const sum = windowAttempts.reduce((s, att) => s + att.score, 0);
    const rollingAverage = windowAttempts.length > 0 ? sum / windowAttempts.length : attempt.score;

    return {
      id: attempt.id,
      quizTitle: attempt.quizRef ? attempt.quizRef.title : 'Practice Quiz',
      score: Math.round(attempt.score),
      rollingAverage: Math.round(rollingAverage),
      date: attempt.createdAt.toISOString().split('T')[0],
    };
  });

  // Calculate current average
  const totalScore = attempts.reduce((sum, att) => sum + att.score, 0);
  const currentAverage = Math.round(totalScore / attempts.length);

  // Compute trend direction (up / down / stable)
  // Compare the average of last 3 attempts with average of the 3 attempts prior to that
  let direction = 'stable';
  if (attempts.length >= 2) {
    const recentCount = Math.min(3, Math.ceil(attempts.length / 2));
    const recentAttempts = attempts.slice(-recentCount);
    const olderAttempts = attempts.slice(-2 * recentCount, -recentCount);

    const recentAvg = recentAttempts.reduce((s, a) => s + a.score, 0) / recentAttempts.length;
    const olderAvg = olderAttempts.length > 0
      ? olderAttempts.reduce((s, a) => s + a.score, 0) / olderAttempts.length
      : currentAverage;

    const diff = recentAvg - olderAvg;
    if (diff > 2) {
      direction = 'up';
    } else if (diff < -2) {
      direction = 'down';
    }
  }

  return {
    attempts: trends,
    direction,
    currentAverage,
  };
};

/**
 * Calculates hourly activity counts to generate a study intensity heatmap.
 * Analyzes ActivityLog and FocusSession models.
 * @param {string} userId - UUID of the user.
 * @returns {Promise<Object>} Heatmap grid and peak hours description.
 */
const getActivityPattern = async (userId) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  // Fetch activities and focus sessions from the last 30 days
  const [activities, focusSessions] = await Promise.all([
    ActivityLog.findAll({
      where: {
        user: userId,
        createdAt: { [Op.gte]: thirtyDaysAgo },
      },
    }),
    FocusSession.findAll({
      where: {
        user: userId,
        createdAt: { [Op.gte]: thirtyDaysAgo },
      },
    }),
  ]);

  // Initialize hourly counters
  const hourlyCounts = Array.from({ length: 24 }, (_, i) => {
    let displayHour = '';
    if (i === 0) displayHour = '12 AM';
    else if (i === 12) displayHour = '12 PM';
    else if (i > 12) displayHour = `${i - 12} PM`;
    else displayHour = `${i} AM`;

    let period = 'Night';
    if (i >= 6 && i < 12) period = 'Morning';
    else if (i >= 12 && i < 18) period = 'Afternoon';
    else if (i >= 18 && i < 24) period = 'Evening';

    return {
      hour: i,
      displayHour,
      count: 0,
      period,
    };
  });

  // Helper to extract hour and increment count
  const processTimestamp = (createdAt) => {
    const d = new Date(createdAt);
    const hour = d.getHours(); // Local hour of execution environment
    hourlyCounts[hour].count += 1;
  };

  activities.forEach(act => processTimestamp(act.createdAt));
  focusSessions.forEach(sess => processTimestamp(sess.createdAt));

  // Determine Peak Hour
  let peakHour = 0;
  let maxCount = 0;
  hourlyCounts.forEach(h => {
    if (h.count > maxCount) {
      maxCount = h.count;
      peakHour = h.hour;
    }
  });

  // Calculate Period totals to find Peak Period
  const periods = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
  hourlyCounts.forEach(h => {
    periods[h.period] += h.count;
  });

  let peakPeriod = 'Morning';
  let maxPeriodCount = 0;
  Object.keys(periods).forEach(p => {
    if (periods[p] > maxPeriodCount) {
      maxPeriodCount = periods[p];
      peakPeriod = p;
    }
  });

  return {
    pattern: hourlyCounts,
    peakHour: hourlyCounts[peakHour].displayHour,
    peakPeriod,
  };
};

/**
 * Generate AI-powered priority-sorted recommendations.
 * @param {string} userId - UUID of the user.
 * @returns {Promise<Array<Object>>} Recommended study actions.
 */
const getRecommendations = async (userId) => {
  const recommendations = [];

  // Query performance data to base advice on
  const [subjects, studyPlans, focusSessions, flashcards] = await Promise.all([
    getSubjectMastery(userId),
    StudyPlan.findAll({ where: { user: userId, status: 'active' } }),
    FocusSession.findAll({ where: { user: userId }, limit: 10, order: [['createdAt', 'DESC']] }),
    Flashcard.findAll({ where: { user: userId } }),
  ]);

  // 1. Check for weak subjects
  const weakSubjects = subjects.filter(s => s.mastery < 65);
  if (weakSubjects.length > 0) {
    // Sort so lowest score is recommended first
    weakSubjects.sort((a, b) => a.mastery - b.mastery);
    const target = weakSubjects[0];
    recommendations.push({
      id: 'weak-subject-quiz',
      title: `Practice ${target.subjectName}`,
      description: `Your mastery in ${target.subjectName} is currently ${target.mastery}%. Take a short quiz to reinforce concepts.`,
      priority: 'high',
      actionLabel: 'Take Quiz',
      actionUrl: `/quizzes?subjectId=${target.subjectId}`,
      category: 'quiz',
    });
  }

  // 2. Check for missing study plans
  if (studyPlans.length === 0) {
    recommendations.push({
      id: 'create-study-plan',
      title: 'Define Weekly Milestones',
      description: 'You do not have an active study plan. Creating clear goals boosts memory retention and exam preparation consistency.',
      priority: 'high',
      actionLabel: 'Create Study Plan',
      actionUrl: '/study-plans',
      category: 'study_plan',
    });
  }

  // 3. Check for due flashcards
  const totalCards = flashcards.length;
  if (totalCards > 0) {
    const dueCards = flashcards.filter(f => new Date(f.nextReviewDate) <= new Date());
    if (dueCards.length > 0) {
      recommendations.push({
        id: 'review-flashcards',
        title: `Review Due Flashcards`,
        description: `You have ${dueCards.length} flashcards waiting for review. Maintain your SM-2 spacing interval for optimal recall.`,
        priority: dueCards.length > 10 ? 'high' : 'medium',
        actionLabel: 'Review Now',
        actionUrl: '/flashcards',
        category: 'flashcard',
      });
    }
  } else {
    recommendations.push({
      id: 'create-flashcards',
      title: 'Build Active Recall Decks',
      description: 'You have not created any flashcards yet. Generate AI flashcards from your uploaded study materials to get started.',
      priority: 'medium',
      actionLabel: 'Generate Flashcards',
      actionUrl: '/flashcards',
      category: 'flashcard',
    });
  }

  // 4. Focus session fatigue review
  const totalFocusSeconds = focusSessions.reduce((sum, s) => sum + (s.activeSeconds || 0), 0);
  if (focusSessions.length === 0 || totalFocusSeconds < 3600) {
    recommendations.push({
      id: 'start-focus-session',
      title: 'Initiate Focus Time',
      description: 'Incorporate deep-work focus blocks into your routine. Start a 25-minute Pomodoro study block to establish habits.',
      priority: 'medium',
      actionLabel: 'Start Session',
      actionUrl: '/focus',
      category: 'focus',
    });
  }

  // 5. Default recommendations in case user data is highly complete
  if (recommendations.length < 3) {
    recommendations.push({
      id: 'quiz-revision',
      title: 'Review Missed Questions',
      description: 'Reinforce learning by retaking previously incorrect questions from your quiz history.',
      priority: 'low',
      actionLabel: 'Review History',
      actionUrl: '/quizzes',
      category: 'quiz',
    });
  }

  // Map priority weight to sort recommendations cleanly (high -> medium -> low)
  const priorityWeights = { high: 3, medium: 2, low: 1 };
  recommendations.sort((a, b) => priorityWeights[b.priority] - priorityWeights[a.priority]);

  return recommendations;
};

/**
 * Returns a consolidated study insights view.
 * @param {string} userId - UUID of the user.
 * @returns {Promise<Object>} Aggregated dashboard datasets.
 */
const getOverview = async (userId) => {
  const [weeklyOverview, subjectMastery, quizTrend, activityPattern, recommendations] = await Promise.all([
    getWeeklyOverview(userId),
    getSubjectMastery(userId),
    getQuizTrend(userId),
    getActivityPattern(userId),
    getRecommendations(userId),
  ]);

  return {
    weeklyOverview,
    subjectMastery,
    quizTrend,
    activityPattern,
    recommendations,
  };
};

module.exports = {
  getWeeklyOverview,
  getSubjectMastery,
  getQuizTrend,
  getActivityPattern,
  getRecommendations,
  getOverview,
};
