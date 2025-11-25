const characters = require("./characters.js");

class Game {
    constructor() {
        this.players = new Map();
        this.projectiles = [];
        this.nextId = 1;
        this.PROJECTILE_SPEED = 10;
        this.PROJECTILE_RANGE = 30;
    }

    generateId() {
        return String(this.nextId++);
    }

    addPlayer(id, msg) {
        // Validate character
        let charName = msg.character || "Moumba";
        if (!characters.chars[charName]) {
            charName = "Moumba";
        }
        const charStats = characters.chars[charName];

        const player = {
            id,
            name: (msg.name || `Joueur ${id}`).slice(0, 16),
            color: msg.color || "#4CAF50",
            character: charName,
            x: 0,
            y: 0.5,
            z: 0,
            rotY: 0,
            health: charStats.health,
            maxHealth: charStats.health,
            ts: Date.now(),
        };
        this.players.set(id, player);
        return player;
    }

    updatePlayer(id, msg) {
        const p = this.players.get(id);
        if (!p) return null;
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

    addProjectile(shooterId, x, y, z, angle) {
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

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            const move = this.PROJECTILE_SPEED * dt;
            p.x += p.vx * move;
            p.z += p.vz * move;
            p.distTraveled += move;

            // Collision Detection
            let hit = false;
            for (const [id, player] of this.players) {
                if (id === p.shooterId) continue; // Don't hit self

                const dx = p.x - player.x;
                const dz = p.z - player.z;
                // Simple radius check (0.5)
                if (Math.hypot(dx, dz) < 0.5) {
                    hit = true;

                    // Apply Damage
                    const shooter = this.players.get(p.shooterId);
                    if (shooter) {
                        const charStats = characters.chars[shooter.character];
                        const damage = charStats ? charStats.autoAttackDamage[0] : 10;

                        player.health -= damage;
                        if (player.health < 0) player.health = 0;

                        events.push({
                            type: "hit",
                            shooterId: p.shooterId,
                            targetId: id,
                            damage,
                            targetHealth: player.health,
                            targetMaxHealth: player.maxHealth
                        });
                    }
                    break;
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
}

// Export the class itself, not an instance
// Each room will create its own Game instance
module.exports = Game;

