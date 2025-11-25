// Client-side authentication logic

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');
    const loginError = document.getElementById('loginError');
    const registerError = document.getElementById('registerError');

    // Toggle between login and register forms
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        loginError.textContent = '';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        registerError.textContent = '';
    });

    // Handle login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.textContent = '';

        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!username || !password) {
            loginError.textContent = 'Tous les champs sont requis.';
            return;
        }

        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Connexion';

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Success - redirect to lobby
                window.location.href = '/lobby.html';
            } else {
                loginError.textContent = data.error || 'Erreur lors de la connexion.';
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
                submitBtn.textContent = 'Se connecter';
            }
        } catch (error) {
            console.error('Login error:', error);
            loginError.textContent = 'Erreur de connexion au serveur.';
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            submitBtn.textContent = 'Se connecter';
        }
    });

    // Handle registration
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        registerError.textContent = '';

        const username = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

        // Validation
        if (!username || !email || !password || !passwordConfirm) {
            registerError.textContent = 'Tous les champs sont requis.';
            return;
        }

        if (username.length < 3) {
            registerError.textContent = 'Le nom d\'utilisateur doit contenir au moins 3 caractères.';
            return;
        }

        if (password.length < 6) {
            registerError.textContent = 'Le mot de passe doit contenir au moins 6 caractères.';
            return;
        }

        if (password !== passwordConfirm) {
            registerError.textContent = 'Les mots de passe ne correspondent pas.';
            return;
        }

        const submitBtn = registerForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Création';

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Success - redirect to lobby
                window.location.href = '/lobby.html';
            } else {
                registerError.textContent = data.error || 'Erreur lors de la création du compte.';
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
                submitBtn.textContent = 'Créer un compte';
            }
        } catch (error) {
            console.error('Registration error:', error);
            registerError.textContent = 'Erreur de connexion au serveur.';
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            submitBtn.textContent = 'Créer un compte';
        }
    });

    // Check if already logged in
    fetch('/api/auth/session')
        .then(res => res.json())
        .then(data => {
            if (data.authenticated) {
                // Already logged in, redirect to lobby
                window.location.href = '/lobby.html';
            }
        })
        .catch(err => console.error('Session check error:', err));
});
