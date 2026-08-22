const analyticsInsightsService = require('../../services/analyticsInsightsService');
const models = require('../../models');

describe('analyticsInsightsService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getWeeklyOverview', () => {
    it('returns 7 days of aggregated metrics', async () => {
      vi.spyOn(models.QuizAttempt, 'findAll').mockResolvedValue([
        { totalQuestions: 10, createdAt: new Date() },
        { totalQuestions: 15, createdAt: new Date() },
      ]);
      vi.spyOn(models.ActivityLog, 'findAll').mockResolvedValue([
        { description: 'Generated 5 flashcards', createdAt: new Date() },
      ]);
      vi.spyOn(models.FocusSession, 'findAll').mockResolvedValue([
        { activeSeconds: 1500, createdAt: new Date() }, // 25 mins
      ]);

      const result = await analyticsInsightsService.getWeeklyOverview('user-1');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(7);
      
      const todayData = result[6];
      expect(todayData.quizQuestions).toBe(25);
      expect(todayData.flashcards).toBe(5);
      expect(todayData.focusMinutes).toBe(25);
    });
  });

  describe('getSubjectMastery', () => {
    it('returns subject mastery rates and corresponding badges', async () => {
      vi.spyOn(models.Subject, 'findAll').mockResolvedValue([
        { id: 'sub-1', name: 'Microbiology' },
      ]);
      vi.spyOn(models.Progress, 'findAll').mockResolvedValue([
        { subject: 'sub-1', completionPercentage: 80, flashcardsMastered: 4, topic: null },
      ]);
      vi.spyOn(models.QuizAttempt, 'findAll').mockResolvedValue([
        { score: 90, quizRef: { id: 'q-1', subject: 'sub-1' } },
      ]);
      vi.spyOn(models.Flashcard, 'findAll').mockResolvedValue([
        { id: 'card-1', subject: 'sub-1', repetitions: 4, interval: 4 },
      ]);

      const result = await analyticsInsightsService.getSubjectMastery('user-1');
      expect(result.length).toBe(1);
      expect(result[0].subjectName).toBe('Microbiology');
      expect(result[0].completionPercentage).toBe(80);
      expect(result[0].quizAverage).toBe(90);
      // mastery = 90 * 0.6 + 80 * 0.4 = 54 + 32 = 86
      expect(result[0].mastery).toBe(86);
      expect(result[0].badge).toBe('Mastered');
    });
  });

  describe('getQuizTrend', () => {
    it('calculates 7-day rolling average and trend direction', async () => {
      vi.spyOn(models.QuizAttempt, 'findAll').mockResolvedValue([
        { id: 'att-1', score: 60, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), quizRef: { title: 'Q1' } },
        { id: 'att-2', score: 80, createdAt: new Date(), quizRef: { title: 'Q2' } },
      ]);

      const result = await analyticsInsightsService.getQuizTrend('user-1');
      expect(result.attempts.length).toBe(2);
      expect(result.currentAverage).toBe(70);
      expect(result.direction).toBe('up'); // from 60 to 80 is up
    });
  });

  describe('getActivityPattern', () => {
    it('bucketizes logs and sessions into a 24 hour heatmap', async () => {
      vi.spyOn(models.ActivityLog, 'findAll').mockResolvedValue([
        { createdAt: new Date('2026-08-22T08:30:00Z') }, // 8 AM UTC -> let's say it resolves to local or UTC hour
      ]);
      vi.spyOn(models.FocusSession, 'findAll').mockResolvedValue([
        { createdAt: new Date('2026-08-22T08:45:00Z') },
      ]);

      const result = await analyticsInsightsService.getActivityPattern('user-1');
      expect(result.pattern.length).toBe(24);
      const hourIndex = new Date('2026-08-22T08:30:00Z').getHours();
      expect(result.pattern[hourIndex].count).toBe(2);
    });
  });

  describe('getRecommendations', () => {
    it('generates prioritised study recommendations based on low mastery scores', async () => {
      vi.spyOn(models.Subject, 'findAll').mockResolvedValue([
        { id: 'sub-1', name: 'Microbiology' },
      ]);
      vi.spyOn(models.Progress, 'findAll').mockResolvedValue([
        { subject: 'sub-1', completionPercentage: 40, flashcardsMastered: 0, topic: null },
      ]);
      vi.spyOn(models.QuizAttempt, 'findAll').mockResolvedValue([
        { score: 45, quizRef: { id: 'q-1', subject: 'sub-1' } },
      ]);
      vi.spyOn(models.Flashcard, 'findAll').mockResolvedValue([]);
      vi.spyOn(models.StudyPlan, 'findAll').mockResolvedValue([]);
      vi.spyOn(models.FocusSession, 'findAll').mockResolvedValue([]);

      const result = await analyticsInsightsService.getRecommendations('user-1');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].priority).toBe('high');
      expect(result[0].category).toBe('quiz'); // target weak subject first
    });
  });
});
