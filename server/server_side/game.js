const characters = require("./characters.js");
const skills = require("./skills.js");
const config = require("./config.js");
const { GAME_CONSTANTS } = require("./config.js");
const { updateUserLevel } = require("../database.js");
const MinionManager = require("../minions/minion-manager.js");

class Game {
    constructor() {
        this.players = new Map();
        this.projectiles = [];
        this.nextId = 1;
        this.PROJECTILE_SPEED = GAME_CONSTANTS.PROJECTILE_SPEED;
        this.PROJECTILE_RANGE = GAME_CONSTANTS.PROJECTILE_RANGE;

        // Initialize minion manager
        this.minionManager = new MinionManager();

        // Initialize structures from config
        this.structures = {};
        if (config.structures) {
            for (const [key, str] of Object.entries(config.structures)) {
                this.structures[key] = {
                    ...str,
                    maxHp: str.hp, // Store max HP
                    isDead: false
                };
            }
        }
    }

    generateId() {
        return String(this.nextId++);
    }

    startGame() {
        this.minionManager.startGame();
        console.log("[Game] Game started, minion spawning initialized");
    }

    addPlayer(id, msg) {
        // Validate character
        let charName = msg.character || "Moumba";
        if (!characters.chars[charName]) {
            charName = "Moumba";
        }
        const charStats = characters.chars[charName];

        const faction = msg.faction || "blue";
        let spawn = config.locations.spawnTeamA;
        if (faction === "red") {
            spawn = config.locations.spawnTeamB;
        }

        // Random offset within spawn radius (w is diameter)
        const radius = (spawn.w || 5) / 2;
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * radius;
        const spawnX = spawn.x + Math.cos(angle) * dist;
        const spawnZ = spawn.y + Math.sin(angle) * dist; // Config y is Z in 3D

        const levelIndex = Math.max(0, (msg.level || 1) - 1);
        const player = {
            id,
            name: (msg.name || `Joueur ${id}`).slice(0, 16),
            color: msg.color || "#4CAF50",
            character: charName,
            x: spawnX,
            y: 0.5,
            z: spawnZ,
            rotY: 0,
            health: Array.isArray(charStats.health) ? charStats.health[Math.min(levelIndex, charStats.health.length - 1)] : charStats.health,
            maxHealth: Array.isArray(charStats.health) ? charStats.health[Math.min(levelIndex, charStats.health.length - 1)] : charStats.health,
            mana: Array.isArray(charStats.mana) ? charStats.mana[Math.min(levelIndex, charStats.mana.length - 1)] : charStats.mana,
            maxMana: Array.isArray(charStats.mana) ? charStats.mana[Math.min(levelIndex, charStats.mana.length - 1)] : charStats.mana,
            faction: faction,
            level: msg.level || 1,
            xp: 0,
            maxXp: 100,
            isDead: false,
            respawnTime: null,
            disconnected: false,
            ts: Date.now(),
        };
        this.players.set(id, player);
        return player;
    }

    updatePlayer(id, msg) {
        const p = this.players.get(id);
        if (!p) return null;
        if (p.isDead) return p; // Prevent movement if dead

        p.x = +msg.x || 0;
        p.y = +msg.y || 0.5;
        p.z = +msg.z || 0;
        p.rotY = +msg.rotY || 0;
        p.ts = Date.now();
        return p;
    }

    removePlayer(id) {
        return this.players.delete(id);
    }

    setPlayerDisconnected(id, isDisconnected) {
        const p = this.players.get(id);
        if (p) {
            p.disconnected = isDisconnected;
            return true;
        }
        return false;
    }

    addProjectile(shooterId, x, y, z, angle) {
        const shooter = this.players.get(shooterId);
        if (shooter && shooter.isDead) return; // Prevent shooting if dead

        this.projectiles.push({
            shooterId,
            x,
            y,
            z,
            vx: Math.sin(angle),
            vz: Math.cos(angle),
            distTraveled: 0,
        });
    }

    update(dt) {
        const events = [];

        // Autonomous movement for disconnected players
        for (const p of this.players.values()) {
            if (p.disconnected) {
                const spawn = p.faction === "blue" ? config.locations.spawnTeamA : config.locations.spawnTeamB;
                const dx = spawn.x - p.x;
                const dz = spawn.y - p.z; // Note: config uses y for z in 2D representation usually, but let's check config.js. 
                // Config has x, y. In 3D game, y is up. So config y maps to z.

                const dist = Math.hypot(dx, dz);
                const speed = 3.5; // Same as player speed

                if (dist > 0.1) {
                    const move = speed * dt;
                    p.x += (dx / dist) * move;
                    p.z += (dz / dist) * move;
                    p.rotY = Math.atan2(dx, dz);
                    p.ts = Date.now();

                    // We need to broadcast this movement, but update() returns events.
                    // We can add a special event or just rely on the fact that we don't usually broadcast position from update()
                    // The server usually trusts clients. But here server drives.
                    // We need to emit a 'player-moved' event or similar if we want clients to see it smoothly.
                    // However, the current architecture relies on clients sending 'state'.
                    // We need to inject a state update event.

                    // Let's add a custom event type for server-driven movement
                    events.push({
                        type: "server-player-move",
                        id: p.id,
                        x: p.x,
                        y: p.y,
                        z: p.z,
                        rotY: p.rotY
                    });
                }
            }
        }

        // Health and Mana Regeneration
        for (const p of this.players.values()) {
            const charStats = characters.chars[p.character];
            if (!charStats) continue;

            let updated = false;

            // Get level-based stat index
            const levelIndex = Math.max(0, (p.level || 1) - 1);

            // Health regeneration
            if (p.health < p.maxHealth) {
                const regenRate = Array.isArray(charStats.HealthRegeneration)
                    ? charStats.HealthRegeneration[Math.min(levelIndex, charStats.HealthRegeneration.length - 1)]
                    : charStats.HealthRegeneration;
                p.health += regenRate * dt;
                if (p.health > p.maxHealth) p.health = p.maxHealth;
                updated = true;
            }

            // Mana regeneration
            if (p.mana < p.maxMana) {
                const regenRate = Array.isArray(charStats.manaRegeneration)
                    ? charStats.manaRegeneration[Math.min(levelIndex, charStats.manaRegeneration.length - 1)]
                    : charStats.manaRegeneration;
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

        // Update Minions
        const minionEvents = this.minionManager.update(dt, this.players, this.structures);
        events.push(...minionEvents);

        // Death and Respawn System
        const now = Date.now();
        for (const p of this.players.values()) {
            // Check for death
            if (!p.isDead && p.health < 1) {
                p.isDead = true;
                const respawnDelay = p.level * 5000; // 5 seconds per level
                p.respawnTime = now + respawnDelay;

                events.push({
                    type: "player-death",
                    id: p.id,
                    respawnTime: p.respawnTime
                });

                console.log(`[Game] Player ${p.id} died, respawn in ${respawnDelay / 1000}s`);

                // XP Gain for Attacker
                if (p.lastAttackerId) {
                    const attacker = this.players.get(p.lastAttackerId);
                    if (attacker && attacker.faction !== p.faction) {
                        const xpGain = 50 * p.level;
                        attacker.xp += xpGain;
                        console.log(`[Game] Player ${attacker.id} gained ${xpGain} XP`);

                        // Check Level Up
                        let leveledUp = false;
                        while (attacker.xp >= attacker.maxXp) {
                            attacker.xp -= attacker.maxXp;
                            attacker.level++;
                            leveledUp = true;
                            attacker.maxXp = attacker.level * 100;
                            attacker.health = attacker.maxHealth; // Heal on level up? Maybe.
                            attacker.mana = attacker.maxMana;
                            console.log(`[Game] Player ${attacker.id} leveled up to ${attacker.level}!`);
                        }

                        if (leveledUp) {
                            updateUserLevel(attacker.id, attacker.level)
                                .then(() => console.log(`[Database] Level for user ${attacker.id} updated to ${attacker.level}.`))
                                .catch(err => console.error(`[Database] Error updating level for user ${attacker.id}:`, err));

                            events.push({
                                type: "level-up",
                                id: attacker.id,
                                level: attacker.level,
                            });
                        }

                        events.push({
                            type: "player-xp",
                            id: attacker.id,
                            xp: attacker.xp,
                            maxXp: attacker.maxXp,
                            level: attacker.level
                        });
                    }
                }
            }

            // Check for respawn
            if (p.isDead && p.respawnTime && now >= p.respawnTime) {
                // Calculate spawn position
                const spawn = p.faction === "blue" ? config.locations.spawnTeamA : config.locations.spawnTeamB;
                const radius = (spawn.w || 5) / 2;
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * radius;
                p.x = spawn.x + Math.cos(angle) * dist;
                p.z = spawn.y + Math.sin(angle) * dist;
                p.y = 0.5;

                // Reset health and state
                p.health = p.maxHealth;
                p.mana = p.maxMana;
                p.isDead = false;
                p.respawnTime = null;
                p.lastAttackerId = null; // Reset attacker

                events.push({
                    type: "player-respawn",
                    id: p.id,
                    x: p.x,
                    y: p.y,
                    z: p.z,
                    health: p.health,
                    maxHealth: p.maxHealth,
                    mana: p.mana,
                    maxMana: p.maxMana
                });

                console.log(`[Game] Player ${p.id} respawned at (${p.x.toFixed(1)}, ${p.z.toFixed(1)})`);
            }
        }

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            const move = this.PROJECTILE_SPEED * dt;
            p.x += p.vx * move;
            p.z += p.vz * move;
            p.distTraveled += move;

            // Check if shooter is a player or minion
            let shooter = this.players.get(p.shooterId);
            let shooterIsMinion = false;

            if (!shooter) {
                // Check if shooter is a minion
                shooter = this.minionManager.getMinionById(p.shooterId);
                if (shooter) {
                    shooterIsMinion = true;
                } else {
                    // Shooter doesn't exist anymore, remove projectile
                    this.projectiles.splice(i, 1);
                    continue;
                }
            }

            // Collision Detection
            let hit = false;

            // 1. Check Player Collision
            for (const [id, player] of this.players) {
                if (id === p.shooterId || player.isDead || player.faction === shooter.faction) continue; // Don't hit self, dead, or friendly players

                const dx = p.x - player.x;
                const dz = p.z - player.z;
                // Simple radius check (0.5)
                if (Math.hypot(dx, dz) < 0.5) {
                    hit = true;

                    // Apply Damage based on shooter type
                    let damage = 10;
                    if (shooterIsMinion) {
                        const minionsData = require("./minions.js");
                        const minionStats = minionsData.chars[shooter.name];
                        damage = minionStats ? minionStats.autoAttackDamage[0] : 10;
                    } else {
                        const charStats = characters.chars[shooter.character];
                        damage = charStats ? charStats.autoAttackDamage[0] : 10;
                    }

                    player.health -= damage;
                    player.lastAttackerId = p.shooterId; // Track attacker
                    if (player.health < 0) player.health = 0;

                    events.push({
                        type: "hit",
                        shooterId: p.shooterId,
                        shooterType: shooterIsMinion ? "minion" : "player",
                        targetId: id,
                        targetType: "player",
                        damage,
                        targetHealth: player.health,
                        targetMaxHealth: player.maxHealth
                    });
                    break;
                }
            }

            // 2. Check Minion Collision (if not hit player)
            if (!hit) {
                const minions = this.minionManager.getMinions();
                for (const minion of minions) {
                    if (minion.id === p.shooterId || minion.isDead || minion.faction === shooter.faction) continue;

                    const dx = p.x - minion.x;
                    const dz = p.z - minion.z;
                    if (Math.hypot(dx, dz) < 0.5) {
                        hit = true;

                        // Apply Damage based on shooter type
                        let damage = 10;
                        if (shooterIsMinion) {
                            const minionsData = require("./minions.js");
                            const minionStats = minionsData.chars[shooter.name];
                            damage = minionStats ? minionStats.autoAttackDamage[0] : 10;
                        } else {
                            const charStats = characters.chars[shooter.character];
                            damage = charStats ? charStats.autoAttackDamage[0] : 10;
                        }

                        const damageResult = this.minionManager.damageMinion(minion.id, damage, p.shooterId);

                        if (damageResult) {
                            events.push({
                                type: "minion-hit",
                                shooterId: p.shooterId,
                                shooterType: shooterIsMinion ? "minion" : "player",
                                targetId: minion.id,
                                targetType: "minion",
                                damage,
                                targetHealth: damageResult.health,
                                targetMaxHealth: damageResult.maxHealth,
                                isDead: damageResult.isDead
                            });

                            // If minion died, clean up its projectiles
                            if (damageResult.isDead) {
                                this.minionManager.cleanupMinionProjectiles(minion.id, this.projectiles);
                            }
                        }
                        break;
                    }
                }
            }

            // 3. Check Structure Collision (if not hit player or minion)
            if (!hit) {
                for (const [key, str] of Object.entries(this.structures)) {
                    if (str.isDead) continue;

                    // Check faction (don't hit friendly bases)
                    // Assuming BaseTeamA is for Team A (blue) and BaseTeamB is for Team B (red)
                    // If shooter is blue, they shouldn't hit BaseTeamA
                    let isFriendly = false;
                    if (shooter.faction === "blue" && key === "BaseTeamA") isFriendly = true;
                    if (shooter.faction === "red" && key === "BaseTeamB") isFriendly = true;

                    if (isFriendly) continue;

                    const dx = p.x - str.x;
                    const dz = p.z - str.y; // Config y is Z in 3D
                    const radius = str.collisionRadius || 4; // Default to 4 if not set

                    if (Math.hypot(dx, dz) < radius) {
                        hit = true;

                        // Apply Damage based on shooter type
                        let damage = 10;
                        if (shooterIsMinion) {
                            const minionsData = require("./minions.js");
                            const minionStats = minionsData.chars[shooter.name];
                            damage = minionStats ? minionStats.autoAttackDamage[0] : 10;
                        } else {
                            const charStats = characters.chars[shooter.character];
                            damage = charStats ? charStats.autoAttackDamage[0] : 10;
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
                        break;
                    }
                }
            }

            if (hit || p.distTraveled >= this.PROJECTILE_RANGE) {
                this.projectiles.splice(i, 1);
            }
        }
        return events;
    }

    getPlayers() {
        return Object.fromEntries(this.players);
    }

    getPlayersList() {
        return Array.from(this.players.values()).map((p) => ({
            name: p.name,
            color: p.color,
            character: p.character,
        }));
    }

    getStructures() {
        return this.structures;
    }
}

// Export the class itself, not an instance
// Each room will create its own Game instance
module.exports = Game;
