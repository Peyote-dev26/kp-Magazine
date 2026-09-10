const express = require('express');
const { mockData } = require('../data/mockData');

const router = express.Router();

router.get('/', (req, res) => {
  return res.json({ users: mockData.users.map((user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  })) });
});

router.get('/:id', (req, res) => {
  const user = mockData.users.find((entry) => entry.id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  return res.json({ user: {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  } });
});

router.put('/:id', (req, res) => {
  const index = mockData.users.findIndex((entry) => entry.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'User not found.' });
  }

  mockData.users[index] = { ...mockData.users[index], ...req.body, updatedAt: new Date().toISOString() };
  return res.json({ message: 'User updated.', user: mockData.users[index] });
});

router.delete('/:id', (req, res) => {
  const exists = mockData.users.some((entry) => entry.id === req.params.id);
  if (!exists) {
    return res.status(404).json({ message: 'User not found.' });
  }

  mockData.users = mockData.users.filter((entry) => entry.id !== req.params.id);
  return res.json({ message: 'User deleted.' });
});

module.exports = router;
