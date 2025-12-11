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
                    } else if (e.type === "player-health") {
                        broadcastToRoom(room.id, {
                            type: "player-health",
                            id: e.id,
                            health: e.health,
                            maxHealth: e.maxHealth,
                            mana: e.mana,
                            maxMana: e.maxMana,
                        });
                    } else if (e.type === "projectile-hit") {
                        broadcastToRoom(room.id, {
                            type: "projectile-hit",
                            shooterId: e.shooterId,
                            targetId: e.targetId,
                        });
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
                    } else if (e.type === "level-up") {
                        // Broadcast level-up to all clients in room
                        broadcastToRoom(room.id, {
                            type: "level-up",
                            id: e.id,
                            level: e.level,
                        });
                    } else if (e.type === "structure-level-up") {
                        broadcastToRoom(room.id, {
                            type: "structure-level-up",
                            structureId: e.structureId,
                            level: e.level
                        });
                    } else if (e.type === "structure-hit") {
                        broadcastToRoom(room.id, {
                            type: "structure-hit",
                            structureId: e.structureId,
                            damage: e.damage,
                            hp: e.hp,
                            maxHp: e.maxHp,
                            shooterId: e.shooterId
                        });

                        // Broadcast projectile-hit so clients can remove the projectile
                        broadcastToRoom(room.id, {
                            type: "projectile-hit",
                            shooterId: e.shooterId,
                            targetId: e.structureId,
                        });
                    } else if (e.type === "structure-death") {
                        broadcastToRoom(room.id, {
                            type: "structure-death",
                            structureId: e.structureId,
                            killerId: e.killerId
                        });
                    } else if (e.type === "minion-spawn") {
                        // Broadcast minion spawn to all clients
                        broadcastToRoom(room.id, {
                            type: "minion-spawn",
                            minion: e.minion
                        });
                    } else if (e.type === "minion-death") {
                        // Broadcast minion death to all clients
                        broadcastToRoom(room.id, {
                            type: "minion-death",
                            minionId: e.minionId
                        });
                    } else if (e.type === "minion-move") {
                        // Broadcast minion movement (throttled by minion manager)
                        broadcastToRoom(room.id, {
                            type: "minion-move",
                            minionId: e.minionId,
                            x: e.x,
                            y: e.y,
                            z: e.z,
                            rotY: e.rotY
                        });
                    } else if (e.type === "minion-attack") {
                        // Minion fired a projectile
                        room.game.addProjectile(e.minionId, e.x, e.y, e.z, e.angle);

                        // Broadcast projectile spawn to all clients
                        broadcastToRoom(room.id, {
                            type: "projectile",
                            shooterId: e.minionId,
                            shooterType: "minion",
                            x: e.x,
                            y: e.y,
                            z: e.z,
                            angle: e.angle
                        });
                    } else if (e.type === "minion-health") {
                        broadcastToRoom(room.id, {
                            type: "minion-health",
                            minionId: e.minionId,
                            health: e.health,
                            maxHealth: e.maxHealth
                        });
                    } else if (e.type === "game-over") {
                        // Broadcast game-over to all clients
                        console.log(`[Game Room ${room.id}] Game Over! Team ${e.winningTeam} wins!`);
                        broadcastToRoom(room.id, {
                            type: "game-over",
                            winningTeam: e.winningTeam,
                            players: e.players
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
