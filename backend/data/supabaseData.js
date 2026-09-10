const { supabase, supabaseAuth, isConfigured } = require('../config/supabase');

function mapArticle(row) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    subtitle: row.subtitle,
    excerpt: row.excerpt,
    categoryId: row.category_id,
    authorId: row.author_id,
    status: row.status,
    coverImage: row.cover_image,
    body: row.body,
    featured: row.featured,
    trending: row.trending,
    tags: row.tags || [],
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    scheduledAt: row.scheduled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
    views: row.views || 0,
  };
}

function toArticleRow(payload, userId) {
  return {
    id: payload.id,
    title: payload.title,
    slug: payload.slug || String(payload.title || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    subtitle: payload.subtitle || '',
    excerpt: payload.excerpt || '',
    category_id: payload.categoryId || null,
    author_id: payload.authorId || null,
    status: payload.status || 'draft',
    cover_image: payload.coverImage || null,
    body: payload.body || '',
    featured: Boolean(payload.featured),
    trending: Boolean(payload.trending),
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    seo_title: payload.seoTitle || null,
    seo_description: payload.seoDescription || null,
    scheduled_at: payload.scheduledAt || null,
    created_by: userId || null,
  };
}

async function listArticles({ status, category, query, includePrivate = false } = {}) {
  if (!isConfigured) return null;
  const client = includePrivate ? supabase : supabaseAuth;
  let request = client.from('articles').select('*').order('created_at', { ascending: false });
  if (status) request = request.eq('status', status);
  if (category) request = request.eq('category_id', category);
  if (query) {
    const escaped = query.replace(/,/g, ' ');
    request = request.or(`title.ilike.%${escaped}%,excerpt.ilike.%${escaped}%`);
  }
  const { data, error } = await request;
  if (error) throw error;
  return (data || []).map(mapArticle);
}

async function getArticle(id, includePrivate = false) {
  if (!isConfigured) return null;
  const client = includePrivate ? supabase : supabaseAuth;
  const { data, error } = await client.from('articles').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapArticle(data) : null;
}

async function createArticle(payload, userId) {
  const { data, error } = await supabase.from('articles').insert(toArticleRow(payload, userId)).select('*').single();
  if (error) throw error;
  return mapArticle(data);
}

async function updateArticle(id, payload) {
  const updates = {};
  const fields = {
    title: 'title', slug: 'slug', subtitle: 'subtitle', excerpt: 'excerpt', categoryId: 'category_id',
    authorId: 'author_id', status: 'status', coverImage: 'cover_image', body: 'body', featured: 'featured',
    trending: 'trending', tags: 'tags', seoTitle: 'seo_title', seoDescription: 'seo_description', scheduledAt: 'scheduled_at',
  };
  Object.entries(fields).forEach(([input, column]) => {
    if (Object.prototype.hasOwnProperty.call(payload, input)) updates[column] = payload[input];
  });
  if (Object.prototype.hasOwnProperty.call(updates, 'featured')) updates.featured = Boolean(updates.featured);
  if (Object.prototype.hasOwnProperty.call(updates, 'trending')) updates.trending = Boolean(updates.trending);
  updates.updated_at = new Date().toISOString();
  const { data, error } = await supabase.from('articles').update(updates).eq('id', id).select('*').single();
  if (error) throw error;
  return mapArticle(data);
}

async function updateArticleStatus(id, status) {
  const updates = { status, updated_at: new Date().toISOString() };
  if (status === 'published') updates.published_at = new Date().toISOString();
  const { data, error } = await supabase.from('articles').update(updates).eq('id', id).select('*').single();
  if (error) throw error;
  return mapArticle(data);
}

async function deleteArticle(id) {
  const { error, count } = await supabase.from('articles').delete({ count: 'exact' }).eq('id', id);
  if (error) throw error;
  return count > 0;
}

async function getProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('id, first_name, last_name, role').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

function mapCategory(row) {
  return { id: row.id, name: row.name, slug: row.slug, description: row.description, createdAt: row.created_at };
}

function mapAuthor(row) {
  return { id: row.id, name: row.name, bio: row.bio, social: row.social || {}, profileId: row.profile_id, createdAt: row.created_at };
}

async function listCategories() {
  const { data, error } = await supabaseAuth.from('categories').select('*').order('name');
  if (error) throw error;
  return (data || []).map(mapCategory);
}

async function createCategory(payload) {
  const { data, error } = await supabase.from('categories').insert({
    id: payload.id || `cat-${Date.now()}`,
    name: payload.name,
    slug: payload.slug,
    description: payload.description || '',
  }).select('*').single();
  if (error) throw error;
  return mapCategory(data);
}

async function updateCategory(id, payload) {
  const { data, error } = await supabase.from('categories').update({
    name: payload.name,
    slug: payload.slug,
    description: payload.description || '',
  }).eq('id', id).select('*').single();
  if (error) throw error;
  return mapCategory(data);
}

async function deleteCategory(id) {
  const { data, error } = await supabase.from('categories').delete().eq('id', id).select('id');
  if (error) throw error;
  return Boolean(data?.length);
}

async function listAuthors() {
  const { data, error } = await supabaseAuth.from('authors').select('*').order('name');
  if (error) throw error;
  return (data || []).map(mapAuthor);
}

async function getAuthor(id) {
  const { data, error } = await supabaseAuth.from('authors').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapAuthor(data) : null;
}

async function createAuthor(payload) {
  const { data, error } = await supabase.from('authors').insert({
    id: payload.id || `auth-${Date.now()}`,
    name: payload.name,
    bio: payload.bio || '',
    social: payload.social || {},
    profile_id: payload.profileId || null,
  }).select('*').single();
  if (error) throw error;
  return mapAuthor(data);
}

async function updateAuthor(id, payload) {
  const { data, error } = await supabase.from('authors').update({
    name: payload.name,
    bio: payload.bio || '',
    social: payload.social || {},
    profile_id: payload.profileId || null,
  }).eq('id', id).select('*').single();
  if (error) throw error;
  return mapAuthor(data);
}

async function deleteAuthor(id) {
  const { data, error } = await supabase.from('authors').delete().eq('id', id).select('id');
  if (error) throw error;
  return Boolean(data?.length);
}

async function createNewsletterSubscriber(email) {
  const { data, error } = await supabase.from('newsletter_subscribers').insert({ email, status: 'active' }).select('*').single();
  if (error) throw error;
  return data;
}

async function listNewsletterSubscribers() {
  const { data, error } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function deleteNewsletterSubscriber(id) {
  const { data, error } = await supabase.from('newsletter_subscribers').delete().eq('id', id).select('id');
  if (error) throw error;
  return Boolean(data?.length);
}

async function createContactMessage(payload) {
  const { data, error } = await supabase.from('contact_messages').insert({
    name: payload.name,
    email: payload.email,
    message: payload.message,
  }).select('*').single();
  if (error) throw error;
  return data;
}

async function listContactMessages() {
  const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function getDashboardOverview() {
  const counts = await Promise.all([
    supabase.from('articles').select('id, status, views', { count: 'exact' }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
    supabase.from('comments').select('id', { count: 'exact', head: true }),
    supabase.from('videos').select('id, views', { count: 'exact' }),
    supabase.from('homepage_sections').select('*').order('sort_order'),
  ]);
  const [articles, profiles, subscribers, comments, videos, homepage] = counts;
  const failure = counts.find((result) => result.error);
  if (failure) throw failure.error;
  const articleRows = articles.data || [];
  const videoRows = videos.data || [];
  return {
    overview: {
      totalArticles: articles.count || 0,
      publishedArticles: articleRows.filter((row) => row.status === 'published').length,
      drafts: articleRows.filter((row) => row.status === 'draft').length,
      scheduled: articleRows.filter((row) => row.status === 'scheduled').length,
      users: profiles.count || 0,
      subscribers: subscribers.count || 0,
      comments: comments.count || 0,
      articleViews: articleRows.reduce((sum, row) => sum + (row.views || 0), 0),
      videoViews: videoRows.reduce((sum, row) => sum + (row.views || 0), 0),
    },
    recentArticles: articleRows.slice(0, 5).map(mapArticle),
    homepageSections: homepage.data || [],
  };
}

module.exports = {
  getProfile,
  listArticles,
  getArticle,
  createArticle,
  updateArticle,
  updateArticleStatus,
  deleteArticle,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listAuthors,
  getAuthor,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  createNewsletterSubscriber,
  listNewsletterSubscribers,
  deleteNewsletterSubscriber,
  createContactMessage,
  listContactMessages,
  getDashboardOverview,
};
