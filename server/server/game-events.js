// Game Events Module
// Handles game loop and broadcasts game events to clients

/**
 * Setup game loop for all active rooms
 * @param {RoomManager} roomManager - Room manager instance
 * @param {Function} broadcastToRoom - Broadcast function
 */
function setupGameLoop(roomManager, broadcastToRoom) {
    setInterval(() => {
        const dt = 1 / 60;

        for (const room of roomManager.rooms.values()) {
            if (room.status === "playing" && room.game) {
                const events = room.game.update(dt);

                events.forEach((e) => {
                    if (e.type === "server-player-move") {
                        broadcastToRoom(room.id, {
                            type: "player-state",
                            id: e.id,
                            x: e.x,
                            y: e.y,
                            z: e.z,
                            rotY: e.rotY,
                            ts: Date.now(), // Use current time for sync
                        });
                    } else if (e.type === "player-regen") {
                        broadcastToRoom(room.id, {
                            type: "player-health",
                            id: e.id,
                            health: e.health,
                            maxHealth: e.maxHealth,
                            mana: e.mana,
                            maxMana: e.maxMana,
                        });
                    } else if (e.type === "hit") {
                        // Broadcast to room only
                        broadcastToRoom(room.id, {
                            type: "player-health",
                            id: e.targetId,
                            health: e.targetHealth,
                            maxHealth: e.targetMaxHealth,
                        });

                        broadcastToRoom(room.id, {
                            type: "projectile-hit",
                            shooterId: e.shooterId,
                            targetId: e.targetId,
                        });

                        console.log(
                            `[Game Room ${room.id}] Player ${e.shooterId} hit Player ${e.targetId} for ${e.damage} dmg. HP: ${e.targetHealth}`
                        );
                    } else if (e.type === "player-death") {
                        // Broadcast death to all clients
                        broadcastToRoom(room.id, {
                            type: "player-death",
                            id: e.id,
                            respawnTime: e.respawnTime,
                        });
                    } else if (e.type === "player-respawn") {
                        // Broadcast respawn to all clients
                        broadcastToRoom(room.id, {
                            type: "player-respawn",
                            id: e.id,
                            x: e.x,
                            y: e.y,
                            z: e.z,
                            health: e.health,
                            maxHealth: e.maxHealth,
                            mana: e.mana,
                            maxMana: e.maxMana,
                        });
                    } else if (e.type === "player-xp") {
                        broadcastToRoom(room.id, {
                            type: "player-xp",
                            id: e.id,
                            xp: e.xp,
                            maxXp: e.maxXp,
                            level: e.level,
                        });
                    }
                });
            }
        }
    }, 1000 / 60);
}

module.exports = {
    setupGameLoop,
};
