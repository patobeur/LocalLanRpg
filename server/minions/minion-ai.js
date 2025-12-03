// Minion AI Behavior Module
// Handles pathfinding, target detection, and combat for minions

const { GAME_CONSTANTS } = require("../server_side/config.js");
const minionsData = require("../server_side/minions.js");

class MinionAI {
    /**
     * Update minion AI behavior
     * @param {Object} minion - The minion to update
     * @param {Array} allMinions - All minions in the game
     * @param {Map} players - All players in the game
     * @param {Object} structures - All structures in the game
     * @param {Number} dt - Delta time
     * @returns {Object} - Updated minion state and events
     */
    static update(minion, allMinions, players, structures, dt) {
        const events = [];

        // Don't update dead minions
        if (minion.isDead || minion.health <= 0) {
            return { minion, events };
        }

        // Get minion stats
        const minionStats = minionsData.chars[minion.name];
        if (!minionStats) return { minion, events };

        const levelIndex = Math.max(0, (minion.level || 1) - 1);
        const speed = Array.isArray(minionStats.speed)
            ? minionStats.speed[Math.min(levelIndex, minionStats.speed.length - 1)]
            : minionStats.speed;
        const hitDistance = Array.isArray(minionStats.hitDistance)
            ? minionStats.hitDistance[Math.min(levelIndex, minionStats.hitDistance.length - 1)]
            : minionStats.hitDistance;

        // Find or validate current target
        const targetInfo = this.findTarget(minion, allMinions, players, structures, hitDistance);

        if (targetInfo.target) {
            minion.targetId = targetInfo.targetId;
            minion.targetType = targetInfo.targetType;

            // Move towards target or attack if in range
            const distance = targetInfo.distance;

            if (distance > hitDistance) {
                // Move towards target
                this.moveTowards(minion, targetInfo.target, speed, dt, allMinions);
            } else {
                // In range, check if can attack
                const autoAttackCd = Array.isArray(minionStats.autoAttackCd)
                    ? minionStats.autoAttackCd[Math.min(levelIndex, minionStats.autoAttackCd.length - 1)]
                    : minionStats.autoAttackCd;

                const now = Date.now();
                const timeSinceLastAttack = (now - (minion.lastAttackTime || 0)) / 1000;

                if (timeSinceLastAttack >= autoAttackCd) {
                    // Attack!
                    minion.lastAttackTime = now;

                    // Calculate angle to target
                    const dx = targetInfo.target.x - minion.x;
                    const dz = (targetInfo.target.z || targetInfo.target.y) - minion.z;
                    const angle = Math.atan2(dx, dz);

                    events.push({
                        type: "minion-attack",
                        minionId: minion.id,
                        x: minion.x,
                        y: minion.y,
                        z: minion.z,
                        angle: angle,
                        targetId: targetInfo.targetId,
                        targetType: targetInfo.targetType
                    });

                    minion.rotY = angle;
                }
            }
        } else {
            // No target, move to enemy base
            minion.targetId = null;
            minion.targetType = null;

            const enemyBase = minion.faction === "blue" ? structures.BaseTeamB : structures.BaseTeamA;
            if (enemyBase && !enemyBase.isDead) {
                this.moveTowards(minion, { x: enemyBase.x, z: enemyBase.y }, speed, dt, allMinions);
            }
        }

        return { minion, events };
    }

    /**
     * Find the best target for the minion
     * @returns {Object} - { target, targetId, targetType, distance } or { target: null }
     */
    static findTarget(minion, allMinions, players, structures, hitDistance) {
        let closestTarget = null;
        let closestDistance = Infinity;
        let closestId = null;
        let closestType = null;

        // Check if current target is still valid
        if (minion.targetId && minion.targetType) {
            const currentTarget = this.getTargetById(minion.targetId, minion.targetType, allMinions, players, structures);
            if (currentTarget && !currentTarget.isDead && currentTarget.health > 0) {
                const dist = this.getDistance(minion, currentTarget);
                // Keep current target if still in extended range (hitDistance * 1.5)
                if (dist <= hitDistance * 1.5) {
                    return {
                        target: currentTarget,
                        targetId: minion.targetId,
                        targetType: minion.targetType,
                        distance: dist
                    };
                }
            }
        }

        // Look for enemy players
        for (const [playerId, player] of players) {
            if (player.faction === minion.faction || player.isDead) continue;

            const dist = this.getDistance(minion, player);
            if (dist <= hitDistance && dist < closestDistance) {
                closestDistance = dist;
                closestTarget = player;
                closestId = playerId;
                closestType = "player";
            }
        }

        // Look for enemy minions
        for (const otherMinion of allMinions) {
            if (otherMinion.id === minion.id || otherMinion.faction === minion.faction || otherMinion.isDead) continue;

            const dist = this.getDistance(minion, otherMinion);
            if (dist <= hitDistance && dist < closestDistance) {
                closestDistance = dist;
                closestTarget = otherMinion;
                closestId = otherMinion.id;
                closestType = "minion";
            }
        }

        if (closestTarget) {
            return {
                target: closestTarget,
                targetId: closestId,
                targetType: closestType,
                distance: closestDistance
            };
        }

        return { target: null };
    }

    /**
     * Get target by ID and type
     */
    static getTargetById(targetId, targetType, allMinions, players, structures) {
        if (targetType === "player") {
            return players.get(targetId);
        } else if (targetType === "minion") {
            return allMinions.find(m => m.id === targetId);
        } else if (targetType === "structure") {
            return structures[targetId];
        }
        return null;
    }

    /**
     * Calculate distance between minion and target
     */
    static getDistance(minion, target) {
        const dx = minion.x - target.x;
        const dz = minion.z - (target.z !== undefined ? target.z : target.y);
        return Math.hypot(dx, dz);
    }

    /**
     * Move minion towards target with collision avoidance
     */
    static moveTowards(minion, target, speed, dt, allMinions) {
        const dx = target.x - minion.x;
        const dz = (target.z !== undefined ? target.z : target.y) - minion.z;
        const distance = Math.hypot(dx, dz);

        if (distance > 0.1) {
            const moveDistance = speed * dt;

            // Calculate desired velocity
            let vx = (dx / distance) * moveDistance;
            let vz = (dz / distance) * moveDistance;

            // Apply collision avoidance with other minions
            const avoidanceForce = this.calculateAvoidanceForce(minion, allMinions);
            vx += avoidanceForce.x;
            vz += avoidanceForce.z;

            // Update position
            minion.x += vx;
            minion.z += vz;
            minion.rotY = Math.atan2(dx, dz);
        }
    }

    /**
     * Calculate avoidance force to prevent minion overlap
     */
    static calculateAvoidanceForce(minion, allMinions) {
        const COLLISION_RADIUS = GAME_CONSTANTS.PLAYER_COLLISION_RADIUS || 0.5;
        const AVOIDANCE_STRENGTH = 0.3;

        let forceX = 0;
        let forceZ = 0;

        for (const other of allMinions) {
            if (other.id === minion.id || other.isDead) continue;

            const dx = minion.x - other.x;
            const dz = minion.z - other.z;
            const distance = Math.hypot(dx, dz);

            // If too close, apply separation force
            if (distance < COLLISION_RADIUS * 2 && distance > 0) {
                const force = AVOIDANCE_STRENGTH / distance;
                forceX += (dx / distance) * force;
                forceZ += (dz / distance) * force;
            }
        }

        return { x: forceX, z: forceZ };
    }
}

module.exports = MinionAI;
