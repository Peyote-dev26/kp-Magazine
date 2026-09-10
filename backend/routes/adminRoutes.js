const express = require('express');
const { mockData } = require('../data/mockData');
const { requireRole } = require('../middleware/auth');
const { isConfigured } = require('../config/supabase');
const { getDashboardOverview } = require('../data/supabaseData');

const router = express.Router();

router.use(requireRole('super_admin', 'editor'));

router.get('/overview', async (req, res) => {
  if (isConfigured) {
    try { return res.json(await getDashboardOverview()); }
    catch (error) { return res.status(503).json({ message: 'Dashboard data is unavailable.' }); }
  }
  const publishedArticles = mockData.articles.filter((article) => article.status === 'published').length;
  const drafts = mockData.articles.filter((article) => article.status === 'draft').length;
  const scheduled = mockData.articles.filter((article) => article.status === 'scheduled').length;
  const totalViews = mockData.articles.reduce((sum, article) => sum + (article.views || 0), 0);

  res.json({
    overview: {
      totalArticles: mockData.articles.length,
      publishedArticles,
      drafts,
      scheduled,
      users: mockData.users.length,
      subscribers: mockData.newsletterSubscribers.length,
      comments: mockData.comments.length,
      articleViews: totalViews,
      videoViews: mockData.videos.reduce((sum, video) => sum + (video.views || 0), 0),
    },
    recentArticles: mockData.articles.slice(0, 5),
    homepageSections: mockData.homepageSections,
  });
});

router.get('/homepage', (req, res) => {
  return res.json({ homepageSections: mockData.homepageSections });
});

router.put('/homepage', (req, res) => {
  mockData.homepageSections = req.body.homepageSections || mockData.homepageSections;
  return res.json({ message: 'Homepage settings updated.', homepageSections: mockData.homepageSections });
});

module.exports = router;
