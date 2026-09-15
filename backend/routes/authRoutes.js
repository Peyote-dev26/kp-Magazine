const express = require('express');
const bcrypt = require('bcryptjs');
const { mockData } = require('../data/mockData');
const { hashPassword, comparePassword, issueToken, authenticateToken } = require('../middleware/auth');
const { supabase, supabaseAuth, isConfigured, hasPartialConfiguration } = require('../config/supabase');
const { getProfile } = require('../data/supabaseData');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, role = 'reader' } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'Please provide first name, last name, email and password.' });
  }

  if (!['reader', 'contributor'].includes(role)) {
    return res.status(400).json({ message: 'Please choose a reader or contributor account.' });
  }

  if (hasPartialConfiguration && !isConfigured) {
    return res.status(503).json({ message: 'Authentication service is not configured.' });
  }

  if (isConfigured) {
    const { data, error } = await supabaseAuth.auth.signUp({ email, password, options: { data: { first_name: firstName, last_name: lastName } } });
    if (error) return res.status(400).json({ message: error.message });
    if (!data.user) return res.status(400).json({ message: 'Registration could not be completed.' });

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      first_name: firstName,
      last_name: lastName,
      role,
    });
    if (profileError) return res.status(503).json({ message: 'Account created, but profile setup is incomplete.' });

    return res.status(201).json({
      message: 'Registration successful.',
      token: data.session?.access_token || null,
      user: { id: data.user.id, firstName, lastName, email: data.user.email, role },
    });
  }

  const existingUser = mockData.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(409).json({ message: 'A user with that email already exists.' });
  }

  const passwordHash = await hashPassword(password);
  const user = {
    id: `user-${Date.now()}`,
    firstName,
    lastName,
    email,
    role,
    password: passwordHash,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockData.users.push(user);
  const token = issueToken(user);

  return res.status(201).json({
    message: 'Registration successful.',
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  if (hasPartialConfiguration && !isConfigured) {
    return res.status(503).json({ message: 'Authentication service is not configured.' });
  }

  if (isConfigured) {
    const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      const localUser = mockData.users.find((entry) => entry.email.toLowerCase() === email.toLowerCase());
      if (localUser && await comparePassword(password, localUser.password)) {
        return res.json({
          message: 'Login successful.',
          token: issueToken(localUser),
          user: {
            id: localUser.id,
            firstName: localUser.firstName,
            lastName: localUser.lastName,
            email: localUser.email,
            role: localUser.role,
          },
        });
      }
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const profile = await getProfile(data.user.id);
    return res.json({
      message: 'Login successful.',
      token: data.session.access_token,
      user: {
        id: data.user.id,
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
        email: data.user.email,
        role: profile?.role || 'member',
      },
    });
  }

  const user = mockData.users.find((entry) => entry.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = issueToken(user);
  return res.json({
    message: 'Login successful.',
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  return res.json({ message: 'Password reset instructions sent to your email.' });
});

router.get('/me', authenticateToken, async (req, res) => {
  if (hasPartialConfiguration && !isConfigured) {
    return res.status(503).json({ message: 'Authentication service is not configured.' });
  }

  if (isConfigured) {
    const profile = await getProfile(req.user.id);
    return res.json({ user: { id: req.user.id, firstName: profile?.first_name || '', lastName: profile?.last_name || '', email: req.user.email, role: profile?.role || 'member' } });
  }

  const user = mockData.users.find((entry) => entry.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  return res.json({
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  });
});
router.get('/test', (req, res) => {
  res.json({
    ok: true,
    message: 'Auth routes are working'
  });
});
module.exports = router;
