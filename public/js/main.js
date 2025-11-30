// Main Entry Point - Simplified
// Initializes and coordinates all game modules

import {
	initInput,
	setInputMode,
	setPlayersMap,
} from "./input.js";
import { initGameUI } from "./game-ui.js";
import { initScene } from "./scene.js";

// Import new modules
import { initGameState, others } from "./main/game-state.js";
import { connectToRoomGame } from "./main/network.js";
import { startGameLoop } from "./main/game-loop.js";

// Verify room ID from URL
const qs = new URLSearchParams(location.search);
const roomId = qs.get("roomId");

if (!roomId) {
	alert("Vous devez rejoindre une salle pour jouer");
	window.location.href = "/lobby.html";
}

// Initialize game state with room ID
initGameState(roomId);

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

// Connect to room and start game
connectToRoomGame(gameUI);
startGameLoop();
