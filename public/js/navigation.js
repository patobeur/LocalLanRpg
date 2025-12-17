/**
 * LittleMoba Dynamic Navigation
 * Renders the navbar consistently across all pages with premium styling.
 * REFACTORED: Uses DOM API instead of innerHTML for security/performance.
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
});

function initNavbar() {
    const navContainer = document.getElementById('main-navbar');
    if (!navContainer) {
        console.warn('Navbar container #main-navbar not found.');
        return;
    }

    navContainer.classList.add('main-navbar');

    // Clear any existing content
    while (navContainer.firstChild) {
        navContainer.removeChild(navContainer.firstChild);
    }

    // --- Left Section ---
    const navLeft = document.createElement('div');
    navLeft.className = 'nav-left';

    // Logo Container
    const brandLink = document.createElement('a');
    brandLink.href = '/';
    brandLink.className = 'nav-brand-container';

    const logoImg = document.createElement('img');
    logoImg.src = '/media/img/littlemoba_nav.png';
    logoImg.alt = 'LittleMoba';
    logoImg.className = 'nav-logo';

    brandLink.appendChild(logoImg);
    navLeft.appendChild(brandLink);

    // Links Container
    const linksContainer = document.createElement('div');
    linksContainer.className = 'nav-links';

    const links = [
        { text: 'JOUER', href: '/lobby.html', key: 'lobby' },
        { text: 'CHAMPIONS', href: '/meshes3d.html', key: 'meshes3d' },
        { text: 'JOUEURS', href: '/players.html', key: 'players' }
    ];

    const currentPath = window.location.pathname;

    links.forEach(linkData => {
        const a = document.createElement('a');
        a.href = linkData.href;
        a.className = 'nav-link';
        a.textContent = linkData.text;

        if (currentPath.includes(linkData.key)) {
            a.classList.add('active');
        }

        linksContainer.appendChild(a);
    });

    navLeft.appendChild(linksContainer);

    // --- Right Section (Auth) ---
    const navRight = document.createElement('div');
    navRight.className = 'nav-right';
    navRight.id = 'nav-auth-container';

    // Loading State
    const loadingText = document.createElement('div');
    loadingText.className = 'nav-loading';
    loadingText.textContent = '...';
    navRight.appendChild(loadingText);

    // Assembly
    navContainer.appendChild(navLeft);
    navContainer.appendChild(navRight);

    // Initialize Auth
    updateAuthUI();
}

/**
 * Updates the right side of the navbar based on auth state.
 */
async function updateAuthUI() {
    const authContainer = document.getElementById('nav-auth-container');
    // Clear loading state or previous content
    while (authContainer.firstChild) {
        authContainer.removeChild(authContainer.firstChild);
    }

    try {
        const res = await fetch('/api/auth/session');
        const session = await res.json();

        if (session.authenticated) {
            // --- Logged In State ---
            createLoggedInUI(authContainer, session.user.username);
        } else {
            // --- Guest State ---
            createGuestUI(authContainer);
        }
    } catch (err) {
        console.error('Auth check failed:', err);
        createGuestUI(authContainer);
    }
}

function createGuestUI(container) {
    const loginBtn = document.createElement('a');
    loginBtn.href = '/login.html';
    loginBtn.className = 'nav-btn nav-btn-login';
    loginBtn.textContent = 'CONNEXION';

    const signupBtn = document.createElement('a');
    signupBtn.href = '/register.html';
    signupBtn.className = 'nav-btn nav-btn-signup';
    signupBtn.textContent = 'INSCRIPTION';

    container.appendChild(loginBtn);
    container.appendChild(signupBtn);
}

function createLoggedInUI(container, username) {
    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'nav-dropdown-container';

    // Trigger
    const trigger = document.createElement('span');
    trigger.className = 'nav-user-trigger';

    // User Icon (Text for now, or could use an img if available)
    const userIcon = document.createElement('span');
    userIcon.className = 'user-icon';
    userIcon.textContent = '👤';

    const userText = document.createTextNode(` ${username} `);

    const arrow = document.createElement('span');
    arrow.className = 'dropdown-arrow';
    arrow.textContent = '▼';

    trigger.appendChild(userIcon);
    trigger.appendChild(userText);
    trigger.appendChild(arrow);

    // Menu
    const menu = document.createElement('div');
    menu.className = 'nav-dropdown-menu';

    // Menu Items
    menu.appendChild(createDropdownLink('Profil', '/profile.html'));
    menu.appendChild(createDropdownLink('Paramètres', '/settings.html'));

    const divider = document.createElement('div');
    divider.className = 'dropdown-divider';
    menu.appendChild(divider);

    const logoutBtn = createDropdownLink('Déconnexion', '#');
    logoutBtn.classList.add('logout');
    logoutBtn.id = 'nav-logout-btn';
    menu.appendChild(logoutBtn);

    dropdownContainer.appendChild(trigger);
    dropdownContainer.appendChild(menu);
    container.appendChild(dropdownContainer);

    // Logic
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('show');
    });

    document.addEventListener('click', () => {
        if (menu.classList.contains('show')) {
            menu.classList.remove('show');
        }
    });

    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.reload();
        } catch (error) {
            console.error('Logout failed', error);
            window.location.reload();
        }
    });
}

function createDropdownLink(text, href) {
    const a = document.createElement('a');
    a.href = href;
    a.className = 'dropdown-item';
    a.textContent = text;
    return a;
}
