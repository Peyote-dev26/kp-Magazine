const isLocalStaticServer = window.location.hostname === 'localhost'
  && ['5500', '5501'].includes(window.location.port);
const API_BASE_URL = window.KP_API_BASE_URL
  || (isLocalStaticServer ? `http://${window.location.hostname}:5000/api` : '/api');

async function apiRequest(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  };

  if (config.body && typeof config.body !== 'string') {
    config.body = JSON.stringify(config.body);
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  } catch (error) {
    throw new Error('Unable to reach the KP MAGAZINES API. Start the backend server and try again.');
  }
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

function setAuthToken(token) {
  localStorage.setItem('kp_magazines_token', token);
}

function getAuthToken() {
  return localStorage.getItem('kp_magazines_token');
}

function clearAuthToken() {
  localStorage.removeItem('kp_magazines_token');
}

function getHeadersWithAuth() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function showMessage(message, type = 'success') {
  let dialog = document.getElementById('message-dialog');
  if (!dialog) {
    dialog = document.createElement('div');
    dialog.id = 'message-dialog';
    dialog.className = 'message-dialog';
    dialog.setAttribute('role', 'status');
    dialog.innerHTML = '<div class="message-dialog-panel"><button class="message-dialog-close" type="button" aria-label="Close">&times;</button><p class="message-dialog-text"></p></div>';
    document.body.appendChild(dialog);
    dialog.querySelector('.message-dialog-close').addEventListener('click', () => dialog.remove());
  }
  dialog.classList.toggle('is-error', type === 'error');
  dialog.querySelector('.message-dialog-text').textContent = message;
  return dialog;
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.brand-block').forEach((brand) => {
    brand.classList.add('brand-link');
    brand.setAttribute('role', 'link');
    brand.setAttribute('tabindex', '0');
    const homePath = window.location.pathname.includes('/admin/') ? '../frontend/index.html' : 'index.html';
    const goHome = () => { window.location.href = homePath; };
    brand.addEventListener('click', goHome);
    brand.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') goHome();
    });
  });
});
