// Navbar Logic

document.addEventListener('DOMContentLoaded', async () => {
    // Only fetch session if element exists
    const usernameEl = document.getElementById('navUsername');
    if (usernameEl) {
        try {
            const sessionRes = await fetch('/api/auth/session');
            const sessionData = await sessionRes.json();
            if (sessionData.authenticated) {
                usernameEl.textContent = sessionData.user.username;
            } else {
                // If on a protected page and not authenticated, redirect?
                // For now just show Guest or nothing
                usernameEl.textContent = 'Invité';
                const logoutBtn = document.getElementById('navLogoutBtn');
                if (logoutBtn) logoutBtn.style.display = 'none';
            }
        } catch (err) {
            console.error('Session fetch error:', err);
        }
    }

    // Handle Logout
    const logoutBtn = document.getElementById('navLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/login.html';
            } catch (error) {
                console.error('Logout error:', error);
            }
        });
    }
});
