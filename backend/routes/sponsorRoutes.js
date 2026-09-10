const express = require('express');
const { mockData } = require('../data/mockData');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireRole('super_admin', 'editor'));

router.get('/', (req, res) => res.json({ sponsors: mockData.sponsors }));
router.post('/', (req, res) => {
  const sponsor = { id: `s-${Date.now()}`, ...req.body };
  mockData.sponsors.push(sponsor);
  return res.status(201).json({ message: 'Sponsor created.', sponsor });
});
router.put('/:id', (req, res) => {
  const index = mockData.sponsors.findIndex((entry) => entry.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Sponsor not found.' });
  mockData.sponsors[index] = { ...mockData.sponsors[index], ...req.body };
  return res.json({ message: 'Sponsor updated.', sponsor: mockData.sponsors[index] });
});
router.delete('/:id', (req, res) => {
  const before = mockData.sponsors.length;
  mockData.sponsors = mockData.sponsors.filter((entry) => entry.id !== req.params.id);
  if (before === mockData.sponsors.length) return res.status(404).json({ message: 'Sponsor not found.' });
  return res.json({ message: 'Sponsor deleted.' });
});

module.exports = router;
