// Game Constants - Client Side
// Centralizes all magic numbers and game configuration constants

export const GAME_CONSTANTS = {
    // Player
    PLAYER_SPEED: 3.5,  // Matches existing speed value
    GRID_SIZE: 40,      // Matches existing gridSize value

    // Projectiles
    PROJECTILE_SPEED: 10,
    PROJECTILE_RANGE: 30,

    // Collision
    COLLISION: {
        PLAYER_RADIUS: 0.5,
        STRUCTURE_DEFAULT_RADIUS: 4,
        PROJECTILE_HIT_RANGE_PLAYER: 5,
        PROJECTILE_HIT_RANGE_STRUCTURE: 10,
    },

    // Respawn
    RESPAWN: {
        TIMER_MS: 5000,
        COUNTDOWN_INTERVAL_MS: 1000,
    },

    // Camera
    CAMERA: {
        OFFSET_Y: 20,
        OFFSET_Z: 15,
        LOOK_AT_OFFSET_Y: 0,
    },
};
