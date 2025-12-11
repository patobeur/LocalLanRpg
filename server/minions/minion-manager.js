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
	}

	/**
	 * Initialize the minion manager when game starts
	 */
	startGame() {
		this.gameStartTime = Date.now();
		this.lastSpawnTime = 0;
		this.minions = [];
		this.nextMinionId = 1;
		console.log("[MinionManager] Game started, first spawn in " + this.FIRST_SPAWN_DELAY + "s");
	}

	/**
	 * Update all minions and check for spawn waves
	 */
	update(dt, players, structures) {
		const events = [];

		if (!this.gameStartTime) return events;

		// Check if there are any players in the game
		const activePlayers = players ? (players instanceof Map ? Array.from(players.values()) : Object.values(players)) : [];
		if (activePlayers.length === 0) {
			// No players, don't spawn or update minions
			return events;
		}

		const currentTime = Date.now();
		const gameTime = (currentTime - this.gameStartTime) / 1000; // Convert to seconds

		// Check if it's time to spawn minions
		const shouldSpawnFirst = gameTime >= this.FIRST_SPAWN_DELAY && this.lastSpawnTime === 0;
		const shouldSpawnNext = this.lastSpawnTime > 0 && gameTime >= this.lastSpawnTime + this.SPAWN_INTERVAL;

		if (shouldSpawnFirst || shouldSpawnNext) {
			this.lastSpawnTime = gameTime;
			const spawnEvents = this.spawnWave(structures);
			events.push(...spawnEvents);
		}

		// Update all minions
		for (let i = this.minions.length - 1; i >= 0; i--) {
			const minion = this.minions[i];

			// Check if minion is dead
			if (minion.isDead || minion.health <= 0) {
				events.push({
					type: "minion-death",
					minionId: minion.id
				});
				this.minions.splice(i, 1);
				console.log(`[MinionManager] Minion ${minion.id} removed (dead)`);
				continue;
			}

			// Update minion AI
			const result = MinionAI.update(minion, this.minions, players, structures, dt);
			this.minions[i] = result.minion;
			events.push(...result.events);

			// Broadcast position update periodically (throttled)
			if (!minion.lastBroadcastTime || currentTime - minion.lastBroadcastTime > 100) {
				minion.lastBroadcastTime = currentTime;
				events.push({
					type: "minion-move",
					minionId: minion.id,
					x: minion.x,
					y: minion.y,
					z: minion.z,
					rotY: minion.rotY
				});
			}
		}

		return events;
	}

	/**
	 * Spawn a wave of minions for both teams
	 */
	spawnWave(structures) {
		const events = [];

		// Spawn for Team A (blue)
		const teamAMinions = this.spawnMinionGroup("blue", this.WAVE_SIZE, structures);
		events.push(...teamAMinions);

		// Spawn for Team B (red)
		const teamBMinions = this.spawnMinionGroup("red", this.WAVE_SIZE, structures);
		events.push(...teamBMinions);

		console.log(`[MinionManager] Spawned wave: ${this.WAVE_SIZE} minions per team`);
		return events;
	}

	/**
	 * Spawn a group of minions for a specific team
	 */
	spawnMinionGroup(faction, count, structures) {
		const events = [];

		// Determine minion level based on base level
		let minionLevel = 1;
		if (structures) {
			const baseKey = faction === "blue" ? "BaseTeamA" : "BaseTeamB";
			const base = structures[baseKey];
			if (base && base.level) {
				minionLevel = base.level;
			}
		}

		// Determine spawn location and minion type based on faction
		const spawnLocation = faction === "blue"
			? config.locations.spawnMinionsA
			: config.locations.spawnMinionsB;

		const minionType = faction === "blue"
			? "minion_tank_blue"
			: "minion_tank_red";

		const minionStats = minionsData.chars[minionType];
		if (!minionStats) {
			console.error(`[MinionManager] Minion type ${minionType} not found!`);
			return events;
		}


		for (let i = 0; i < count; i++) {
			const minionId = `minion_${this.nextMinionId++}`;

			// Calculate spawn position based on formation
			// First minion at center, subsequent ones behind
			const spawnCenter = { x: spawnLocation.x, z: spawnLocation.y };

			// Determine "forward" direction (towards enemy base)
			// Team A (Blue) moves from negative to positive (approx 1, 1)
			// Team B (Red) moves from positive to negative (approx -1, -1)
			const dirX = faction === "blue" ? 1 : -1;
			const dirZ = faction === "blue" ? 1 : -1;

			// Normalize direction (approximate is fine for this)
			const len = Math.hypot(dirX, dirZ);
			const normDirX = dirX / len;
			const normDirZ = dirZ / len;

			// "Behind" vector is opposite of forward
			const backX = -normDirX;
			const backZ = -normDirZ;

			// Spacing between minions
			const spacing = 1.5;

			// Calculate position: Center + (index * spacing * backwardVector)
			const spawnX = spawnCenter.x + (i * spacing * backX);
			const spawnZ = spawnCenter.z + (i * spacing * backZ);

			const level = minionLevel;
			const levelIndex = Math.max(0, level - 1);

			const minion = {
				id: minionId,
				name: minionType,
				faction: faction,
				x: spawnX,
				y: 0.5,
				z: spawnZ,
				rotY: 0,
				health: Array.isArray(minionStats.health)
					? minionStats.health[levelIndex]
					: minionStats.health,
				maxHealth: Array.isArray(minionStats.health)
					? minionStats.health[levelIndex]
					: minionStats.health,
				level: level,
				targetId: null,
				targetType: null,
				lastAttackTime: 0,
				lastBroadcastTime: 0,
				isDead: false
			};

			this.minions.push(minion);

			events.push({
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
					level: minion.level
				}
			});
		}

		return events;
	}

	/**
	 * Get minion by ID
	 */
	getMinionById(minionId) {
		return this.minions.find(m => m.id === minionId);
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
			attackerId: attackerId
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
