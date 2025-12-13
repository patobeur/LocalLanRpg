// Game Events Module
// Handles game loop and broadcasts game events to clients

/**
 * Setup game loop for all active rooms
 * @param {RoomManager} roomManager - Room manager instance
 * @param {Function} broadcastToRoom - Broadcast function
 */
function setupGameLoop(roomManager, broadcastToRoom) {
    const gameLoopId = setInterval(() => {
        const dt = 1 / 60;

        for (const room of roomManager.rooms.values()) {
            if (room.status === "playing" && room.game) {
                const events = room.game.update(dt);

                // --- Batching Logic ---
                const worldUpdate = {
                    type: "world-state",
                    ts: Date.now(),
                    players: [],
                    minions: [],
                    events: [] // For other one-off events
                };

                events.forEach((e) => {
                    if (e.type === "server-player-move") {
                        const player = room.game.players.get(e.id);
                        if (player) {
                            worldUpdate.players.push({
                                type: "player-state",
                                id: e.id,
                                x: e.x,
                                y: e.y,
                                z: e.z,
                                rotY: e.rotY,
                                level: player.level,
                                ts: Date.now(),
                            });
                        }
                    } else if (e.type === "minion-move") {
                        worldUpdate.minions.push({
                            minionId: e.minionId,
                            x: e.x,
                            y: e.y,
                            z: e.z,
                            rotY: e.rotY
                        });
                    } else if (e.type === "player-regen") {
                        worldUpdate.events.push({
                            type: "player-health",
                            id: e.id,
                            health: e.health,
                            maxHealth: e.maxHealth,
                            mana: e.mana,
                            maxMana: e.maxMana,
                        });
                    } else if (e.type === "player-health") {
                        worldUpdate.events.push({
                            type: "player-health",
                            id: e.id,
                            health: e.health,
                            maxHealth: e.maxHealth,
                            mana: e.mana,
                            maxMana: e.maxMana,
                        });
                    } else if (e.type === "projectile-hit") {
                        worldUpdate.events.push({
                            type: "projectile-hit",
                            shooterId: e.shooterId,
                            targetId: e.targetId,
                        });
                    } else if (e.type === "player-death") {
                        worldUpdate.events.push({
                            type: "player-death",
                            id: e.id,
                            respawnTime: e.respawnTime,
                        });
                    } else if (e.type === "player-respawn") {
                        worldUpdate.events.push({
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
                        worldUpdate.events.push({
                            type: "player-xp",
                            id: e.id,
                            xp: e.xp,
                            maxXp: e.maxXp,
                            level: e.level,
                        });
                    } else if (e.type === "level-up") {
                        worldUpdate.events.push({
                            type: "level-up",
                            id: e.id,
                            level: e.level,
                        });
                    } else if (e.type === "structure-level-up") {
                        worldUpdate.events.push({
                            type: "structure-level-up",
                            structureId: e.structureId,
                            level: e.level
                        });
                    } else if (e.type === "structure-hit") {
                        worldUpdate.events.push({
                            type: "structure-hit",
                            structureId: e.structureId,
                            damage: e.damage,
                            hp: e.hp,
                            maxHp: e.maxHp,
                            shooterId: e.shooterId
                        });

                        // Also broadcast projectile-hit so clients can remove the projectile
                        worldUpdate.events.push({
                            type: "projectile-hit",
                            shooterId: e.shooterId,
                            targetId: e.structureId,
                        });
                    } else if (e.type === "structure-death") {
                        worldUpdate.events.push({
                            type: "structure-death",
                            structureId: e.structureId,
                            killerId: e.killerId
                        });
                    } else if (e.type === "minion-spawn") {
                        worldUpdate.events.push({
                            type: "minion-spawn",
                            minion: e.minion
                        });
                    } else if (e.type === "minion-death") {
                        worldUpdate.events.push({
                            type: "minion-death",
                            minionId: e.minionId
                        });
                    } else if (e.type === "minion-attack") {
                        // Minion fired a projectile - we must add it to the game state locally on server
                        room.game.addProjectile(e.minionId, e.x, e.y, e.z, e.angle);

                        worldUpdate.events.push({
                            type: "projectile",
                            shooterId: e.minionId,
                            shooterType: "minion",
                            x: e.x,
                            y: e.y,
                            z: e.z,
                            angle: e.angle
                        });
                    } else if (e.type === "minion-health") {
                        worldUpdate.events.push({
                            type: "minion-health",
                            minionId: e.minionId,
                            health: e.health,
                            maxHealth: e.maxHealth
                        });
                    } else if (e.type === "game-over") {
                        console.log(`[Game Room ${room.id}] Game Over! Team ${e.winningTeam} wins!`);
                        worldUpdate.events.push({
                            type: "game-over",
                            winningTeam: e.winningTeam,
                            players: e.players
                        });
                    }
                });

                // Only broadcast if there is something to update (usually always true due to movements)
                if (
                    worldUpdate.players.length > 0 ||
                    worldUpdate.minions.length > 0 ||
                    worldUpdate.events.length > 0
                ) {
                    broadcastToRoom(room.id, worldUpdate);
                }
            }
        }
    }, 1000 / 60);

    return () => {
        clearInterval(gameLoopId);
        console.log("[Game] Loop stopped");
    };
}

module.exports = {
    setupGameLoop,
};
