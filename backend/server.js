const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

const { testConnection } = require('./config/db');
const { testSupabaseConnection } = require('./config/supabase');
const { seedAdminUser } = require('./data/mockData');
const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const authorRoutes = require('./routes/authorRoutes');
const videoRoutes = require('./routes/videoRoutes');
const commentRoutes = require('./routes/commentRoutes');
const userRoutes = require('./routes/userRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const contactRoutes = require('./routes/contactRoutes');
const adminRoutes = require('./routes/adminRoutes');
const advertisementRoutes = require('./routes/advertisementRoutes');
const sponsorRoutes = require('./routes/sponsorRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const auditRoutes = require('./routes/auditRoutes');
const { authenticateToken } = require('./middleware/auth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS.'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    message: 'KP MAGAZINES API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/advertisements', authenticateToken, advertisementRoutes);
app.use('/api/sponsors', authenticateToken, sponsorRoutes);
app.use('/api/subscriptions', authenticateToken, subscriptionRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);
app.use('/api/settings', authenticateToken, settingsRoutes);
app.use('/api/audit-logs', authenticateToken, auditRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? undefined : error.message,
  });
});

async function startServer() {
  await seedAdminUser();
  const dbStatus = await testConnection();
  const supabaseStatus = await testSupabaseConnection();
  console.log('Database connection:', dbStatus ? 'connected' : 'legacy PostgreSQL unavailable');
  console.log('Supabase status:', supabaseStatus.ready ? 'connected and schema ready' : supabaseStatus.reason);

  app.listen(PORT, () => {
    console.log(`KP MAGAZINES backend running on http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = app;
