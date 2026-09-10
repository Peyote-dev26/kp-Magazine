document.addEventListener('DOMContentLoaded', async () => {
  const heroTitle = document.getElementById('hero-title');
  const heroExcerpt = document.getElementById('hero-excerpt');
  const heroCategory = document.getElementById('hero-category');
  const heroAuthor = document.getElementById('hero-author');
  const heroDate = document.getElementById('hero-date');
  const heroImage = document.getElementById('hero-image');
  const latestStories = document.getElementById('latest-stories');
  const trendingList = document.getElementById('trending-list');
  const editorPicks = document.getElementById('editor-picks');
  const featuredVideo = document.getElementById('featured-video');
  const categoryCards = document.getElementById('category-cards');
  const magazineList = document.getElementById('magazine-list');
  const articleCategory = document.getElementById('article-category');
  const articleTitle = document.getElementById('article-title');
  const articleSubtitle = document.getElementById('article-subtitle');
  const articleAuthor = document.getElementById('article-author');
  const articleDate = document.getElementById('article-date');
  const articleReadTime = document.getElementById('article-read-time');
  const articleImage = document.getElementById('article-image');
  const articleBody = document.getElementById('article-body');
  const relatedList = document.getElementById('related-list');
  const filterCategory = document.getElementById('filter-category');
  const filterSearch = document.getElementById('filter-search');
  const filterSort = document.getElementById('filter-sort');

  let loadedArticles = [];
  let categories = [];

  function renderArticleCard(article) {
    const card = document.createElement('article');
    card.className = 'story-card glass-panel';
    card.innerHTML = `
      <img src="${article.coverImage || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80'}" alt="${article.title}" />
      <div>
        <p class="eyebrow accent-text">${article.categoryName || 'Feature'}</p>
        <h4><a href="article.html?id=${article.id}">${article.title}</a></h4>
        <p>${article.excerpt || ''}</p>
        <div class="story-meta">
          <span>${article.authorName || 'Staff'}</span>
          <span>${new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
          <span>${article.views || 0} views</span>
        </div>
      </div>
    `;
    return card;
  }

  async function fetchData() {
    try {
      const [articlesRes, categoriesRes, videosRes] = await Promise.all([
        apiRequest('/articles'),
        apiRequest('/categories'),
        apiRequest('/videos'),
      ]);

      loadedArticles = articlesRes.articles || [];
      categories = categoriesRes.categories || [];
      const videos = videosRes.videos || [];

      if (heroTitle) {
        const featured = loadedArticles.find((article) => article.featured) || loadedArticles[0];
        if (featured) {
          heroTitle.textContent = featured.title;
          heroExcerpt.textContent = featured.excerpt;
          heroCategory.textContent = categories.find((cat) => cat.id === featured.categoryId)?.name || 'Featured';
          heroAuthor.textContent = 'Amina Okafor';
          heroDate.textContent = new Date(featured.publishedAt || featured.createdAt).toLocaleDateString();
          heroImage.src = featured.coverImage;
        }
      }

      if (latestStories) {
        latestStories.innerHTML = '';
        const latest = loadedArticles.slice(0, 4);
        latest.forEach((article) => {
          latestStories.appendChild(renderArticleCard(article));
        });
      }

      if (trendingList) {
        trendingList.innerHTML = '';
        [...loadedArticles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5).forEach((article) => {
          const item = document.createElement('li');
          item.innerHTML = `<a href="article.html?id=${article.id}">${article.title}</a>`;
          trendingList.appendChild(item);
        });
      }

      if (editorPicks) {
        editorPicks.innerHTML = '';
        loadedArticles.filter((article) => article.featured).slice(0, 4).forEach((article) => {
          const item = document.createElement('li');
          item.innerHTML = `<a href="article.html?id=${article.id}">${article.title}</a>`;
          editorPicks.appendChild(item);
        });
      }

      if (featuredVideo) {
        featuredVideo.innerHTML = '';
        videos.slice(0, 3).forEach((video) => {
          const card = document.createElement('article');
          card.className = 'video-card';
          card.innerHTML = `
            <img src="${video.thumbnail}" alt="${video.title}" />
            <div class="card-body">
              <p class="eyebrow accent-text">${video.category}</p>
              <h4>${video.title}</h4>
            </div>
          `;
          featuredVideo.appendChild(card);
        });
      }

      if (categoryCards) {
        categoryCards.innerHTML = '';
        categories.slice(0, 6).forEach((category) => {
          const card = document.createElement('article');
          card.className = 'category-card';
          card.innerHTML = `
            <img src="https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=900&q=80" alt="${category.name}" />
            <div class="card-body">
              <p class="eyebrow accent-text">${category.slug}</p>
              <h4>${category.name}</h4>
            </div>
          `;
          categoryCards.appendChild(card);
        });
      }

      if (filterCategory) {
        filterCategory.innerHTML = '<option value="">All categories</option>';
        categories.forEach((category) => {
          const option = document.createElement('option');
          option.value = category.id;
          option.textContent = category.name;
          filterCategory.appendChild(option);
        });
      }

      if (magazineList) {
        renderMagazineList();
      }

      if (articleTitle) {
        const articleId = new URLSearchParams(window.location.search).get('id');
        const article = loadedArticles.find((entry) => entry.id === articleId) || loadedArticles[0];
        if (article) {
          articleCategory.textContent = categories.find((cat) => cat.id === article.categoryId)?.name || 'Feature';
          articleTitle.textContent = article.title;
          articleSubtitle.textContent = article.subtitle || article.excerpt;
          articleAuthor.textContent = `By ${article.authorName || 'Staff Writer'}`;
          articleDate.textContent = new Date(article.publishedAt || article.createdAt).toLocaleDateString();
          articleReadTime.textContent = `${Math.max(3, Math.round((article.body || '').length / 700))} min read`;
          articleImage.src = article.coverImage;
          articleBody.innerHTML = article.body || '<p>Story content is loading.</p>';

          const related = loadedArticles.filter((entry) => entry.id !== article.id).slice(0, 4);
          relatedList.innerHTML = '';
          related.forEach((entry) => {
            const item = document.createElement('li');
            item.innerHTML = `<a href="article.html?id=${entry.id}">${entry.title}</a>`;
            relatedList.appendChild(item);
          });
        }
      }
    } catch (error) {
      console.error('Unable to load homepage data:', error);
    }
  }

  function renderMagazineList() {
    if (!magazineList) {
      return;
    }

    const categoryFilter = filterCategory ? filterCategory.value : '';
    const searchText = filterSearch ? filterSearch.value.trim().toLowerCase() : '';
    let filtered = [...loadedArticles];

    if (categoryFilter) {
      filtered = filtered.filter((article) => article.categoryId === categoryFilter);
    }

    if (searchText) {
      filtered = filtered.filter((article) =>
        article.title.toLowerCase().includes(searchText) ||
        (article.excerpt || '').toLowerCase().includes(searchText)
      );
    }

    if (filterSort && filterSort.value === 'popular') {
      filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    magazineList.innerHTML = '';
    if (!filtered.length) {
      magazineList.innerHTML = '<p class="empty-state">No stories found.</p>';
      return;
    }

    filtered.forEach((article) => {
      const articleCard = renderArticleCard(article);
      magazineList.appendChild(articleCard);
    });
  }

  if (filterCategory) {
    filterCategory.addEventListener('change', renderMagazineList);
  }

  if (filterSearch) {
    filterSearch.addEventListener('input', renderMagazineList);
  }

  if (filterSort) {
    filterSort.addEventListener('change', renderMagazineList);
  }

  const newsletterButton = document.getElementById('newsletter-button');
  const newsletterForm = document.getElementById('newsletter-form');

  if (newsletterButton) {
    newsletterButton.addEventListener('click', () => {
      const form = document.getElementById('newsletter-email');
      form?.focus();
    });
  }

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('newsletter-email').value;

      try {
        await apiRequest('/newsletter/subscribe', {
          method: 'POST',
          body: { email },
        });
        showMessage('You are subscribed to the KP MAGAZINES newsletter.');
        newsletterForm.reset();
      } catch (error) {
        showMessage(error.message, 'error');
      }
    });
  }

  await fetchData();
});
