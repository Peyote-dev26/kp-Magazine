const express = require('express');
const { mockData } = require('../data/mockData');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { isConfigured } = require('../config/supabase');
const { listAuthors, getAuthor, createAuthor, updateAuthor, deleteAuthor } = require('../data/supabaseData');

const router = express.Router();

router.get('/', async (req, res) => {
  if (isConfigured) {
    try { return res.json({ authors: await listAuthors() }); }
    catch (error) { return res.status(503).json({ message: 'Author service is unavailable.' }); }
  }
  return res.json({ authors: mockData.authors });
});

router.get('/:id', async (req, res) => {
  if (isConfigured) {
    try {
      const author = await getAuthor(req.params.id);
      if (!author) return res.status(404).json({ message: 'Author not found.' });
      return res.json({ author });
    } catch (error) { return res.status(503).json({ message: 'Author service is unavailable.' }); }
  }
  const author = mockData.authors.find((entry) => entry.id === req.params.id);
  if (!author) {
    return res.status(404).json({ message: 'Author not found.' });
  }

  return res.json({ author });
});

router.post('/', authenticateToken, requireRole('super_admin', 'editor'), async (req, res) => {
  if (isConfigured) {
    try { return res.status(201).json({ message: 'Author created.', author: await createAuthor(req.body) }); }
    catch (error) { return res.status(400).json({ message: 'Author could not be created.' }); }
  }
  const author = {
    id: `auth-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  mockData.authors.push(author);
  return res.status(201).json({ message: 'Author created.', author });
});

router.put('/:id', authenticateToken, requireRole('super_admin', 'editor'), async (req, res) => {
  if (isConfigured) {
    try { return res.json({ message: 'Author updated.', author: await updateAuthor(req.params.id, req.body) }); }
    catch (error) { return res.status(400).json({ message: 'Author could not be updated.' }); }
  }
  const index = mockData.authors.findIndex((entry) => entry.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Author not found.' });
  }

  mockData.authors[index] = { ...mockData.authors[index], ...req.body };
  return res.json({ message: 'Author updated.', author: mockData.authors[index] });
});

router.delete('/:id', authenticateToken, requireRole('super_admin', 'editor'), async (req, res) => {
  if (isConfigured) {
    try {
      if (!await deleteAuthor(req.params.id)) return res.status(404).json({ message: 'Author not found.' });
      return res.json({ message: 'Author deleted.' });
    } catch (error) { return res.status(400).json({ message: 'Author could not be deleted.' }); }
  }
  const exists = mockData.authors.some((entry) => entry.id === req.params.id);
  if (!exists) {
    return res.status(404).json({ message: 'Author not found.' });
  }

  mockData.authors = mockData.authors.filter((entry) => entry.id !== req.params.id);
  return res.json({ message: 'Author deleted.' });
});

module.exports = router;
