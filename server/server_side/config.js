// Game Configuration - Server Side
// Centralizes all game constants, map data, and balancing values

// Game Constants
const GAME_CONSTANTS = {
	PROJECTILE_SPEED: 10,
	PROJECTILE_RANGE: 30,
	PLAYER_COLLISION_RADIUS: 0.5,
	STRUCTURE_DEFAULT_COLLISION_RADIUS: 4,
	RESPAWN_TIME_MS: 5000,
	MINION_SPAWN_INTERVAL: 30, // seconds between waves
	MINION_FIRST_SPAWN_DELAY: 10, // seconds until first spawn
	MINION_WAVE_SIZE: 5, // minions per wave per team
	MINION_COLLISION_RADIUS: 0.3,
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
