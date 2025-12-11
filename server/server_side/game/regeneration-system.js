const characters = require("../characters");

/**
 * RegenerationSystem
 * Handles health and mana regeneration for players
 */
class RegenerationSystem {
    /**
     * Update health and mana regeneration for all players
     * @param {Map} players - Map of player objects
     * @param {number} dt - Delta time in seconds
     * @param {Array} events - Events array to push regen events
     */
    updateRegeneration(players, dt, events) {
        for (const p of players.values()) {
            const charStats = characters.chars[p.character];
            if (!charStats) continue;

            let updated = false;

            // Get level-based stat index
            const levelIndex = Math.max(0, (p.level || 1) - 1);

            // Health regeneration
            if (p.health < p.maxHealth) {
                const regenRate = this.getRegenRate(charStats, 'HealthRegeneration', levelIndex);
                p.health += regenRate * dt;
                if (p.health > p.maxHealth) p.health = p.maxHealth;
                updated = true;
            }

            // Mana regeneration
            if (p.mana < p.maxMana) {
                const regenRate = this.getRegenRate(charStats, 'manaRegeneration', levelIndex);
                p.mana += regenRate * dt;
                if (p.mana > p.maxMana) p.mana = p.maxMana;
                updated = true;
            }

            // Broadcast regen updates
            if (updated) {
                events.push({
                    type: "player-regen",
                    id: p.id,
                    health: p.health,
                    maxHealth: p.maxHealth,
                    mana: p.mana,
                    maxMana: p.maxMana
                });
            }
        }
    }

    /**
     * Get regeneration rate for a specific stat
     * @param {Object} charStats - Character stats object
     * @param {string} statName - Name of the stat (HealthRegeneration or manaRegeneration)
     * @param {number} levelIndex - Zero-based level index
     * @returns {number} Regeneration rate
     */
    getRegenRate(charStats, statName, levelIndex) {
        const stat = charStats[statName];
        if (Array.isArray(stat)) {
            return stat[Math.min(levelIndex, stat.length - 1)];
        }
        return stat || 0;
    }
}

module.exports = RegenerationSystem;
