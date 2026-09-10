const express = require('express');
const { mockData } = require('../data/mockData');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireRole('super_admin'));

router.get('/', (req, res) => res.json({ logs: mockData.auditLogs }));
router.post('/', (req, res) => {
  const log = { id: `log-${Date.now()}`, ...req.body };
  mockData.auditLogs.push(log);
  return res.status(201).json({ message: 'Audit log created.', log });
});

module.exports = router;
