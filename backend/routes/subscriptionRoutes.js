const express = require('express');
const { mockData } = require('../data/mockData');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => res.json({ subscriptions: mockData.subscriptions }));
router.post('/', (req, res) => {
  const subscription = { id: `subs-${Date.now()}`, ...req.body };
  mockData.subscriptions.push(subscription);
  return res.status(201).json({ message: 'Subscription created.', subscription });
});
router.put('/:id', requireRole('super_admin', 'editor'), (req, res) => {
  const index = mockData.subscriptions.findIndex((entry) => entry.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Subscription not found.' });
  mockData.subscriptions[index] = { ...mockData.subscriptions[index], ...req.body };
  return res.json({ message: 'Subscription updated.', subscription: mockData.subscriptions[index] });
});
router.delete('/:id', requireRole('super_admin', 'editor'), (req, res) => {
  const before = mockData.subscriptions.length;
  mockData.subscriptions = mockData.subscriptions.filter((entry) => entry.id !== req.params.id);
  if (before === mockData.subscriptions.length) return res.status(404).json({ message: 'Subscription not found.' });
  return res.json({ message: 'Subscription deleted.' });
});

module.exports = router;
