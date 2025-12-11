// Main Entry Point - Simplified
// Initializes and coordinates all game modules

import {
	initInput,
	setInputMode,
	setPlayersMap,
} from "./input.js";
import { initGameUI } from "./ui/game-ui.js";
import { initScene } from "./scene.js";

// Import new modules
import { initGameState, others } from "./main/game-state.js";
import { connectToRoomGame } from "./main/network.js";
import { startGameLoop } from "./main/game-loop.js";

// Import loading system
import { assetLoader } from "./loaders/asset-loader.js";
import { loadingScreen } from "./loaders/loading-screen.js";
import { getRequiredAssets } from "./loaders/asset-list.js";
import { setGameConstants } from "./client-config.js";

// Verify room ID from URL
const qs = new URLSearchParams(location.search);
const roomId = qs.get("roomId");

if (!roomId) {
	alert("Vous devez rejoindre une salle pour jouer");
	window.location.href = "/lobby.html";
}

// Initialize game state with room ID
initGameState(roomId);

// Initialize loading screen
loadingScreen.init();
loadingScreen.show();

// Setup progress callback
assetLoader.onProgress((progress) => {
	loadingScreen.updateProgress(progress);
});

// Initialize input system
initInput();

// Initialize 3D scene
initScene();

// Set players map for input system
setPlayersMap(others);

// Initialize game UI
const gameUI = initGameUI((mode) => {
	setInputMode(mode);
	console.log(`[Game] Movement mode set to: ${mode}`);
});

// Modified game initialization flow
async function initializeGame() {
	try {
		// Get room data first
		const roomRes = await fetch(`/api/rooms/${roomId}`);
		const roomData = await roomRes.json();

		// Fetch game constants
		const configRes = await fetch('/api/config');
		const configData = await configRes.json();
		setGameConstants(configData);

		if (!roomData.success) {
			alert("Salle introuvable");
			window.location.href = "/lobby.html";
			return;
		}

		// Get required assets list
		const assetsList = getRequiredAssets(roomData);
		console.log('[Game] Assets to load:', assetsList);

		// Load all assets
		loadingScreen.setStatus('Chargement des modèles 3D...');
		await assetLoader.loadAssets(assetsList);

		// Mark as ready and connect
		loadingScreen.markReady();
		loadingScreen.setStatus('Assets chargés! En attente des autres joueurs...');

		// Connect to room (assets-loaded will be sent from network.js after connection)
		await connectToRoomGame(gameUI);

		// Game loop will start when server sends "all-players-ready"

	} catch (error) {
		console.error('[Game] Initialization error:', error);
		alert("Erreur lors du chargement du jeu");
		window.location.href = "/lobby.html";
	}
}

// Start initialization
initializeGame();
