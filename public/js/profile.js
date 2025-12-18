document.addEventListener('DOMContentLoaded', async () => {
    const usernameEl = document.getElementById('profileUsername');

    try {
        // 1. Get Session for Identity
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();

        if (!sessionData.authenticated) {
            window.location.href = '/login.html';
            return;
        }

        const username = sessionData.user.username;
        usernameEl.textContent = username;

        // 2. Get Stats for this user
        // Note: Ideally we'd have a specific endpoint /api/users/me/stats, but we'll reuse the list for now
        const statsRes = await fetch('/api/players/stats');
        const allStats = await statsRes.json();

        const myStats = allStats.find(p => p.username === username);

        if (myStats) {
            // Update UI
            document.getElementById('statsGames').textContent = myStats.played || 0;
            // Wins not explicitly tracked in the structure shown earlier, but maybe 'won'? 
            // Checking rooms.js update logic: played, unfinished, xp, kills, assists, damage...
            // It doesn't seem to track 'wins' explicitly in the update code I saw in rooms.js.
            // I'll show what I have.

            document.getElementById('statsKills').textContent = myStats.kills || 0;
            document.getElementById('statsXP').textContent = myStats.xp || 0;

            // For wins, we might not have it. Let's change the label or hide it if undefined.
            const winLabel = document.getElementById('statsWins').parentElement;
            if (myStats.wins !== undefined) {
                document.getElementById('statsWins').textContent = myStats.wins;
            } else {
                winLabel.style.display = 'none';
            }
        }

    } catch (error) {
        console.error('Error loading profile:', error);
        usernameEl.textContent = 'Erreur';
    }
});
