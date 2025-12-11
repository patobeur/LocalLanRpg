const characters = require("../characters");
const { GAME_CONSTANTS } = require("../config.js");

/**
 * CombatSystem
 * Handles projectiles, collisions, and damage calculations
 */
class CombatSystem {
    constructor() {
        this.projectiles = [];
        this.PROJECTILE_SPEED = GAME_CONSTANTS.PROJECTILE_SPEED;
        this.PROJECTILE_RANGE = GAME_CONSTANTS.PROJECTILE_RANGE;
    }

    /**
     * Add a projectile to the game
     * @param {string} shooterId - ID of the shooter
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} z - Z position
     * @param {number} angle - Shooting angle
     * @param {Map} players - Players map (to check if shooter is dead)
     */
    addProjectile(shooterId, x, y, z, angle, players) {
        const shooter = players.get(shooterId);
        if (shooter && shooter.isDead) return; // Prevent shooting if dead

        let vx = Math.sin(angle);
        let vz = Math.cos(angle);

        this.projectiles.push({
            shooterId,
            x,
            z,
            vx,
            vz,
            distTraveled: 0
        });
    }

    /**
     * Calculate damage for a shooter
     * @param {Object} shooter - Shooter object (player or minion)
     * @param {boolean} isMinion - Whether the shooter is a minion
     * @returns {number} Damage amount
     */
    calculateDamage(shooter, isMinion) {
        let damage = 10;
        if (isMinion) {
            const minionsData = require("../minions.js");
            const minionStats = minionsData.chars[shooter.name];
            damage = minionStats ? minionStats.autoAttackDamage[0] : 10;
        } else {
            const charStats = characters.chars[shooter.character];
            damage = charStats ? charStats.autoAttackDamage[0] : 10;
        }
        return damage;
    }

    /**
     * Check collision with players
     * @param {Object} projectile - Projectile object
     * @param {Map} players - Players map
     * @param {Object} shooter - Shooter object
     * @param {boolean} shooterIsMinion - Whether shooter is a minion
     * @param {Object} progressionSystem - Progression system for damage tracking
     * @param {Array} events - Events array
     * @returns {boolean} True if hit occurred
     */
    checkPlayerCollision(projectile, players, shooter, shooterIsMinion, progressionSystem, events) {
        for (const [id, player] of players) {
            if (id === projectile.shooterId || player.isDead || player.faction === shooter.faction) continue;

            const dx = projectile.x - player.x;
            const dz = projectile.z - player.z;

            if (Math.hypot(dx, dz) < 0.5) {
                const damage = this.calculateDamage(shooter, shooterIsMinion);

                // Track damage for players
                if (!shooterIsMinion) {
                    const shooterPlayer = players.get(projectile.shooterId);
                    if (shooterPlayer) {
                        progressionSystem.trackDamage(shooterPlayer, 'player', damage);

                        // Add to target's damage history for assists
                        player.damageHistory.push({
                            attackerId: projectile.shooterId,
                            timestamp: Date.now()
                        });
                    }
                }

                player.health -= damage;
                player.lastAttackerId = projectile.shooterId;
                if (player.health < 0) player.health = 0;

                events.push({
                    type: "projectile-hit",
                    shooterId: projectile.shooterId,
                    targetId: id
                });

                events.push({
                    type: "player-health",
                    id: id,
                    health: player.health,
                    maxHealth: player.maxHealth,
                    mana: player.mana,
                    maxMana: player.maxMana
                });
                return true;
            }
        }
        return false;
    }

    /**
     * Check collision with minions
     * @param {Object} projectile - Projectile object
     * @param {Object} minionManager - Minion manager instance
     * @param {Map} players - Players map
     * @param {Object} shooter - Shooter object
     * @param {boolean} shooterIsMinion - Whether shooter is a minion
     * @param {Object} progressionSystem - Progression system for damage/XP tracking
     * @param {Array} events - Events array
     * @returns {boolean} True if hit occurred
     */
    checkMinionCollision(projectile, minionManager, players, shooter, shooterIsMinion, progressionSystem, events) {
        const minions = minionManager.getMinions();
        for (const minion of minions) {
            if (minion.id === projectile.shooterId || minion.isDead || minion.faction === shooter.faction) continue;

            const dx = projectile.x - minion.x;
            const dz = projectile.z - minion.z;

            if (Math.hypot(dx, dz) < 0.5) {
                const damage = this.calculateDamage(shooter, shooterIsMinion);

                // Track minion damage for players
                if (!shooterIsMinion) {
                    const shooterPlayer = players.get(projectile.shooterId);
                    if (shooterPlayer) {
                        progressionSystem.trackDamage(shooterPlayer, 'minion', damage);
                    }
                }

                const damageResult = minionManager.damageMinion(minion.id, damage, projectile.shooterId);

                if (damageResult) {
                    events.push({
                        type: "minion-health",
                        minionId: minion.id,
                        health: damageResult.health,
                        maxHealth: damageResult.maxHealth
                    });

                    events.push({
                        type: "projectile-hit",
                        shooterId: projectile.shooterId,
                        targetId: minion.id
                    });

                    // If minion died, handle XP and cleanup
                    if (damageResult.isDead) {
                        minionManager.cleanupMinionProjectiles(minion.id, this.projectiles);

                        // Give XP to killer if it's a player
                        if (!shooterIsMinion) {
                            const shooterPlayer = players.get(projectile.shooterId);
                            if (shooterPlayer) {
                                shooterPlayer.minionsKilled = (shooterPlayer.minionsKilled || 0) + 1;
                            }

                            console.log(`[Game Debug] Minion ${minion.id} killed by player ${projectile.shooterId}. Checking XP logic...`);
                            try {
                                const minionsData = require("../minions.js");
                                if (minionsData.xpRewardedPerLv) {
                                    const minionLevel = minion.level || 1;
                                    const rewardIndex = Math.min(minionLevel - 1, minionsData.xpRewardedPerLv.length - 1);
                                    const xpReward = minionsData.xpRewardedPerLv[Math.max(0, rewardIndex)];
                                    console.log(`[Game Debug] Minion Level: ${minionLevel}, RewardIndex: ${rewardIndex}, XP Reward: ${xpReward}`);

                                    // Return XP info to be handled by caller
                                    return { hit: true, xpReward, playerId: projectile.shooterId };
                                } else {
                                    console.error("[Game Debug] xpRewardedPerLv not found in minions.js");
                                }
                            } catch (err) {
                                console.error("[Game Debug] Error in XP logic:", err);
                            }
                        }
                    }
                }
                return { hit: true };
            }
        }
        return { hit: false };
    }

    /**
     * Check collision with structures
     * @param {Object} projectile - Projectile object
     * @param {Object} structures - Structures object
     * @param {Object} shooter - Shooter object
     * @param {boolean} shooterIsMinion - Whether shooter is a minion
     * @param {Map} players - Players map
     * @param {Object} progressionSystem - Progression system for damage tracking
     * @param {Function} handleGameOverCallback - Callback to handle game over
     * @param {Array} events - Events array
     * @returns {boolean} True if hit occurred
     */
    checkStructureCollision(projectile, structures, shooter, shooterIsMinion, players, progressionSystem, handleGameOverCallback, events) {
        for (const [key, str] of Object.entries(structures)) {
            if (str.isDead) continue;

            // Check faction (don't hit friendly bases)
            let isFriendly = false;
            if (shooter.faction === "blue" && key === "BaseTeamA") isFriendly = true;
            if (shooter.faction === "red" && key === "BaseTeamB") isFriendly = true;

            if (isFriendly) continue;

            const dx = projectile.x - str.x;
            const dz = projectile.z - str.y; // Config y is Z in 3D
            const radius = str.collisionRadius || 4;

            if (Math.hypot(dx, dz) < radius) {
                const damage = this.calculateDamage(shooter, shooterIsMinion);

                // Track base damage for players
                if (!shooterIsMinion) {
                    const shooterPlayer = players.get(projectile.shooterId);
                    if (shooterPlayer) {
                        if (key === "BaseTeamA" || key === "BaseTeamB") {
                            progressionSystem.trackDamage(shooterPlayer, 'base', damage);
                        }
                    }
                }

                str.hp -= damage;
                if (str.hp <= 0) {
                    str.hp = 0;
                    if (!str.isDead) {
                        str.isDead = true;
                        console.log(`[Game] Structure ${key} destroyed!`);
                        events.push({
                            type: "structure-death",
                            structureId: key,
                            killerId: shooter.id
                        });

                        // Check if a base was destroyed (game over)
                        if (key === "BaseTeamA" || key === "BaseTeamB") {
                            const winningTeam = key === "BaseTeamA" ? "red" : "blue";
                            handleGameOverCallback(winningTeam, events);
                        }
                    }
                }

                events.push({
                    type: "structure-hit",
                    structureId: key,
                    damage,
                    hp: str.hp,
                    maxHp: str.maxHp,
                    shooterId: shooter.id,
                    shooterType: shooterIsMinion ? "minion" : "player"
                });

                events.push({
                    type: "projectile-hit",
                    shooterId: shooter.id,
                    targetId: key
                });
                return true;
            }
        }
        return false;
    }

    /**
     * Update all projectiles
     * @param {number} dt - Delta time
     * @param {Map} players - Players map
     * @param {Object} minionManager - Minion manager
     * @param {Object} structures - Structures object
     * @param {Object} progressionSystem - Progression system
     * @param {Function} addXpCallback - Callback to add XP
     * @param {Function} handleGameOverCallback - Callback to handle game over
     * @param {Array} events - Events array
     */
    updateProjectiles(dt, players, minionManager, structures, progressionSystem, addXpCallback, handleGameOverCallback, events) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            const move = this.PROJECTILE_SPEED * dt;
            p.x += p.vx * move;
            p.z += p.vz * move;
            p.distTraveled += move;

            // Check if shooter is a player or minion
            let shooter = players.get(p.shooterId);
            let shooterIsMinion = false;

            if (!shooter) {
                shooter = minionManager.getMinionById(p.shooterId);
                if (shooter) {
                    shooterIsMinion = true;
                } else {
                    this.projectiles.splice(i, 1);
                    continue;
                }
            }

            // Collision Detection
            let hit = false;

            // 1. Check Player Collision
            hit = this.checkPlayerCollision(p, players, shooter, shooterIsMinion, progressionSystem, events);

            // 2. Check Minion Collision
            if (!hit) {
                const result = this.checkMinionCollision(p, minionManager, players, shooter, shooterIsMinion, progressionSystem, events);
                hit = result.hit;
                // Handle XP reward if minion was killed
                if (result.xpReward && result.playerId) {
                    addXpCallback(result.playerId, result.xpReward, events);
                }
            }

            // 3. Check Structure Collision
            if (!hit) {
                hit = this.checkStructureCollision(p, structures, shooter, shooterIsMinion, players, progressionSystem, handleGameOverCallback, events);
            }

            if (hit || p.distTraveled >= this.PROJECTILE_RANGE) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    /**
     * Get all projectiles
     * @returns {Array} Projectiles array
     */
    getProjectiles() {
        return this.projectiles;
    }
}

module.exports = CombatSystem;
