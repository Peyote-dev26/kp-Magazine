const bcrypt = require('bcryptjs');

const mockData = {
  users: [],
  roles: ['super_admin', 'editor', 'author', 'moderator', 'member', 'reader', 'contributor'],
  categories: [
    { id: 'cat-1', name: 'Lifestyle', slug: 'lifestyle', description: 'Living well, daily rituals, city culture.' },
    { id: 'cat-2', name: 'Entertainment', slug: 'entertainment', description: 'Film, music, TV and culture.' },
    { id: 'cat-3', name: 'Culture', slug: 'culture', description: 'Ideas, identity, heritage and design.' },
    { id: 'cat-4', name: 'People', slug: 'people', description: 'Profiles, voices and personal stories.' },
    { id: 'cat-5', name: 'Career', slug: 'career', description: 'Growth, work and ambition.' },
    { id: 'cat-6', name: 'Business', slug: 'business', description: 'Markets, strategy and scale.' },
    { id: 'cat-7', name: 'Technology', slug: 'technology', description: 'Innovation, AI and digital life.' },
    { id: 'cat-8', name: 'News & Trends', slug: 'news-trends', description: 'What is changing and why it matters.' },
    { id: 'cat-9', name: 'Interviews', slug: 'interviews', description: 'High-signal conversations.' },
    { id: 'cat-10', name: 'Features', slug: 'features', description: 'Long-form journalism and analysis.' },
    { id: 'cat-11', name: 'Opinion', slug: 'opinion', description: 'Perspectives and commentary.' },
  ],
  authors: [
    { id: 'auth-1', name: 'Amina Okafor', bio: 'Culture editor covering modern identity and media.', social: { x: '@amina', instagram: '@amina' }, articles: 4 },
    { id: 'auth-2', name: 'Daniel Brooks', bio: 'Business columnist focused on strategy and leadership.', social: {}, articles: 6 },
    { id: 'auth-3', name: 'Sofia Morgan', bio: 'Technology contributor blending product and policy.', social: {}, articles: 3 },
  ],
  articles: [
    {
      id: 'art-1',
      title: 'Inside the new creative economy',
      slug: 'inside-the-new-creative-economy',
      subtitle: 'How independent publishers are building sustainable audiences.',
      excerpt: 'A look at how editorial brands are building trust, revenue, and community in a fragmented media environment.',
      categoryId: 'cat-10',
      authorId: 'auth-1',
      status: 'published',
      coverImage: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
      body: '<p>Editorial businesses are finding profitable routes by focusing on audience intimacy, product relevance, and monetized trust.</p><p>In the new creative economy, the strongest brands combine reporting, community building, and lifestyle storytelling.</p>',
      featured: true,
      trending: true,
      tags: ['media', 'culture', 'creators'],
      seoTitle: 'Inside the new creative economy',
      seoDescription: 'How independent media brands build trust, audiences, and revenue in a digital-first era.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      views: 1240,
    },
    {
      id: 'art-2',
      title: 'What leadership looks like in a hybrid world',
      slug: 'what-leadership-looks-like-in-a-hybrid-world',
      subtitle: 'Teams are adapting to trust-first management models.',
      excerpt: 'A practical guide to leading remote teams without losing momentum.',
      categoryId: 'cat-6',
      authorId: 'auth-2',
      status: 'published',
      coverImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
      body: '<p>Modern leadership is increasingly tied to clarity, autonomy, and sustainable performance.</p>',
      featured: false,
      trending: true,
      tags: ['leadership', 'work', 'hybrid'],
      seoTitle: 'What leadership looks like in a hybrid world',
      seoDescription: 'Hybrid leadership requires tact, clarity, and systems designed for distributed teams.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      views: 980,
    },
    {
      id: 'art-3',
      title: 'The rise of AI-assisted journalism',
      slug: 'the-rise-of-ai-assisted-journalism',
      subtitle: 'Editors are balancing speed with editorial responsibility.',
      excerpt: 'AI unlocks production efficiencies while raising questions around accountability and trust.',
      categoryId: 'cat-7',
      authorId: 'auth-3',
      status: 'draft',
      coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      body: '<p>AI can accelerate research and drafting, but the strongest brands remain human-led.</p>',
      featured: false,
      trending: false,
      tags: ['ai', 'journalism', 'future'],
      seoTitle: 'The rise of AI-assisted journalism',
      seoDescription: 'AI changes the newsroom workflow, but editorial judgment remains essential.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: null,
      views: 0,
    },
  ],
  videos: [
    { id: 'vid-1', title: 'The future of creative studios', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'Features', thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80', views: 4200 },
    { id: 'vid-2', title: 'Business leaders on trust', videoUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U', category: 'Business', thumbnail: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=1200&q=80', views: 3200 }
  ],
  comments: [
    { id: 'com-1', articleId: 'art-1', user: 'Jane Doe', message: 'This is a thoughtful framing of the creative economy.', approved: true },
    { id: 'com-2', articleId: 'art-2', user: 'Moyo', message: 'The hybrid leadership guidance is practical and clear.', approved: true }
  ],
  newsletterSubscribers: [
    { id: 'sub-1', email: 'reader@example.com', status: 'active' },
    { id: 'sub-2', email: 'member@example.com', status: 'active' }
  ],
  contactMessages: [
    { id: 'cm-1', name: 'Nora A.', email: 'nora@example.com', message: 'Love the idea of premium editorial storytelling.' }
  ],
  advertisements: [
    { id: 'ad-1', name: 'Home banner', placement: 'homepage', status: 'active', destinationUrl: 'https://example.com' },
    { id: 'ad-2', name: 'Article sidebar', placement: 'article_sidebar', status: 'active', destinationUrl: 'https://example.com' }
  ],
  sponsors: [
    { id: 's-1', name: 'Northstar Studio', tier: 'Gold', website: 'https://example.com', status: 'active' }
  ],
  subscriptions: [
    { id: 'sub-3', userId: 'user-1', plan: 'Premium', status: 'active', startDate: new Date().toISOString(), renewalDate: new Date().toISOString(), paymentStatus: 'pending' }
  ],
  analytics: [
    { id: 'an-1', date: new Date().toISOString(), pageViews: 1200, userRegistrations: 18, newsletterRegistrations: 9, engagement: 72 }
  ],
  homepageSections: [
    { id: 'hp-1', type: 'hero', title: 'The new creative economy', articleId: 'art-1' },
    { id: 'hp-2', type: 'featured', title: 'Featured stories' },
    { id: 'hp-3', type: 'trending', title: 'Trending' }
  ],
  settings: {
    siteName: 'KP MAGAZINES',
    tagline: 'Premium editorial intelligence for modern life.'
  },
  auditLogs: [
    { id: 'log-1', action: 'Created article', user: 'admin@kpmagazines.com', createdAt: new Date().toISOString() }
  ]
};

async function seedAdminUser() {
  const adminExists = mockData.users.some((user) => user.email === 'admin@kpmagazines.com');
  if (!adminExists) {
    const passwordHash = await bcrypt.hash('kpopen123', 10);
    mockData.users.push({
      id: 'user-1',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@kpmagazines.com',
      role: 'super_admin',
      password: passwordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}

module.exports = {
  mockData,
  seedAdminUser,
};
