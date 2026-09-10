const express = require('express');
const { mockData } = require('../data/mockData');
const { authenticateToken, optionalAuthenticateToken, requireRole } = require('../middleware/auth');
const { isConfigured, hasPartialConfiguration } = require('../config/supabase');
const { listArticles, getArticle, createArticle, updateArticle, updateArticleStatus, deleteArticle } = require('../data/supabaseData');

const router = express.Router();

router.get('/', optionalAuthenticateToken, async (req, res) => {
  const { status, category, q, search } = req.query;
  if (hasPartialConfiguration && !isConfigured) {
    return res.status(503).json({ message: 'Article service is not configured.' });
  }
  if (isConfigured) {
    try {
      const articles = await listArticles({ status, category, query: q || search, includePrivate: Boolean(req.user) });
      return res.json({ articles });
    } catch (error) {
      console.error('Supabase article list failed:', error.message);
      return res.status(503).json({ message: 'Article service is unavailable. Apply the Supabase schema and try again.' });
    }
  }
  let articles = [...mockData.articles];

  if (status) {
    articles = articles.filter((article) => article.status === status);
  }

  if (category) {
    articles = articles.filter((article) => article.categoryId === category);
  }

  if (q) {
    const query = q.toLowerCase();
    articles = articles.filter((article) =>
      article.title.toLowerCase().includes(query) ||
      article.excerpt.toLowerCase().includes(query) ||
      article.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }

  return res.json({ articles });
});

router.get('/:id', async (req, res) => {
  if (hasPartialConfiguration && !isConfigured) {
    return res.status(503).json({ message: 'Article service is not configured.' });
  }
  if (isConfigured) {
    try {
      const article = await getArticle(req.params.id);
      if (!article) return res.status(404).json({ message: 'Article not found.' });
      return res.json({ article });
    } catch (error) {
      console.error('Supabase article read failed:', error.message);
      return res.status(503).json({ message: 'Article service is unavailable. Apply the Supabase schema and try again.' });
    }
  }

  const article = mockData.articles.find((entry) => entry.id === req.params.id);
  if (!article) {
    return res.status(404).json({ message: 'Article not found.' });
  }

  return res.json({ article });
});

router.post('/', authenticateToken, requireRole('super_admin', 'editor', 'author', 'contributor'), async (req, res) => {
  if (hasPartialConfiguration && !isConfigured) {
    return res.status(503).json({ message: 'Article service is not configured.' });
  }
  if (isConfigured) {
    try {
      const article = await createArticle(req.body, req.user.id);
      return res.status(201).json({ message: 'Article created successfully.', article });
    } catch (error) {
      console.error('Supabase article create failed:', error.message);
      return res.status(400).json({ message: 'Article could not be created.' });
    }
  }

  const article = {
    id: `art-${Date.now()}`,
    ...req.body,
    status: req.body.status || 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    views: 0,
  };

  mockData.articles.unshift(article);
  return res.status(201).json({ message: 'Article created successfully.', article });
});

router.put('/:id', authenticateToken, requireRole('super_admin', 'editor', 'author', 'contributor'), async (req, res) => {
  if (hasPartialConfiguration && !isConfigured) {
    return res.status(503).json({ message: 'Article service is not configured.' });
  }
  if (isConfigured) {
    try {
      const article = await updateArticle(req.params.id, req.body);
      return res.json({ message: 'Article updated successfully.', article });
    } catch (error) {
      console.error('Supabase article update failed:', error.message);
      return res.status(400).json({ message: 'Article could not be updated.' });
    }
  }

  const articleIndex = mockData.articles.findIndex((entry) => entry.id === req.params.id);
  if (articleIndex === -1) {
    return res.status(404).json({ message: 'Article not found.' });
  }

  mockData.articles[articleIndex] = {
    ...mockData.articles[articleIndex],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  return res.json({ message: 'Article updated successfully.', article: mockData.articles[articleIndex] });
});

router.delete('/:id', authenticateToken, requireRole('super_admin', 'editor'), async (req, res) => {
  if (hasPartialConfiguration && !isConfigured) {
    return res.status(503).json({ message: 'Article service is not configured.' });
  }
  if (isConfigured) {
    try {
      if (!await deleteArticle(req.params.id)) return res.status(404).json({ message: 'Article not found.' });
      return res.json({ message: 'Article deleted successfully.' });
    } catch (error) {
      console.error('Supabase article delete failed:', error.message);
      return res.status(400).json({ message: 'Article could not be deleted.' });
    }
  }

  const initialLength = mockData.articles.length;
  mockData.articles = mockData.articles.filter((entry) => entry.id !== req.params.id);

  if (mockData.articles.length === initialLength) {
    return res.status(404).json({ message: 'Article not found.' });
  }

  return res.json({ message: 'Article deleted successfully.' });
});

router.post('/:id/publish', authenticateToken, requireRole('super_admin', 'editor'), async (req, res) => {
  if (hasPartialConfiguration && !isConfigured) {
    return res.status(503).json({ message: 'Article service is not configured.' });
  }
  if (isConfigured) {
    try {
      const article = await updateArticleStatus(req.params.id, 'published');
      return res.json({ message: 'Article published.', article });
    } catch (error) {
      console.error('Supabase article publish failed:', error.message);
      return res.status(400).json({ message: 'Article could not be published.' });
    }
  }

  const article = mockData.articles.find((entry) => entry.id === req.params.id);
  if (!article) {
    return res.status(404).json({ message: 'Article not found.' });
  }

  article.status = 'published';
  article.publishedAt = new Date().toISOString();
  article.updatedAt = new Date().toISOString();

  return res.json({ message: 'Article published.', article });
});

router.post('/:id/unpublish', authenticateToken, requireRole('super_admin', 'editor'), async (req, res) => {
  if (hasPartialConfiguration && !isConfigured) {
    return res.status(503).json({ message: 'Article service is not configured.' });
  }
  if (isConfigured) {
    try {
      const article = await updateArticleStatus(req.params.id, 'draft');
      return res.json({ message: 'Article unpublished.', article });
    } catch (error) {
      console.error('Supabase article unpublish failed:', error.message);
      return res.status(400).json({ message: 'Article could not be unpublished.' });
    }
  }

  const article = mockData.articles.find((entry) => entry.id === req.params.id);
  if (!article) {
    return res.status(404).json({ message: 'Article not found.' });
  }

  article.status = 'draft';
  article.updatedAt = new Date().toISOString();

  return res.json({ message: 'Article unpublished.', article });
});

module.exports = router;
