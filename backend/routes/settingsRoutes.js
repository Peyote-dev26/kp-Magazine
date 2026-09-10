const express = require('express');
const { mockData } = require('../data/mockData');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireRole('super_admin'));

router.get('/', (req, res) => res.json({ settings: mockData.settings }));
router.put('/', (req, res) => {
  mockData.settings = { ...mockData.settings, ...req.body };
  return res.json({ message: 'Settings updated.', settings: mockData.settings });
});

module.exports = router;
