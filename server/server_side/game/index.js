const MinionManager = require("../../minions/minion-manager.js");
const PlayerManager = require("./player-manager.js");
const CombatSystem = require("./combat-system.js");
const ProgressionSystem = require("./progression-system.js");
const RegenerationSystem = require("./regeneration-system.js");
const GameStateManager = require("./game-state-manager.js");

/**
 * Game Class - Main orchestrator
 * Coordinates all game systems
 */
class Game {
    constructor() {
        // Initialize all subsystems
        this.playerManager = new PlayerManager();
        this.combatSystem = new CombatSystem();
        this.progressionSystem = new ProgressionSystem();
        this.regenerationSystem = new RegenerationSystem();
        this.gameStateManager = new GameStateManager();
        this.minionManager = new MinionManager();

        // Initialize structures
        this.gameStateManager.initializeStructures();
    }

    // ===== Backward Compatibility Properties =====
    // Expose internal maps for external code that expects them
    get players() {
        return this.playerManager.getPlayersMap();
    }

    get structures() {
        return this.gameStateManager.getStructures();
    }

    // ===== Player Management =====
    generateId() {
        return this.playerManager.generateId();
    }

    addPlayer(id, msg) {
        return this.playerManager.addPlayer(id, msg);
    }

    updatePlayer(id, msg) {
        return this.playerManager.updatePlayer(id, msg);
    }

    setPlayerDisconnected(id, disconnected) {
        return this.playerManager.setPlayerDisconnected(id, disconnected);
    }

    getPlayers() {
        return this.playerManager.getPlayers();
    }

    removePlayer(id) {
        return this.playerManager.removePlayer(id);
    }

    // ===== Game State =====
    startGame() {
        this.minionManager.startGame();
        console.log("[Game] Game started, minion spawning initialized");
    }

    stopGame() {
        console.log("[Game] Stopping game, cleaning up...");
        this.gameStateManager.stopGame();
        this.minionManager.stopGame();
        this.playerManager.getPlayersMap().clear();
        this.combatSystem.projectiles = [];
    }

    getStructures() {
        return this.gameStateManager.getStructures();
    }

    // ===== Combat =====
    addProjectile(shooterId, x, y, z, angle) {
        this.combatSystem.addProjectile(shooterId, x, y, z, angle, this.playerManager.getPlayersMap());
    }

    // ===== Main Update Loop =====
    update(dt) {
        const events = [];

        // Don't update if game is over
        if (this.gameStateManager.isOver()) return events;

        const players = this.playerManager.getPlayersMap();
        const structures = this.gameStateManager.getStructures();

        // 1. Update disconnected players
        this.playerManager.updateDisconnectedPlayers(dt, events);

        // 2. Update health and mana regeneration
        this.regenerationSystem.updateRegeneration(players, dt, events);

        // 3. Update minions
        const minionEvents = this.minionManager.update(dt, players, structures);
        events.push(...minionEvents);

        // 4. Update death and respawn
        this.progressionSystem.updateDeathAndRespawn(
            players,
            structures,
            (playerId, xpGain, events) => {
                const player = players.get(playerId);
                this.progressionSystem.addXpToPlayer(player, xpGain, structures, events);
            },
            events
        );

        // 5. Update projectiles and combat
        this.combatSystem.updateProjectiles(
            dt,
            players,
            this.minionManager,
            structures,
            this.progressionSystem,
            (playerId, xpGain, events) => {
                const player = players.get(playerId);
                this.progressionSystem.addXpToPlayer(player, xpGain, structures, events);
            },
            (winningTeam, events) => {
                this.gameStateManager.handleGameOver(winningTeam, players, events);
            },
            events
        );

        return events;
    }
}

module.exports = Game;
