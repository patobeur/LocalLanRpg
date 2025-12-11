const config = require("../config.js");
const { updateUserStats } = require("../../database.js");

/**
 * GameStateManager
 * Handles game structures, game-over logic, and victory conditions
 */
class GameStateManager {
    constructor() {
        this.structures = {};
        this.isGameOver = false;
    }

    /**
     * Initialize structures from config
     */
    initializeStructures() {
        if (config.structures) {
            for (const [key, str] of Object.entries(config.structures)) {
                this.structures[key] = {
                    ...str,
                    maxHp: str.hp,
                    isDead: false,
                    level: 1
                };
            }
        }
    }

    /**
     * Get all structures
     * @returns {Object} Structures object
     */
    getStructures() {
        return this.structures;
    }

    /**
     * Check if game is over
     * @returns {boolean} True if game is over
     */
    isOver() {
        return this.isGameOver;
    }

    /**
     * Handle game over logic
     * @param {string} winningTeam - Winning team ('blue' or 'red')
     * @param {Map} players - All players
     * @param {Array} events - Events array
     */
    handleGameOver(winningTeam, players, events) {
        console.log(`[Game] Base destroyed! Team ${winningTeam} wins!`);

        // Mark game as over
        this.isGameOver = true;

        // Collect all player data for victory screen
        const playersList = Array.from(players.values()).map(p => ({
            id: p.id,
            name: p.name,
            character: p.character,
            level: p.level,
            faction: p.faction,
            kills: p.kills || 0,
            assists: p.assists || 0,
            damageDealtToPlayers: p.damageDealtToPlayers || 0,
            damageDealtToBase: p.damageDealtToBase || 0,
            damageDealtToMinions: p.damageDealtToMinions || 0,
            minionsKilled: p.minionsKilled || 0
        }));

        // Update stats for all players
        for (const p of players.values()) {
            if (p.statsUpdated) continue;

            const isWinner = p.faction === winningTeam;
            updateUserStats(p.id, {
                played: 1,
                won: isWinner ? 1 : 0,
                lost: isWinner ? 0 : 1,
                xp: p.sessionXp || 0,
                kills: p.kills || 0,
                assists: p.assists || 0,
                damagePlayers: p.damageDealtToPlayers || 0,
                damageBase: p.damageDealtToBase || 0,
                damageMinions: p.damageDealtToMinions || 0,
                minionsKilled: p.minionsKilled || 0
            }).then(() => {
                console.log(`[Game] Stats updated for player ${p.name}`);
            }).catch(err => {
                console.error(`[Game] Failed to update stats for player ${p.name}:`, err);
            });

            p.statsUpdated = true;
        }

        // Create game-over event
        events.push({
            type: "game-over",
            winningTeam: winningTeam,
            players: playersList
        });
    }

    /**
     * Stop the game
     */
    stopGame() {
        console.log("[GameState] Game stopped");
        this.isGameOver = true;
    }
}

module.exports = GameStateManager;
