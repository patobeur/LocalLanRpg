// Lobby logic

document.addEventListener('DOMContentLoaded', async () => {
    const roomsGrid = document.getElementById('roomsGrid');
    const createRoomBtn = document.getElementById('createRoomBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const usernameEl = document.getElementById('username');
    const createRoomModal = document.getElementById('createRoomModal');
    const createRoomForm = document.getElementById('createRoomForm');
    const cancelCreate = document.getElementById('cancelCreate');
    const createError = document.getElementById('createError');
    const roomNameInput = document.getElementById('roomName');

    // Load username
    try {
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();
        if (sessionData.authenticated) {
            usernameEl.textContent = `👤 ${sessionData.user.username}`;
        }
    } catch (err) {
        console.error('Session fetch error:', err);
    }

    // Load rooms
    async function loadRooms() {
        roomsGrid.innerHTML = '<div class="loading">Chargement des salles...</div>';

        try {
            const response = await fetch('/api/rooms');

            if (response.status === 401) {
                window.location.href = '/login.html';
                return;
            }

            const data = await response.json();

            if (data.success && data.rooms) {
                displayRooms(data.rooms);
            } else {
                roomsGrid.innerHTML = '<div class="loading">Erreur de chargement</div>';
            }
        } catch (error) {
            console.error('Load rooms error:', error);
            roomsGrid.innerHTML = '<div class="loading">Erreur de connexion au serveur</div>';
        }
    }

    function displayRooms(rooms) {
        if (rooms.length === 0) {
            roomsGrid.innerHTML = `
				<div class="no-rooms">
					<p>Aucune salle disponible</p>
					<small>Créez-en une pour commencer !</small>
				</div>
			`;
            return;
        }

        roomsGrid.innerHTML = '';
        rooms.forEach(room => {
            const card = createRoomCard(room);
            roomsGrid.appendChild(card);
        });
    }

    function createRoomCard(room) {
        const card = document.createElement('div');
        card.className = 'room-card';

        const isFull = room.playerCount >= room.maxPlayers;
        const isPlaying = room.status === 'playing';

        if (isFull) card.classList.add('full');
        if (isPlaying) card.classList.add('playing');

        let statusText = 'En attente';
        let statusClass = 'waiting';
        if (isPlaying) {
            statusText = 'En cours';
            statusClass = 'playing';
        }

        card.innerHTML = `
			<div class="room-name">${escapeHtml(room.name)}</div>
			<div class="room-creator">Créé par ${escapeHtml(room.creatorUsername)}</div>
			<div class="room-info">
				<span class="room-players ${isFull ? 'full' : ''}">${room.playerCount}/${room.maxPlayers} joueurs</span>
				<span class="room-status ${statusClass}">${statusText}</span>
			</div>
		`;

        if (!isFull && !isPlaying) {
            card.addEventListener('click', () => joinRoom(room.id));
        }

        return card;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async function joinRoom(roomId) {
        try {
            const response = await fetch(`/api/rooms/${roomId}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            if (data.success) {
                // Redirect to room
                window.location.href = `/room.html?roomId=${roomId}`;
            } else {
                alert(data.error || 'Impossible de rejoindre la salle');
                loadRooms(); // Refresh
            }
        } catch (error) {
            console.error('Join room error:', error);
            alert('Erreur de connexion au serveur');
        }
    }

    // Create room
    createRoomBtn.addEventListener('click', () => {
        createRoomModal.classList.remove('hidden');
        roomNameInput.value = '';
        roomNameInput.focus();
        createError.textContent = '';
    });

    cancelCreate.addEventListener('click', () => {
        createRoomModal.classList.add('hidden');
    });

    createRoomModal.addEventListener('click', (e) => {
        if (e.target === createRoomModal) {
            createRoomModal.classList.add('hidden');
        }
    });

    createRoomForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        createError.textContent = '';

        const name = roomNameInput.value.trim();
        if (!name) {
            createError.textContent = 'Le nom de la salle est requis';
            return;
        }

        const submitBtn = createRoomForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Création...';

        try {
            const response = await fetch('/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });

            const data = await response.json();

            if (data.success) {
                // Redirect to room
                window.location.href = `/room.html?roomId=${data.roomId}`;
            } else {
                createError.textContent = data.error || 'Erreur lors de la création';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Créer';
            }
        } catch (error) {
            console.error('Create room error:', error);
            createError.textContent = 'Erreur de connexion au serveur';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Créer';
        }
    });

    // Refresh
    refreshBtn.addEventListener('click', loadRooms);

    // Logout
    logoutBtn.addEventListener('click', async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    });

    // Auto-refresh every 5 seconds
    setInterval(loadRooms, 5000);

    // Initial load
    loadRooms();
});
