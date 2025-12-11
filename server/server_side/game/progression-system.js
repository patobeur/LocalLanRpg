const characters = require("../characters");
const config = require("../config.js");
const { updateUserLevel } = require("../../database.js");

/**
 * ProgressionSystem
 * Handles XP, levels, kills, assists, death, and respawn logic
 */
class ProgressionSystem {
    /**
     * Add XP to a player and handle level-ups
     * @param {Object} player - Player object
     * @param {number} xpGain - Amount of XP to add
     * @param {Object} structures - Structures object (for base level-up)
     * @param {Array} events - Events array
     */
    addXpToPlayer(player, xpGain, structures, events) {
        if (!player) return;

        player.xp += xpGain;
        player.sessionXp = (player.sessionXp || 0) + xpGain;
        console.log(`[Game] Player ${player.id} gained ${xpGain} XP`);

        // Check Level Up
        let leveledUp = false;
        while (player.xp >= player.maxXp) {
            player.xp -= player.maxXp;
            player.level++;
            leveledUp = true;
            player.maxXp = player.level * 100;
            player.health = player.maxHealth; // Full heal on level up
            player.mana = player.maxMana;
            console.log(`[Game] Player ${player.id} leveled up to ${player.level}!`);
        }

        if (leveledUp) {
            updateUserLevel(player.id, player.level)
                .then(() => console.log(`[Database] Level for user ${player.id} updated to ${player.level}.`))
                .catch(err => console.error(`[Database] Error updating level for user ${player.id}:`, err));

            events.push({
                type: "level-up",
                id: player.id,
                level: player.level,
            });

            // Check Base Level Up
            const baseKey = player.faction === "blue" ? "BaseTeamA" : "BaseTeamB";
            const base = structures[baseKey];
            if (base && !base.isDead && base.level < 18 && player.level > base.level) {
                base.level = Math.min(player.level, 18);
                console.log(`[Game] ${baseKey} leveled up to ${base.level}!`);

                events.push({
                    type: "structure-level-up",
                    structureId: baseKey,
                    level: base.level
                });
            }
        }

        events.push({
            type: "player-xp",
            id: player.id,
            xp: player.xp,
            maxXp: player.maxXp,
            level: player.level
        });
    }

    /**
     * Handle player death and award kills/assists
     * @param {Object} player - Player who died
     * @param {Map} players - All players
     * @param {Function} addXpToPlayerCallback - Callback to add XP
     * @param {Array} events - Events array
     */
    handlePlayerDeath(player, players, addXpToPlayerCallback, events) {
        const now = Date.now();
        player.isDead = true;
        const respawnDelay = player.level * 5000; // 5 seconds per level
        player.respawnTime = now + respawnDelay;

        events.push({
            type: "player-death",
            id: player.id,
            respawnTime: player.respawnTime
        });

        console.log(`[Game] Player ${player.id} died, respawn in ${respawnDelay / 1000}s`);

        // XP Gain for Attacker & Kill Logic
        if (player.lastAttackerId) {
            const attacker = players.get(player.lastAttackerId);
            if (attacker && attacker.faction !== player.faction) {
                const xpGain = 50 * player.level;
                addXpToPlayerCallback(attacker.id, xpGain, events);

                // Increment Kills
                attacker.kills = (attacker.kills || 0) + 1;
                console.log(`[Game] Player ${attacker.name} killed ${player.name} (Kills: ${attacker.kills})`);
            }
        }

        // Assist Logic
        this.handleAssists(player, players, addXpToPlayerCallback, events);
    }

    /**
     * Handle assist tracking for a killed player
     * @param {Object} victim - Player who was killed
     * @param {Map} players - All players
     * @param {Function} addXpToPlayerCallback - Callback to add XP
     * @param {Array} events - Events array
     */
    handleAssists(victim, players, addXpToPlayerCallback, events) {
        if (victim.damageHistory && victim.damageHistory.length > 0) {
            const assistWindow = 10000; // 10 seconds
            const validAssisters = new Set();
            const now = Date.now();

            victim.damageHistory.forEach(record => {
                if (now - record.timestamp <= assistWindow && record.attackerId !== victim.lastAttackerId) {
                    const assister = players.get(record.attackerId);
                    if (assister && assister.faction !== victim.faction) {
                        validAssisters.add(record.attackerId);
                    }
                }
            });

            validAssisters.forEach(assisterId => {
                const assister = players.get(assisterId);
                if (assister) {
                    assister.assists = (assister.assists || 0) + 1;
                    console.log(`[Game] Player ${assister.name} assisted in killing ${victim.name} (Assists: ${assister.assists})`);

                    // XP for assist
                    const xpGain = 25 * victim.level;
                    addXpToPlayerCallback(assister.id, xpGain, events);
                }
            });
        }
    }

    /**
     * Handle player respawn
     * @param {Object} player - Player to respawn
     * @param {Array} events - Events array
     */
    handlePlayerRespawn(player, events) {
        // Calculate spawn position
        const spawn = player.faction === "blue" ? config.locations.spawnTeamA : config.locations.spawnTeamB;
        const radius = (spawn.w || 5) / 2;
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * radius;
        player.x = spawn.x + Math.cos(angle) * dist;
        player.z = spawn.y + Math.sin(angle) * dist;
        player.y = 0.5;

        // Reset health and state
        player.health = player.maxHealth;
        player.mana = player.maxMana;
        player.isDead = false;
        player.respawnTime = null;
        player.lastAttackerId = null; // Reset attacker
        player.damageHistory = []; // Clear damage history

        events.push({
            type: "player-respawn",
            id: player.id,
            x: player.x,
            y: player.y,
            z: player.z,
            health: player.health,
            maxHealth: player.maxHealth,
            mana: player.mana,
            maxMana: player.maxMana
        });

        console.log(`[Game] Player ${player.id} respawned at (${player.x.toFixed(1)}, ${player.z.toFixed(1)})`);
    }

    /**
     * Update death and respawn states for all players
     * @param {Map} players - All players
     * @param {Object} structures - Game structures
     * @param {Function} addXpToPlayerCallback - Callback to add XP
     * @param {Array} events - Events array
     */
    updateDeathAndRespawn(players, structures, addXpToPlayerCallback, events) {
        const now = Date.now();
        for (const p of players.values()) {
            // Check for death
            if (!p.isDead && p.health < 1) {
                this.handlePlayerDeath(p, players, addXpToPlayerCallback, events);
            }

            // Check for respawn
            if (p.isDead && p.respawnTime && now >= p.respawnTime) {
                this.handlePlayerRespawn(p, events);
            }
        }
    }

    /**
     * Track damage dealt by a player
     * @param {Object} shooter - Shooter player object
     * @param {string} targetType - 'player', 'minion', or 'base'
     * @param {number} damage - Damage amount
     */
    trackDamage(shooter, targetType, damage) {
        if (!shooter) return;

        switch (targetType) {
            case 'player':
                shooter.damageDealtToPlayers = (shooter.damageDealtToPlayers || 0) + damage;
                break;
            case 'minion':
                shooter.damageDealtToMinions = (shooter.damageDealtToMinions || 0) + damage;
                break;
            case 'base':
                shooter.damageDealtToBase = (shooter.damageDealtToBase || 0) + damage;
                break;
        }
    }
}

module.exports = ProgressionSystem;
