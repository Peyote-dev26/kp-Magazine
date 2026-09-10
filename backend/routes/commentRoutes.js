const express = require('express');
const { mockData } = require('../data/mockData');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  return res.json({ comments: mockData.comments });
});

router.post('/', (req, res) => {
  const comment = {
    id: `com-${Date.now()}`,
    ...req.body,
    approved: false,
    createdAt: new Date().toISOString(),
  };

  mockData.comments.push(comment);
  return res.status(201).json({ message: 'Comment submitted for moderation.', comment });
});

router.put('/:id', authenticateToken, requireRole('super_admin', 'editor', 'moderator'), (req, res) => {
  const index = mockData.comments.findIndex((entry) => entry.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Comment not found.' });
  }

  mockData.comments[index] = { ...mockData.comments[index], ...req.body };
  return res.json({ message: 'Comment updated.', comment: mockData.comments[index] });
});

router.delete('/:id', authenticateToken, requireRole('super_admin', 'editor', 'moderator'), (req, res) => {
  const exists = mockData.comments.some((entry) => entry.id === req.params.id);
  if (!exists) {
    return res.status(404).json({ message: 'Comment not found.' });
  }

  mockData.comments = mockData.comments.filter((entry) => entry.id !== req.params.id);
  return res.json({ message: 'Comment deleted.' });
});

module.exports = router;
