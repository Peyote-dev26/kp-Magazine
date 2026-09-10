document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      try {
        const data = await apiRequest('/auth/login', {
          method: 'POST',
          headers: getHeadersWithAuth(),
          body: { email, password },
        });

        setAuthToken(data.token);
        if (data.user.role === 'contributor') {
          window.location.href = 'contributor.html';
        } else if (data.user.role === 'reader') {
          window.location.href = 'reader.html';
        } else {
          window.location.href = 'profile.html';
        }
      } catch (error) {
        alert(error.message);
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const firstName = document.getElementById('register-first-name').value;
      const lastName = document.getElementById('register-last-name').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      const role = document.getElementById('register-role').value;

      try {
        const data = await apiRequest('/auth/register', {
          method: 'POST',
          body: { firstName, lastName, email, password, role },
          headers: getHeadersWithAuth(),
        });

        setAuthToken(data.token);
        window.location.href = data.user.role === 'contributor' ? 'contributor.html' : 'reader.html';
      } catch (error) {
        alert(error.message);
      }
    });
  }
});
