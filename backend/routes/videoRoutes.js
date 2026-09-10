const express = require('express');
const { mockData } = require('../data/mockData');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  return res.json({ videos: mockData.videos });
});

router.get('/:id', (req, res) => {
  const video = mockData.videos.find((entry) => entry.id === req.params.id);
  if (!video) {
    return res.status(404).json({ message: 'Video not found.' });
  }

  return res.json({ video });
});

router.post('/', authenticateToken, requireRole('super_admin', 'editor'), (req, res) => {
  const video = {
    id: `vid-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  mockData.videos.push(video);
  return res.status(201).json({ message: 'Video created.', video });
});

router.put('/:id', authenticateToken, requireRole('super_admin', 'editor'), (req, res) => {
  const index = mockData.videos.findIndex((entry) => entry.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Video not found.' });
  }

  mockData.videos[index] = { ...mockData.videos[index], ...req.body };
  return res.json({ message: 'Video updated.', video: mockData.videos[index] });
});

router.delete('/:id', authenticateToken, requireRole('super_admin', 'editor'), (req, res) => {
  const exists = mockData.videos.some((entry) => entry.id === req.params.id);
  if (!exists) {
    return res.status(404).json({ message: 'Video not found.' });
  }

  mockData.videos = mockData.videos.filter((entry) => entry.id !== req.params.id);
  return res.json({ message: 'Video deleted.' });
});

module.exports = router;
