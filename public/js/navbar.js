// Navbar Logic

document.addEventListener('DOMContentLoaded', async () => {
    const usernameEl = document.getElementById('navUsername');
    const loginLink = document.getElementById('navLoginLink');
    const logoutLink = document.getElementById('navLogoutLink');

    if (usernameEl) {
        try {
            const sessionRes = await fetch('/api/auth/session');
            const sessionData = await sessionRes.json();
            if (sessionData.authenticated) {
                usernameEl.textContent = sessionData.user.username;
                if (loginLink) loginLink.style.display = 'none';
                if (logoutLink) logoutLink.style.display = 'block';
            } else {
                usernameEl.textContent = 'Invité';
                if (loginLink) loginLink.style.display = 'block';
                if (logoutLink) logoutLink.style.display = 'none';
            }
        } catch (err) {
            console.error('Session fetch error:', err);
            // Fallback to Guest
            usernameEl.textContent = 'Invité';
            if (loginLink) loginLink.style.display = 'block';
            if (logoutLink) logoutLink.style.display = 'none';
        }
    }

    // Handle Logout
    if (logoutLink) {
        logoutLink.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.reload(); // Reload to update state
            } catch (error) {
                console.error('Logout error:', error);
            }
        });
    }
});
