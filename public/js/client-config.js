// Client-side Game Constants
// Fetched from server on startup

export let GAME_CONSTANTS = {};

/**
 * Initialize game constants from server data
 * @param {Object} data - Constants object from server
 */
export function setGameConstants(data) {
    GAME_CONSTANTS = data;
    console.log('[Config] Game constants initialized:', GAME_CONSTANTS);
}
