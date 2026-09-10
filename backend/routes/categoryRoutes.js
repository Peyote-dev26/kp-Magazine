const express = require('express');
const { mockData } = require('../data/mockData');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { isConfigured } = require('../config/supabase');
const { listCategories, createCategory, updateCategory, deleteCategory } = require('../data/supabaseData');

const router = express.Router();

router.get('/', async (req, res) => {
  if (isConfigured) {
    try { return res.json({ categories: await listCategories() }); }
    catch (error) { return res.status(503).json({ message: 'Category service is unavailable.' }); }
  }
  return res.json({ categories: mockData.categories });
});

router.post('/', authenticateToken, requireRole('super_admin', 'editor'), async (req, res) => {
  if (isConfigured) {
    try { return res.status(201).json({ message: 'Category created.', category: await createCategory(req.body) }); }
    catch (error) { return res.status(400).json({ message: 'Category could not be created.' }); }
  }
  const category = {
    id: `cat-${Date.now()}`,
    ...req.body,
  };

  mockData.categories.push(category);
  return res.status(201).json({ message: 'Category created.', category });
});

router.put('/:id', authenticateToken, requireRole('super_admin', 'editor'), async (req, res) => {
  if (isConfigured) {
    try { return res.json({ message: 'Category updated.', category: await updateCategory(req.params.id, req.body) }); }
    catch (error) { return res.status(400).json({ message: 'Category could not be updated.' }); }
  }
  const categoryIndex = mockData.categories.findIndex((entry) => entry.id === req.params.id);
  if (categoryIndex === -1) {
    return res.status(404).json({ message: 'Category not found.' });
  }

  mockData.categories[categoryIndex] = {
    ...mockData.categories[categoryIndex],
    ...req.body,
  };

  return res.json({ message: 'Category updated.', category: mockData.categories[categoryIndex] });
});

router.delete('/:id', authenticateToken, requireRole('super_admin', 'editor'), async (req, res) => {
  if (isConfigured) {
    try {
      if (!await deleteCategory(req.params.id)) return res.status(404).json({ message: 'Category not found.' });
      return res.json({ message: 'Category deleted.' });
    } catch (error) { return res.status(400).json({ message: 'Category could not be deleted.' }); }
  }
  const categoryExists = mockData.categories.some((entry) => entry.id === req.params.id);
  if (!categoryExists) {
    return res.status(404).json({ message: 'Category not found.' });
  }

  mockData.categories = mockData.categories.filter((entry) => entry.id !== req.params.id);
  return res.json({ message: 'Category deleted.' });
});

module.exports = router;
