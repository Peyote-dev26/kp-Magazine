const express = require('express');
const { mockData } = require('../data/mockData');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { isConfigured } = require('../config/supabase');
const { listNewsletterSubscribers, createNewsletterSubscriber, deleteNewsletterSubscriber } = require('../data/supabaseData');

const router = express.Router();

router.get('/', authenticateToken, requireRole('super_admin', 'editor'), async (req, res) => {
  if (isConfigured) {
    try { return res.json({ subscribers: await listNewsletterSubscribers() }); }
    catch (error) { return res.status(503).json({ message: 'Newsletter service is unavailable.' }); }
  }
  return res.json({ subscribers: mockData.newsletterSubscribers });
});

router.post('/subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  if (isConfigured) {
    try { return res.status(201).json({ message: 'Subscribed successfully.', subscriber: await createNewsletterSubscriber(email) }); }
    catch (error) { if (error.code === '23505') return res.status(409).json({ message: 'This email is already subscribed.' }); return res.status(400).json({ message: 'Subscription could not be created.' }); }
  }

  const exists = mockData.newsletterSubscribers.some((entry) => entry.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(409).json({ message: 'This email is already subscribed.' });
  }

  const subscriber = {
    id: `sub-${Date.now()}`,
    email,
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  mockData.newsletterSubscribers.push(subscriber);
  return res.status(201).json({ message: 'Subscribed successfully.', subscriber });
});

router.delete('/:id', authenticateToken, requireRole('super_admin', 'editor'), async (req, res) => {
  if (isConfigured) {
    try {
      if (!await deleteNewsletterSubscriber(req.params.id)) return res.status(404).json({ message: 'Subscriber not found.' });
      return res.json({ message: 'Subscriber removed.' });
    } catch (error) { return res.status(400).json({ message: 'Subscriber could not be removed.' }); }
  }
  const exists = mockData.newsletterSubscribers.some((entry) => entry.id === req.params.id);
  if (!exists) {
    return res.status(404).json({ message: 'Subscriber not found.' });
  }

  mockData.newsletterSubscribers = mockData.newsletterSubscribers.filter((entry) => entry.id !== req.params.id);
  return res.json({ message: 'Subscriber removed.' });
});

module.exports = router;
