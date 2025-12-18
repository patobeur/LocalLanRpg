// Minion Manager Module
// Handles spawning waves of minions for both teams

const MinionAI = require("./minion-ai.js");
const minionsData = require("../server_side/minions.js");
const config = require("../server_side/config.js");

class MinionManager {
	constructor() {
		this.minions = [];
		this.nextMinionId = 1;
		this.gameStartTime = null;
		this.lastSpawnTime = 0;

		// Configuration
		this.FIRST_SPAWN_DELAY = config.constants.MINION_FIRST_SPAWN_DELAY || 10;
		this.SPAWN_INTERVAL = config.constants.MINION_SPAWN_INTERVAL || 30;
		this.WAVE_SIZE = config.constants.MINION_WAVE_SIZE || 3;

		// Spawn Queue System
		this.spawnQueueBlue = [];
		this.spawnQueueRed = [];
		this.lastSingleSpawnTime = 0;
		this.SINGLE_SPAWN_DELAY = 1.6; // Seconds between individual minion spawns
	}

	/**
	 * Initialize the minion manager when game starts
	 */
	startGame() {
		this.gameStartTime = Date.now();
		this.lastSpawnTime = 0;
		this.lastSpawnTime = 0;
		this.minions = [];
		this.spawnQueueBlue = [];
		this.spawnQueueRed = [];
		this.nextMinionId = 1;
		console.log(
			"[MinionManager] Game started, first spawn in " +
			this.FIRST_SPAWN_DELAY +
			"s"
		);
	}

	/**
	 * Update all minions and check for spawn waves
	 */
	update(dt, players, structures) {
		const events = [];

		if (!this.gameStartTime) return events;

		// Check if there are any players in the game
		const activePlayers = players
			? players instanceof Map
				? Array.from(players.values())
				: Object.values(players)
			: [];
		if (activePlayers.length === 0) {
			// No players, don't spawn or update minions
			return events;
		}

		const currentTime = Date.now();
		const gameTime = (currentTime - this.gameStartTime) / 1000; // Convert to seconds

		// Check if it's time to spawn minions
		const shouldSpawnFirst =
			gameTime >= this.FIRST_SPAWN_DELAY && this.lastSpawnTime === 0;
		const shouldSpawnNext =
			this.lastSpawnTime > 0 &&
			gameTime >= this.lastSpawnTime + this.SPAWN_INTERVAL;

		if (shouldSpawnFirst || shouldSpawnNext) {
			this.lastSpawnTime = gameTime;
			this.spawnWave(structures);
		}

		// Process Spawn Queues (Simultaneous)
		if (
			(this.spawnQueueBlue.length > 0 || this.spawnQueueRed.length > 0) &&
			gameTime >= this.lastSingleSpawnTime + this.SINGLE_SPAWN_DELAY
		) {
			// Spawn one from Blue if available
			if (this.spawnQueueBlue.length > 0) {
				const spawnData = this.spawnQueueBlue.shift();
				const spawnEvent = this.spawnSingleMinion(spawnData);
				if (spawnEvent) events.push(spawnEvent);
			}

			// Spawn one from Red if available (Simultaneously)
			if (this.spawnQueueRed.length > 0) {
				const spawnData = this.spawnQueueRed.shift();
				const spawnEvent = this.spawnSingleMinion(spawnData);
				if (spawnEvent) events.push(spawnEvent);
			}

			this.lastSingleSpawnTime = gameTime;
		}

		// Update all minions
		for (let i = this.minions.length - 1; i >= 0; i--) {
			const minion = this.minions[i];

			// Check if minion is dead
			if (minion.isDead || minion.health <= 0) {
				events.push({
					type: "minion-death",
					minionId: minion.id,
				});
				this.minions.splice(i, 1);
				console.log(`[MinionManager] Minion ${minion.id} removed (dead)`);
				continue;
			}

			// Update minion AI
			const result = MinionAI.update(
				minion,
				this.minions,
				players,
				structures,
				dt
			);
			this.minions[i] = result.minion;
			events.push(...result.events);

			// Broadcast position update periodically (throttled)
			if (
				!minion.lastBroadcastTime ||
				currentTime - minion.lastBroadcastTime > 100
			) {
				minion.lastBroadcastTime = currentTime;
				events.push({
					type: "minion-move",
					minionId: minion.id,
					x: minion.x,
					y: minion.y,
					z: minion.z,
					rotY: minion.rotY,
				});
			}
		}

		return events;
	}

	/**
	 * Queue a wave of minions for both teams
	 */
	/**
	 * Queue a wave of minions for both teams
	 */
	spawnWave(structures) {
		const WAVE_COMPOSITION = [
			{ suffix: "tank", count: 3 },
			{ suffix: "mage", count: 2 },
			{ suffix: "healer", count: 1 }
		];

		// Queue for Team A (blue)
		this.queueMinionGroup("blue", WAVE_COMPOSITION, structures, this.spawnQueueBlue);

		// Queue for Team B (red)
		this.queueMinionGroup("red", WAVE_COMPOSITION, structures, this.spawnQueueRed);

		console.log(
			`[MinionManager] Spawn queued: ${this.WAVE_SIZE} minions per team (Mixed Wave)`
		);
		// Note: We return empty events array because spawns are now async via update()
		return [];
	}

	/**
	 * Queue a group of minions for a specific team
	 */
	queueMinionGroup(faction, composition, structures, queue) {
		// Determine minion level based on base level
		let minionLevel = 1;
		if (structures) {
			const baseKey = faction === "blue" ? "BaseTeamA" : "BaseTeamB";
			const base = structures[baseKey];
			if (base && base.level) {
				minionLevel = base.level;
			}
		}

		// Determine spawn location
		const spawnLocation =
			faction === "blue"
				? config.locations.spawnMinionsA
				: config.locations.spawnMinionsB;

		// Process composition
		composition.forEach(comp => {
			const minionType = `minion_${comp.suffix}_${faction}`; // e.g., minion_tank_blue
			const minionStats = minionsData.chars[minionType];

			if (!minionStats) {
				console.error(`[MinionManager] Minion type ${minionType} not found!`);
				return;
			}

			for (let i = 0; i < comp.count; i++) {
				// Calculate spawn position
				const spawnCenter = { x: spawnLocation.x, z: spawnLocation.y };

				queue.push({
					faction: faction,
					minionType: minionType,
					minionStats: minionStats,
					level: minionLevel,
					spawnX: spawnCenter.x,
					spawnZ: spawnCenter.z,
				});
			}
		});
	}

	/**
	 * Create and spawn a single minion from queue data
	 */
	spawnSingleMinion(data) {
		const minionId = `minion_${this.nextMinionId++}`;

		const levelIndex = Math.max(0, data.level - 1);

		const minion = {
			id: minionId,
			name: data.minionType,
			faction: data.faction,
			x: data.spawnX,
			y: 0.5,
			z: data.spawnZ,
			rotY: 0,
			health: Array.isArray(data.minionStats.health)
				? data.minionStats.health[levelIndex]
				: data.minionStats.health,
			maxHealth: Array.isArray(data.minionStats.health)
				? data.minionStats.health[levelIndex]
				: data.minionStats.health,
			level: data.level,
			targetId: null,
			targetType: null,
			lastAttackTime: 0,
			lastBroadcastTime: 0,
			isDead: false,
		};

		this.minions.push(minion);

		return {
			type: "minion-spawn",
			minion: {
				id: minion.id,
				name: minion.name,
				faction: minion.faction,
				x: minion.x,
				y: minion.y,
				z: minion.z,
				rotY: minion.rotY,
				health: minion.health,
				maxHealth: minion.maxHealth,
				level: minion.level,
				fbx: data.minionStats.fbx, // Add FBX path from server-side data
				scale: data.minionStats.scale, // Add scale from server-side data
			},
		};
	}

	/**
	 * Get minion by ID
	 */
	getMinionById(minionId) {
		return this.minions.find((m) => m.id === minionId);
	}

	/**
	 * Apply damage to a minion
	 */
	damageMinion(minionId, damage, attackerId) {
		const minion = this.getMinionById(minionId);
		if (!minion || minion.isDead) return null;

		minion.health -= damage;
		if (minion.health < 0) minion.health = 0;

		if (minion.health <= 0) {
			minion.isDead = true;
		}

		return {
			minionId: minion.id,
			health: minion.health,
			maxHealth: minion.maxHealth,
			isDead: minion.isDead,
			attackerId: attackerId,
		};
	}

	/**
	 * Get all minions
	 */
	getMinions() {
		return this.minions;
	}

	/**
	 * Remove all projectiles from a specific shooter (when minion dies)
	 */
	cleanupMinionProjectiles(minionId, projectiles) {
		for (let i = projectiles.length - 1; i >= 0; i--) {
			if (projectiles[i].shooterId === minionId) {
				projectiles.splice(i, 1);
			}
		}
	}

	/**
	 * Stop the game and cleanup all minions
	 */
	stopGame() {
		console.log("[MinionManager] Stopping game, cleaning up minions");
		this.gameStartTime = null;
		this.lastSpawnTime = 0;
		this.minions = [];
		this.spawnQueueBlue = [];
		this.spawnQueueRed = [];
	}

	/**
	 * Reset the minion manager completely
	 */
	reset() {
		this.stopGame();
		this.nextMinionId = 1;
		console.log("[MinionManager] Reset complete");
	}
}

module.exports = MinionManager;
