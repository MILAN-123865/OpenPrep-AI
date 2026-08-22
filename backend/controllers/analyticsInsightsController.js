/**
 * @fileoverview Controller for the Study Analytics & Performance Insights Dashboard.
 */

const analyticsInsightsService = require('../services/analyticsInsightsService');

/**
 * @desc    Get consolidated overview of study analytics
 * @route   GET /api/analytics-insights/overview
 * @access  Private
 */
const getOverviewHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const overview = await analyticsInsightsService.getOverview(userId);
    res.status(200).json({
      success: true,
      data: overview,
    });
  } catch (error) {
    console.error('Error fetching overview insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve study insights overview.',
    });
  }
};

/**
 * @desc    Get weekly study overview (questions, flashcards, focus minutes)
 * @route   GET /api/analytics-insights/weekly-overview
 * @access  Private
 */
const getWeeklyOverviewHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const weeklyData = await analyticsInsightsService.getWeeklyOverview(userId);
    res.status(200).json({
      success: true,
      data: weeklyData,
    });
  } catch (error) {
    console.error('Error fetching weekly study overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve weekly study overview.',
    });
  }
};

/**
 * @desc    Get subject mastery grid progress data
 * @route   GET /api/analytics-insights/subject-mastery
 * @access  Private
 */
const getSubjectMasteryHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const masteryData = await analyticsInsightsService.getSubjectMastery(userId);
    res.status(200).json({
      success: true,
      data: masteryData,
    });
  } catch (error) {
    console.error('Error fetching subject mastery insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve subject mastery insights.',
    });
  }
};

/**
 * @desc    Get quiz score trend and rolling average calculations
 * @route   GET /api/analytics-insights/quiz-trend
 * @access  Private
 */
const getQuizTrendHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const trendData = await analyticsInsightsService.getQuizTrend(userId);
    res.status(200).json({
      success: true,
      data: trendData,
    });
  } catch (error) {
    console.error('Error fetching quiz score trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve quiz score trends.',
    });
  }
};

/**
 * @desc    Get 24-hour study pattern heatmap data
 * @route   GET /api/analytics-insights/activity-pattern
 * @access  Private
 */
const getActivityPatternHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const patternData = await analyticsInsightsService.getActivityPattern(userId);
    res.status(200).json({
      success: true,
      data: patternData,
    });
  } catch (error) {
    console.error('Error fetching study time pattern:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve study time patterns.',
    });
  }
};

/**
 * @desc    Get priority-sorted study recommendations
 * @route   GET /api/analytics-insights/recommendations
 * @access  Private
 */
const getRecommendationsHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const recommendations = await analyticsInsightsService.getRecommendations(userId);
    res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error('Error fetching personalized recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve personalized study recommendations.',
    });
  }
};

module.exports = {
  getOverviewHandler,
  getWeeklyOverviewHandler,
  getSubjectMasteryHandler,
  getQuizTrendHandler,
  getActivityPatternHandler,
  getRecommendationsHandler,
};
