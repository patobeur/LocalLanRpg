// Players Stats Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    const statsContainer = document.getElementById('statsContainer');
    const refreshBtn = document.getElementById('refreshBtn');

    // Load stats on page load
    loadPlayersStats();

    // Refresh button event
    refreshBtn.addEventListener('click', () => {
        loadPlayersStats();
    });
});

async function loadPlayersStats() {
    const statsContainer = document.getElementById('statsContainer');
    statsContainer.innerHTML = '<div class="loading">Chargement des statistiques...</div>';

    try {
        const response = await fetch('/api/players/stats');

        if (!response.ok) {
            throw new Error('Erreur lors du chargement des statistiques');
        }

        const players = await response.json();

        if (!players || players.length === 0) {
            statsContainer.innerHTML = '<div class="no-data">Aucun joueur trouvé</div>';
            return;
        }

        // Build table
        const table = document.createElement('table');
        table.className = 'stats-table';

        // Table header
        const thead = document.createElement('thead');
        thead.innerHTML = `
			<tr>
				<th>Joueur</th>
				<th>Niveau</th>
				<th>Parties</th>
				<th>Victoires</th>
				<th>Défaites</th>
				<th>% Victoires</th>
				<th>XP Total</th>
				<th>Kills</th>
				<th>Assists</th>
				<th>Dégâts Joueurs</th>
				<th>Dégâts Base</th>
				<th>Dégâts Minions</th>
				<th>Minions Tués</th>
			</tr>
		`;
        table.appendChild(thead);

        // Table body
        const tbody = document.createElement('tbody');
        players.forEach(player => {
            const winRate = player.games_played > 0
                ? ((player.games_won / player.games_played) * 100).toFixed(1)
                : 0;

            let winRateClass = 'win-rate';
            if (winRate >= 60) winRateClass += ' good';
            else if (winRate >= 40) winRateClass += ' average';
            else winRateClass += ' low';

            const row = document.createElement('tr');
            row.innerHTML = `
				<td>${escapeHtml(player.username)}</td>
				<td><span class="level-badge">Niv. ${player.level || 1}</span></td>
				<td class="stat-number">${player.games_played || 0}</td>
				<td class="stat-number">${player.games_won || 0}</td>
				<td class="stat-number">${player.games_lost || 0}</td>
				<td class="${winRateClass}">${winRate}%</td>
				<td class="stat-number">${formatNumber(player.total_xp || 0)}</td>
				<td class="stat-number">${player.total_kills || 0}</td>
				<td class="stat-number">${player.total_assists || 0}</td>
				<td class="stat-number">${formatNumber(player.total_damage_players || 0)}</td>
				<td class="stat-number">${formatNumber(player.total_damage_base || 0)}</td>
				<td class="stat-number">${formatNumber(player.total_damage_minions || 0)}</td>
				<td class="stat-number">${player.total_minions_killed || 0}</td>
			`;
            tbody.appendChild(row);
        });
        table.appendChild(tbody);

        statsContainer.innerHTML = '';
        statsContainer.appendChild(table);

    } catch (error) {
        console.error('Error loading players stats:', error);
        statsContainer.innerHTML = '<div class="error">❌ Erreur lors du chargement des statistiques</div>';
    }
}

// Helper function to escape HTML and prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Helper function to format large numbers
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}
