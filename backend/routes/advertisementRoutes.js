const express = require('express');
const { mockData } = require('../data/mockData');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireRole('super_admin', 'editor'));

router.get('/', (req, res) => res.json({ advertisements: mockData.advertisements }));
router.post('/', (req, res) => {
  const ad = { id: `ad-${Date.now()}`, ...req.body };
  mockData.advertisements.push(ad);
  return res.status(201).json({ message: 'Advertisement created.', advertisement: ad });
});
router.put('/:id', (req, res) => {
  const index = mockData.advertisements.findIndex((entry) => entry.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Advertisement not found.' });
  mockData.advertisements[index] = { ...mockData.advertisements[index], ...req.body };
  return res.json({ message: 'Advertisement updated.', advertisement: mockData.advertisements[index] });
});
router.delete('/:id', (req, res) => {
  const before = mockData.advertisements.length;
  mockData.advertisements = mockData.advertisements.filter((entry) => entry.id !== req.params.id);
  if (before === mockData.advertisements.length) return res.status(404).json({ message: 'Advertisement not found.' });
  return res.json({ message: 'Advertisement deleted.' });
});

module.exports = router;
