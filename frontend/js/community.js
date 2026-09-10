async function loadCommunityDashboard(expectedRole) {
  try {
    const data = await apiRequest('/auth/me', {
      method: 'GET',
      headers: getHeadersWithAuth(),
    });
    const user = data.user;

    if (expectedRole && user.role !== expectedRole) {
      window.location.href = user.role === 'contributor' ? 'contributor.html' : 'reader.html';
      return;
    }

    document.getElementById('community-name').textContent = `${user.firstName} ${user.lastName}`.trim();
    document.getElementById('community-email').textContent = user.email;
    document.getElementById('community-role').textContent = user.role;
  } catch (error) {
    clearAuthToken();
    window.location.href = 'login.html';
  }
}

document.getElementById('logout-button')?.addEventListener('click', () => {
  clearAuthToken();
  window.location.href = 'index.html';
});
