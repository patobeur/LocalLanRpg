const skillsConfig = require("../skills.js");
const charactersConfig = require("../characters/index.js");

class SkillSystem {
    constructor(game) {
        this.game = game;
    }

    /**
     * Attempt to use a skill
     * @param {Object} player - The player using the skill
     * @param {string} skillKey - The skill key (A, Z, E, R)
     * @param {Object} targetData - Target information (x, z, targetId)
     */
    useSkill(player, skillKey, targetData) {
        if (!player.character) return;

        const characterData = charactersConfig.chars[player.character];
        if (!characterData) return;

        // Map key to skill ID from character data
        let skillId;
        if (skillKey === 'A') skillId = characterData.skill1Id;
        else if (skillKey === 'Z') skillId = characterData.skill2Id;
        else if (skillKey === 'E') skillId = characterData.skill3Id;
        else if (skillKey === 'R') skillId = characterData.ultimatId;

        if (skillId === undefined || skillId === null) return;

        const skillDef = skillsConfig[skillId];
        if (!skillDef) return;

        // Check Cooldown
        const now = Date.now();
        if (!player.cooldowns) player.cooldowns = {};

        if (player.cooldowns[skillKey] && player.cooldowns[skillKey] > now) {
            console.log(`[Skill] ${player.name} tried to use ${skillDef.name} but is on cooldown.`);
            return;
        }

        // Check Mana
        const levelIndex = Math.max(0, (player.level || 1) - 1);
        const manaCost = skillDef.manaCost ? skillDef.manaCost[Math.min(levelIndex, skillDef.manaCost.length - 1)] : 0;

        if (player.mana < manaCost) {
            console.log(`[Skill] ${player.name} tried to use ${skillDef.name} but low mana.`);
            return;
        }

        // Apply Costs
        player.mana -= manaCost;
        const cdDuration = skillDef.cd[Math.min(levelIndex, skillDef.cd.length - 1)];
        // Ensure cdDuration is valid number
        if (cdDuration) {
            player.cooldowns[skillKey] = now + (cdDuration * 1000);
        }

        // Execute Skill Logic
        const result = this.executeSkill(player, skillDef, targetData, levelIndex);

        console.log(`[Skill] ${player.name} used ${skillDef.name} (Cost: ${manaCost}, CD: ${cdDuration}s)`);

        return {
            executed: true,
            event: result ? result.event : null
        };
    }

    executeSkill(player, skill, targetData, levelIndex) {
        const types = skill.type || [];
        // Damage/Heal Value
        const value = skill.damage ? skill.damage[Math.min(levelIndex, skill.damage.length - 1)] : 0;

        if (types.includes("hit") && skill.projectile_speed) {
            // It's a projectile skill
            let angle = player.rotY;

            // If targeted logic needed
            if (targetData.x !== undefined && targetData.z !== undefined) {
                const dx = targetData.x - player.x;
                const dz = targetData.z - player.z;
                angle = Math.atan2(dx, dz);
                // Note: shooter rotation might want to update to face target? 
                // For now, projectile direction is enough.
            }

            // Call combat system
            const projectile = this.game.combatSystem.addSkillProjectile(
                player.id,
                player.x,
                player.y,
                player.z,
                angle,
                skill,
                value,
                this.game.playerManager.getPlayersMap()
            );

            // Create event for broadcast
            if (projectile) {
                return {
                    event: {
                        type: "shoot",
                        shooterId: player.id,
                        x: player.x,
                        y: player.y,
                        z: player.z,
                        angle: angle,
                        skillId: skill.id,
                        isSkill: true
                    }
                };
            }

            // We might want to broadcast a "skill-used" event for visual effects (animation trigger)
            // But existing 'shoot' logic does that via projectile creation broadcasting?
            // Actually 'shoot' message from client generated the projectile AND broadcasted.
            // Here, server generates it. So server must broadcast the projectile creation.
            // CombatSystem.addSkillProjectile should add to `this.projectiles`.
            // The Main Loop `combatSystem.updateProjectiles` handles movement.
            // BUT how do clients know `projectile` was created? 
            // In `game-events.js`, we need to see how new projectiles are broadcast.
            // 'minion-attack' handled it. 'shoot' handled it.
            // If I add a projectile server-side, I need to push an event so `game-events.js` broadcasts it.
            // OR `combatSystem` pushes to `events` list?
            // `addProjectile` in `combatSystem` just pushes to internal array.
            // WE NEED TO GENERATE AN EVENT!
            // `SkillSystem` doesn't have access to the `events` array of the current loop tick easily
            // unless passed in `update` or we push to a queue.
            // Better: `SkillSystem.executeSkill` puts it in `game.pendingEvents` or similar?
            // OR `CombatSystem` creates it and we rely on a separate mechanism?
            // `minion-attack` event in `game-events.js` (line 144) adds projectile AND broadcasts.
            // So I should probably modify `Game.update` to collect skill events?
        }

        // Handling Heals (Direct)
        else if (types.includes("heal") && skill.target === "self") {
            const oldHealth = player.health;
            player.health = Math.min(player.health + value, player.maxHealth);
            // We rely on `player-health` event generation in `Game.update` -> `regenerationSystem` checks?
            // `RegenerationSystem.updateRegeneration` usually checks/updates generic regen,
            // checking health diff might be tricky if implicit.
            // `PlayerManager` active update logic might handle movement but not health.
            // Usually health updates trigger events when damage happens.
            // I should probably manually trigger a health update event if I can.
            // But simpler: just update the state, and let a state sync/broadcast pick it up?
            // `game-events.js` sends `player-health` events if they are in the `events` list.
            // I really need a way to push events from `SkillSystem`.

            // Solution: `SkillSystem` should store events in a `this.events` queue that `Game` collects.
        }
    }
}

module.exports = SkillSystem;
