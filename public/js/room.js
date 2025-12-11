// Room logic with WebSocket for real-time updates

const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("roomId");

if (!roomId) {
	alert("Room ID manquant");
	window.location.href = "/lobby.html";
}

let ws = null;
let myUserId = null;
let myFaction = null;
let myCharacter = null;
let roomData = null;
let isCreator = false;

// Elements
const roomNameEl = document.getElementById("roomName");
const roomStatusEl = document.getElementById("roomStatus");
const leaveBtn = document.getElementById("leaveBtn");
const factionSelection = document.getElementById("factionSelection");
const joinBlueBtn = document.getElementById("joinBlueBtn");
const joinRedBtn = document.getElementById("joinRedBtn");
const teamsContainer = document.getElementById("teamsContainer");
const bluePlayers = document.getElementById("bluePlayers");
const redPlayers = document.getElementById("redPlayers");
const blueCount = document.getElementById("blueCount");
const redCount = document.getElementById("redCount");
const characterSelection = document.getElementById("characterSelection");
const charactersGrid = document.getElementById("charactersGrid");
const startContainer = document.getElementById("startContainer");
const startGameBtn = document.getElementById("startGameBtn");
const startHint = document.getElementById("startHint");

// Load room data
async function loadRoom() {
	try {
		const response = await fetch(`/api/rooms/${roomId}`);
		const data = await response.json();

		if (!data.success) {
			alert("Salle introuvable");
			window.location.href = "/lobby.html";
			return;
		}

		roomData = data.room;

		// If game is already in progress, redirect to game
		if (roomData.status === "playing") {
			window.location.href = `/jouer.html?roomId=${roomId}`;
			return;
		}

		roomNameEl.textContent = roomData.name;

		// Get my user ID
		const sessionRes = await fetch("/api/auth/session");
		const sessionData = await sessionRes.json();
		myUserId = sessionData.user.id;

		isCreator = roomData.creatorId === myUserId;

		// Find my player data
		const myPlayer = roomData.players.find((p) => p.id === myUserId);
		if (myPlayer) {
			myFaction = myPlayer.faction;
			myCharacter = myPlayer.character;
		}

		updateUI();
		connectWebSocket();
	} catch (error) {
		console.error("Load room error:", error);
		alert("Erreur de chargement de la salle");
		window.location.href = "/lobby.html";
	}
}

// WebSocket connection for real-time updates
function connectWebSocket() {
	const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
	const wsUrl = `${protocol}//${window.location.host}`;

	ws = new WebSocket(wsUrl);

	ws.onopen = () => {
		console.log("[WS] Connected to room");
		// Send room join message
		ws.send(JSON.stringify({ type: "join-room", roomId }));
	};

	ws.onmessage = (event) => {
		const msg = JSON.parse(event.data);
		handleWebSocketMessage(msg);
	};

	ws.onclose = () => {
		console.log("[WS] Disconnected");
		setTimeout(connectWebSocket, 2000); // Reconnect
	};

	ws.onerror = (error) => {
		console.error("[WS] Error:", error);
	};
}

function handleWebSocketMessage(msg) {
	switch (msg.type) {
		case "room-update":
			roomData.players = msg.players;
			updateUI();
			break;
		case "game-start":
			// Game is starting, redirect to game
			window.location.href = `/jouer.html?roomId=${roomId}`;
			break;
	}
}

// Update UI based on room state
function updateUI() {
	// Show/hide faction selection
	if (!myFaction) {
		factionSelection.style.display = "block";
		teamsContainer.style.display = "none";
		characterSelection.style.display = "none";
		characterSelection.style.display = "none";
		startContainer.style.display = "none";
		// Hide change team button
		if (changeTeamBtn) changeTeamBtn.style.display = "none";
	} else {
		factionSelection.style.display = "none";
		teamsContainer.style.display = "grid";

		// Show character selection if no character chosen
		if (!myCharacter) {
			characterSelection.style.display = "block";
			loadCharacters();
		} else {
			characterSelection.style.display = "none";
		}

		// Show start button if creator
		if (isCreator) {
			startContainer.style.display = "block";
			updateStartButton();
		}

		// Show change team button
		if (changeTeamBtn) changeTeamBtn.style.display = "block";
	}

	// Update teams display
	displayTeams();
}

function displayTeams() {
	const bluePlrs = roomData.players.filter((p) => p.faction === "blue");
	const redPlrs = roomData.players.filter((p) => p.faction === "red");

	blueCount.textContent = `${bluePlrs.length}/5`;
	redCount.textContent = `${redPlrs.length}/5`;

	// Blue team
	if (bluePlrs.length === 0) {
		bluePlayers.innerHTML = '<div class="empty-team">Aucun joueur</div>';
	} else {
		bluePlayers.innerHTML = "";
		bluePlrs.forEach((player) => {
			const card = createPlayerCard(player);
			bluePlayers.appendChild(card);
		});
	}

	// Red team
	if (redPlrs.length === 0) {
		redPlayers.innerHTML = '<div class="empty-team">Aucun joueur</div>';
	} else {
		redPlayers.innerHTML = "";
		redPlrs.forEach((player) => {
			const card = createPlayerCard(player);
			redPlayers.appendChild(card);
		});
	}
}

function createPlayerCard(player) {
	const card = document.createElement("div");
	card.className = "player-card";
	if (player.id === myUserId) {
		card.classList.add("me");
	}

	const characterText = player.character
		? `${player.character} ✓`
		: "En attente de sélection...";

	const characterClass = player.character ? "" : "waiting";

	card.innerHTML = `
		<div class="player-name">${escapeHtml(player.username)}</div>
		<div class="player-character ${characterClass}">${characterText}</div>
	`;

	return card;
}

function escapeHtml(text) {
	const div = document.createElement("div");
	div.textContent = text;
	return div.innerHTML;
}

// Faction selection
joinBlueBtn.addEventListener("click", () => selectFaction("blue"));
joinRedBtn.addEventListener("click", () => selectFaction("red"));

async function selectFaction(faction) {
	try {
		const response = await fetch(`/api/rooms/${roomId}/faction`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ faction }),
		});

		const data = await response.json();

		if (data.success) {
			myFaction = faction;
			updateUI();
			// Broadcast update via WebSocket
			if (ws && ws.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify({ type: "room-changed", roomId }));
			}
		} else {
			alert(data.error || "Erreur lors de la sélection de faction");
		}
	} catch (error) {
		console.error("Select faction error:", error);
		alert("Erreur de connexion au serveur");
	}
}

// Character selection
async function loadCharacters() {
	try {
		const response = await fetch("/api/characters");
		const data = await response.json();

		charactersGrid.innerHTML = "";
		Object.values(data.chars).forEach((char) => {
			const card = createCharacterCard(char);
			charactersGrid.appendChild(card);
		});
	} catch (error) {
		console.error("Load characters error:", error);
		charactersGrid.innerHTML =
			'<div class="loading">Erreur de chargement</div>';
	}
}

function createCharacterCard(char) {
	const card = document.createElement("div");
	card.className = "character-card";
	if (myCharacter === char.name) {
		card.classList.add("selected");
	}
	card.style.backgroundImage = `url('/media/characters/low/${char.png}')`;

	card.innerHTML = `
		<h4>${char.name}</h4>
		<div class="type">${char.type}</div>
        <p>${char.description_rapide}</p>
		
		<div class="stats">
			<div class="stat-row"><span>❤️ HP:</span> <strong>${char.health[0]} - ${char.health[17]}</strong></div>
			<div class="stat-row"><span>💎 Mana:</span> <strong>${char.mana[0]} - ${char.mana[17]}</strong></div>
			<div class="stat-row"><span>⚡ Vitesse:</span> <strong>${char.speed[0]} - ${char.speed[17]}</strong></div>
			<div class="stat-row"><span>🗡️ Dégâts:</span> <strong>${char.autoAttackDamage[0]} - ${char.autoAttackDamage[17]}</strong></div>
		</div>
	`;

	card.addEventListener("click", () => selectCharacter(char.name));

	return card;
}

async function selectCharacter(character) {
	try {
		const response = await fetch(`/api/rooms/${roomId}/character`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ character }),
		});

		const data = await response.json();

		if (data.success) {
			myCharacter = character;
			updateUI();
			// Broadcast update
			if (ws && ws.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify({ type: "room-changed", roomId }));
			}
		} else {
			alert(data.error || "Erreur lors de la sélection de personnage");
		}
	} catch (error) {
		console.error("Select character error:", error);
		alert("Erreur de connexion au serveur");
	}
}

// Start game (creator only)
function updateStartButton() {
	const allReady = roomData.players.every((p) => p.character !== null);
	const enoughPlayers = roomData.players.length >= 2;

	startGameBtn.disabled = !allReady || !enoughPlayers;

	if (!enoughPlayers) {
		startHint.textContent = "Au moins 2 joueurs requis";
	} else if (!allReady) {
		startHint.textContent = "Tous les joueurs doivent choisir un personnage";
	} else {
		startHint.textContent = "Prêt à lancer !";
		startHint.style.color = "#4caf50";
	}
}

startGameBtn.addEventListener("click", async () => {
	try {
		const response = await fetch(`/api/rooms/${roomId}/start`, {
			method: "POST",
		});

		const data = await response.json();

		if (data.success) {
			// Broadcast game start to all players in room
			if (ws && ws.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify({ type: "start-game", roomId }));
			}
			// Redirect to game
			window.location.href = `/jouer.html?roomId=${roomId}`;
		} else {
			alert(data.error || "Impossible de lancer la partie");
		}
	} catch (error) {
		console.error("Start game error:", error);
		alert("Erreur de connexion au serveur");
	}
});

// Leave room
leaveBtn.addEventListener("click", async () => {
	if (!confirm("Voulez-vous vraiment quitter cette salle ?")) {
		return;
	}

	try {
		await fetch(`/api/rooms/${roomId}/leave`, {
			method: "POST",
		});
	} catch (error) {
		console.error("Leave room error:", error);
	}

	window.location.href = "/lobby.html";
});

// Change Team
const changeTeamBtn = document.getElementById("changeTeamBtn");
if (changeTeamBtn) {
	changeTeamBtn.addEventListener("click", () => {
		myFaction = null;
		myCharacter = null;
		updateUI();
	});
}

// Initial load
loadRoom();
