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
        const result = this.executeSkill(player, skillDef, targetData, levelIndex, skillId);

        console.log(`[Skill] ${player.name} used ${skillDef.name} (Cost: ${manaCost}, CD: ${cdDuration}s)`);

        return {
            executed: true,
            event: result ? result.event : null
        };
    }

    executeSkill(player, skill, targetData, levelIndex, skillId) {
        const types = skill.type || [];
        const value = skill.damage ? skill.damage[Math.min(levelIndex, skill.damage.length - 1)] : 0;

        // Base Event Data
        const eventData = {
            type: "skill-effect",
            shooterId: player.id,
            skillId: skillId, // Use the passed ID
            x: player.x,
            y: player.y,
            z: player.z,
            targetX: targetData.x,
            targetZ: targetData.z,
            targetId: targetData.targetId,
            isSkill: true
        };

        // 1. Projectile / Travel Skills (Has Speed)
        if (skill.projectile_speed) {
            let angle = player.rotY;
            if (targetData.x !== undefined && targetData.z !== undefined) {
                const dx = targetData.x - player.x;
                const dz = targetData.z - player.z;
                angle = Math.atan2(dx, dz);
            }
            eventData.angle = angle;

            // Add physical projectile to Combat System
            this.game.combatSystem.addSkillProjectile(
                player.id,
                player.x,
                player.y,
                player.z,
                angle,
                skill,
                value,
                this.game.playerManager.getPlayersMap()
            );

            // Return event for broadcast
            return { event: eventData };
        }

        // 2. Instant Self/Target Skills (No Speed)
        else {
            // Instant Heal Logic
            if (types.includes("heal") && skill.target === "self") {
                player.health = Math.min(player.health + value, player.maxHealth);
                // Note: Health update will be synced by main loop's regeneration/update cycle eventually, 
                // but we could push a specific health event if needed. 
                // For now, the visual effect is what we care about here.
            }

            // Return event for broadcast
            console.log("[SkillSystem] Generated Event:", eventData);
            return { event: eventData };
        }
    }
}

module.exports = SkillSystem;
