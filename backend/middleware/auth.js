const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const dotenv = require('dotenv');
const { supabase } = require('../config/supabase');

dotenv.config();

const configuredJwtSecret = process.env.JWT_SECRET;
if (process.env.NODE_ENV === 'production' && (!configuredJwtSecret || configuredJwtSecret.startsWith('replace_with_'))) {
  throw new Error('JWT_SECRET must be configured in production.');
}
const JWT_SECRET = configuredJwtSecret && !configuredJwtSecret.startsWith('replace_with_')
  ? configuredJwtSecret
  : crypto.randomBytes(32).toString('hex');

function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function issueToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (jwtError) {
      if (!supabase) return res.status(401).json({ message: 'Invalid or expired token.' });

      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data.user) return res.status(401).json({ message: 'Invalid or expired token.' });

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, first_name, last_name')
        .eq('id', data.user.id)
        .maybeSingle();

      req.user = {
        id: data.user.id,
        email: data.user.email,
        role: profile?.role || 'member',
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
      };
      return next();
    }
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action.' });
    }
    return next();
  };
}

async function optionalAuthenticateToken(req, res, next) {
  if (!req.headers.authorization) return next();
  return authenticateToken(req, res, next);
}

module.exports = {
  hashPassword,
  comparePassword,
  issueToken,
  authenticateToken,
  optionalAuthenticateToken,
  requireRole,
};
