// Game State Module
// Centralizes all game state management

// Room ID from URL
export let roomId = null;

// WebSocket connection (will be set by network module)
export let ws = null;

// Network state
export let lastBroadcast = 0;

// Player state
export const me = {
    id: null,
    mesh: null,
    character: null,
    faction: null,
    username: null,
    health: 100,
    maxHealth: 100,
    mana: 100,
    maxMana: 100,
    level: 1,
    xp: 0,
    maxXp: 100,
    respawnTime: null,
    lastAttack: undefined,
};

// Other players
export const others = new Map();
export const structures = new Map();

// Game connection state
let _gameState = "connecting"; // 'connecting', 'playing'

// Characters data (loaded from API)
export let charactersData = {};

// Player position and rotation
export const playerTransform = {
    x: 0,
    y: 0.5,
    z: 0,
    rotY: 0,
};

// Import game constants from centralized config
import { GAME_CONSTANTS } from "../client-config.js";
export { GAME_CONSTANTS };

// Initialize game state with room ID
export function initGameState(roomIdParam) {
    roomId = roomIdParam;

    // Load characters data
    fetch("/api/characters")
        .then((res) => res.json())
        .then((data) => {
            charactersData = data.chars;
        });
}

// Setters for network state
export function setWebSocket(wsInstance) {
    ws = wsInstance;
}

export function setLastBroadcast(timestamp) {
    lastBroadcast = timestamp;
}

// Game state getters/setters
export function getGameState() {
    return _gameState;
}

export function setGameState(state) {
    _gameState = state;
    console.log(`[Game] State changed to "${state}"`);
}

// Position getters/setters
export function getPlayerPosition() {
    return { ...playerTransform };
}

export function setPlayerPosition(x, y, z, rotY) {
    playerTransform.x = x;
    playerTransform.y = y;
    playerTransform.z = z;
    if (rotY !== undefined) {
        playerTransform.rotY = rotY;
    }
}

export function updatePlayerPosition(dx, dy, dz, dRotY) {
    playerTransform.x += dx;
    playerTransform.y += dy;
    playerTransform.z += dz;
    if (dRotY !== undefined) {
        playerTransform.rotY += dRotY;
    }
}

// UI State
export let gameUI = null;
export let playerColor = null;

export function setGameUI(ui) {
    gameUI = ui;
}

export function setPlayerColor(color) {
    playerColor = color;
}

export function getGameUI() {
    return gameUI;
}
