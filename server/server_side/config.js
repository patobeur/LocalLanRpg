// Game Configuration - Server Side
// Centralizes all game constants, map data, and balancing values

// Game Constants
const GAME_CONSTANTS = {
	PROJECTILE_SPEED: 10, // exists dans server/server_side/characters.js
	PROJECTILE_RANGE: 30, // exists dans server/server_side/characters.js
	PLAYER_COLLISION_RADIUS: 0.5,
	PLAYER_RADIUS: 0.5,
	// STRUCTURE_DEFAULT_COLLISION_RADIUS: 4,
	RESPAWN_TIME_MS: 5000,
	MINION_SPAWN_INTERVAL: 60, // seconds between waves
	MINION_FIRST_SPAWN_DELAY: 20, // seconds until first spawn
	MINION_WAVE_SIZE: 5, // minions per wave per team
	MINION_COLLISION_RADIUS: 0.3,
	PLAYER_SPEED: 3.5,
	GRID_SIZE: { x: 60, y: 60 },
	CAMERA: {
		ZOOM_SCALE: 100,
		MIN_ZOOM: 20,
		MAX_ZOOM: 150,
		ZOOM_SPEED: 0.1,
	},

	MINION_AVOIDANCE_STRENGTH: 0.1, // Increased strength
	MINION_TANGENTIAL_STRENGTH: 0.1, // Force to go around

	// Collision
	COLLISION: {
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

// Map Configuration
const MAP_CONFIG = {
	locations: {
		spawnTeamA: {
			x: -22,
			y: -22,
			z: 0.12,
			w: 5,
			h: 0.25,
			d: 5,
			type: "CylinderGeometry",
		},
		spawnTeamB: {
			x: 22,
			y: 22,
			z: 0.12,
			w: 5,
			h: 0.25,
			d: 5,
			type: "CylinderGeometry",
		},
		spawnMinionsA: {
			x: -18,
			y: -18,
			z: 0.12,
			w: 2,
			h: 0.25,
			d: 2,
			type: "CylinderGeometry",
		},
		spawnMinionsB: {
			x: 18,
			y: 18,
			z: 0.12,
			w: 2,
			h: 0.25,
			d: 2,
			type: "CylinderGeometry",
		},
	},
	structures: {
		BaseTeamA: {
			x: -25,
			y: -25,
			z: 0,
			hp: 1000,
			type: "GLB",
			filepath: "./media/structures/glb/baseTeamA.glb",
			rotation: { x: 0, y: 45, z: 0 },
			scale: { x: 10, y: 10, z: 10 },
			collisionRadius: 4,
			lv: 1,
		},
		BaseTeamB: {
			x: 25,
			y: 25,
			z: 0,
			hp: 1000,
			type: "GLB",
			filepath: "./media/structures/glb/baseTeamB.glb",
			rotation: { x: 0, y: -135, z: 0 },
			scale: { x: 10, y: 10, z: 10 },
			collisionRadius: 4,
			lv: 1,
		},
	},
};

// Legacy compatibility - export as single 'config' object
const config = {
	...MAP_CONFIG,
	constants: GAME_CONSTANTS,
};

module.exports = config;
module.exports.GAME_CONSTANTS = GAME_CONSTANTS;
module.exports.MAP_CONFIG = MAP_CONFIG;
