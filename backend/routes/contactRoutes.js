const express = require('express');
const { mockData } = require('../data/mockData');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { isConfigured } = require('../config/supabase');
const { createContactMessage, listContactMessages } = require('../data/supabaseData');

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email and message are required.' });
  }

  if (isConfigured) {
    try { return res.status(201).json({ message: 'Message sent successfully.', contactMessage: await createContactMessage({ name, email, message }) }); }
    catch (error) { return res.status(400).json({ message: 'Message could not be sent.' }); }
  }

  const contactMessage = {
    id: `cm-${Date.now()}`,
    name,
    email,
    message,
    createdAt: new Date().toISOString(),
  };

  mockData.contactMessages.push(contactMessage);
  return res.status(201).json({ message: 'Message sent successfully.', contactMessage });
});

router.get('/', authenticateToken, requireRole('super_admin', 'editor'), async (req, res) => {
  if (isConfigured) {
    try { return res.json({ messages: await listContactMessages() }); }
    catch (error) { return res.status(503).json({ message: 'Contact service is unavailable.' }); }
  }
  return res.json({ messages: mockData.contactMessages });
});

module.exports = router;
