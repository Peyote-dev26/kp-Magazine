const express = require('express');
const { mockData } = require('../data/mockData');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireRole('super_admin', 'editor'));

router.get('/', (req, res) => res.json({ analytics: mockData.analytics }));
router.post('/', (req, res) => {
  const payload = { id: `an-${Date.now()}`, ...req.body };
  mockData.analytics.push(payload);
  return res.status(201).json({ message: 'Analytics record created.', analytics: payload });
});

module.exports = router;
