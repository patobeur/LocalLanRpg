const characters = require("../characters");
const config = require("../config.js");

/**
 * PlayerManager
 * Handles player creation, updates, and disconnected player behavior
 */
class PlayerManager {
    constructor() {
        this.players = new Map();
        this.nextId = 1;
    }

    /**
     * Generate a unique player ID
     * @returns {string} Unique ID
     */
    generateId() {
        return String(this.nextId++);
    }

    /**
     * Add a new player to the game
     * @param {string} id - Player ID
     * @param {Object} msg - Player data message
     * @returns {Object} Created player object
     */
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
            sessionXp: 0,

            // Detailed Session Stats
            kills: 0,
            assists: 0,
            damageDealtToPlayers: 0,
            damageDealtToBase: 0,
            damageDealtToMinions: 0,
            minionsKilled: 0,
            damageHistory: [], // Array of { attackerId, timestamp }

            maxXp: 100,
            isDead: false,
            respawnTime: null,
            disconnected: false,
            ts: Date.now(),
        };
        this.players.set(id, player);
        return player;
    }

    /**
     * Update player position and rotation
     * @param {string} id - Player ID
     * @param {Object} msg - Update message with position/rotation data
     * @returns {Object|undefined} Updated player object
     */
    updatePlayer(id, msg) {
        const p = this.players.get(id);
        if (!p) return;

        // Update position and rotation
        if (msg.x !== undefined) p.x = msg.x;
        if (msg.y !== undefined) p.y = msg.y;
        if (msg.z !== undefined) p.z = msg.z;
        if (msg.rotY !== undefined) p.rotY = msg.rotY;

        p.ts = Date.now();
        return p;
    }

    /**
     * Set player disconnected status
     * @param {string} id - Player ID
     * @param {boolean} disconnected - Disconnected status
     */
    setPlayerDisconnected(id, disconnected) {
        const p = this.players.get(id);
        if (p) {
            p.disconnected = disconnected;
        }
    }

    /**
     * Get all players as an object for websocket transmission
     * @returns {Object} Players object
     */
    getPlayers() {
        const playersObj = {};
        for (const [id, p] of this.players) {
            playersObj[id] = p;
        }
        return playersObj;
    }

    /**
     * Get the players Map
     * @returns {Map} Players map
     */
    getPlayersMap() {
        return this.players;
    }

    /**
     * Remove a player from the game
     * @param {string} id - Player ID
     * @returns {boolean} True if player was removed
     */
    removePlayer(id) {
        const p = this.players.get(id);
        if (p) {
            p.disconnected = true;
            return true;
        }
        return false;
    }

    /**
     * Update autonomous movement for disconnected players
     * @param {number} dt - Delta time
     * @param {Array} events - Events array
     */
    updateDisconnectedPlayers(dt, events) {
        for (const p of this.players.values()) {
            if (p.disconnected) {
                const spawn = p.faction === "blue" ? config.locations.spawnTeamA : config.locations.spawnTeamB;
                const dx = spawn.x - p.x;
                const dz = spawn.y - p.z;

                const dist = Math.hypot(dx, dz);
                const speed = 3.5; // Same as player speed

                if (dist > 0.1) {
                    const move = speed * dt;
                    p.x += (dx / dist) * move;
                    p.z += (dz / dist) * move;
                    p.rotY = Math.atan2(dx, dz);
                    p.ts = Date.now();

                    events.push({
                        type: "player-state",
                        id: p.id,
                        x: p.x,
                        y: p.y,
                        z: p.z,
                        rotY: p.rotY
                    });
                }
            }
        }
    }
}

module.exports = PlayerManager;
