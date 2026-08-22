const express = require('express');
const {
  getOverviewHandler,
  getWeeklyOverviewHandler,
  getSubjectMasteryHandler,
  getQuizTrendHandler,
  getActivityPatternHandler,
  getRecommendationsHandler,
} = require('../controllers/analyticsInsightsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all endpoints
router.use(protect);

router.get('/overview', getOverviewHandler);
router.get('/weekly-overview', getWeeklyOverviewHandler);
router.get('/subject-mastery', getSubjectMasteryHandler);
router.get('/quiz-trend', getQuizTrendHandler);
router.get('/activity-pattern', getActivityPatternHandler);
router.get('/recommendations', getRecommendationsHandler);

module.exports = router;
