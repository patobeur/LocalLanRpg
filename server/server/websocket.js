// WebSocket Module
// Handles WebSocket connections and message routing

const WebSocket = require("ws");
const config = require("../server_side/config.js");

let wss = null;

/**
 * Broadcast to all clients in a specific room
 * @param {string} roomId - Room ID
 * @param {object} obj - Object to broadcast
 * @param {WebSocket} excludeWs - WebSocket to exclude (optional)
 */
function broadcastToRoom(roomId, obj, excludeWs = null) {
    const msg = JSON.stringify(obj);
    for (const client of wss.clients) {
        if (
            client.readyState === WebSocket.OPEN &&
            client.roomId === roomId &&
            client !== excludeWs
        ) {
            client.send(msg);
        }
    }
}

/**
 * Setup WebSocket server and handlers
 * @param {http.Server} server - HTTP server instance
 * @param {RoomManager} roomManager - Room manager instance
 * @returns {WebSocket.Server} WebSocket server instance
 */
function setupWebSocket(server, roomManager) {
    wss = new WebSocket.Server({ server });

    wss.on("connection", (ws) => {
        console.log(`[WS] Client connected (Total: ${wss.clients.size})`);

        ws.on("message", (data) => {
            let msg;
            try {
                msg = JSON.parse(data);
            } catch {
                return;
            }

            // Join room (from room.html)
            if (msg.type === "join-room") {
                ws.roomId = msg.roomId;
                console.log(`[WS] Client joined room ${msg.roomId}`);

                // Send current room state
                const room = roomManager.getRoom(msg.roomId);
                if (room) {
                    ws.send(
                        JSON.stringify({
                            type: "room-update",
                            players: room.getPlayersList(),
                        })
                    );
                }
            }

            // Room changed (faction or character selected)
            if (msg.type === "room-changed") {
                const room = roomManager.getRoom(msg.roomId);
                if (room) {
                    // Broadcast update to all in room
                    broadcastToRoom(msg.roomId, {
                        type: "room-update",
                        players: room.getPlayersList(),
                    });
                }
            }

            // Start game
            if (msg.type === "start-game") {
                // Broadcast to all players in room
                broadcastToRoom(msg.roomId, {
                    type: "game-start",
                    roomId: msg.roomId,
                });
            }

            // === GAME WEBSOCKET (from jouer.html) ===

            if (msg.type === "join-game") {
                const roomId = msg.roomId;
                ws.roomId = roomId;
                ws.playerId = msg.playerId;

                const room = roomManager.getRoom(roomId);
                if (!room || !room.game) {
                    console.error(`[WS] Game not found for room ${roomId}`);
                    return;
                }

                console.log(
                    `[WS] Player ${msg.playerId} joined game in room ${roomId}`
                );

                // Add player to game if not already present
                if (!room.game.players.has(msg.playerId)) {
                    const roomPlayer = room.players.get(msg.playerId);
                    if (roomPlayer) {
                        // Create a message with player info including faction
                        const playerMsg = {
                            name: roomPlayer.username,
                            color: roomPlayer.faction === "blue" ? "#4A90E2" : "#E74C3C",
                            character: roomPlayer.character,
                            faction: roomPlayer.faction,
                        };
                        room.game.addPlayer(msg.playerId, playerMsg);
                        console.log(
                            `[WS] Added player ${msg.playerId} to game with faction ${roomPlayer.faction}`
                        );
                    }
                } else {
                    // Player reconnecting
                    room.game.setPlayerDisconnected(msg.playerId, false);
                }

                // Send hello with room's game state (now includes this player)
                ws.send(
                    JSON.stringify({
                        type: "hello",
                        id: msg.playerId,
                        players: room.game.getPlayers(),
                        minions: room.game.minionManager.getMinions(),
                        config: {
                            locations: config.locations,
                            structures: room.game.getStructures(),
                        },
                    })
                );
            }

            if (msg.type === "join") {
                if (!ws.roomId || !ws.playerId) return;

                const room = roomManager.getRoom(ws.roomId);
                if (!room || !room.game) return;

                // Player was already added during "join-game", just broadcast to others
                const player = room.game.players.get(ws.playerId);
                if (player) {
                    broadcastToRoom(ws.roomId, { type: "player-join", player }, ws);
                }
            }

            if (msg.type === "state") {
                if (!ws.roomId || !ws.playerId) return;

                const room = roomManager.getRoom(ws.roomId);
                if (!room || !room.game) return;

                const p = room.game.updatePlayer(ws.playerId, msg);
                if (p) {
                    broadcastToRoom(
                        ws.roomId,
                        {
                            type: "player-state",
                            id: ws.playerId,
                            x: p.x,
                            y: p.y,
                            z: p.z,
                            rotY: p.rotY,
                            ts: p.ts,
                        },
                        ws
                    );
                }
            }

            if (msg.type === "shoot") {
                if (!ws.roomId || !ws.playerId) return;

                const room = roomManager.getRoom(ws.roomId);
                if (!room || !room.game) return;

                room.game.addProjectile(ws.playerId, msg.x, msg.y, msg.z, msg.angle);

                broadcastToRoom(
                    ws.roomId,
                    {
                        type: "shoot",
                        shooterId: ws.playerId,
                        x: msg.x,
                        y: msg.y,
                        z: msg.z,
                        angle: msg.angle,
                    },
                    ws
                );
            }

            // Handle assets-loaded
            if (msg.type === "assets-loaded") {
                if (!ws.roomId || !ws.playerId) return;

                const room = roomManager.getRoom(ws.roomId);
                if (!room) return;

                // Mark player as asset-ready
                roomManager.setPlayerAssetsLoaded(ws.roomId, ws.playerId);
                console.log(`[WS] Player ${ws.playerId} assets loaded`);

                // Get list of ready players
                const readyPlayers = room.getPlayersList()
                    .filter(p => p.assetsLoaded)
                    .map(p => p.username);

                // Broadcast updated ready list to all in room
                broadcastToRoom(ws.roomId, {
                    type: "ready-players-update",
                    readyPlayers: readyPlayers
                });

                // Check if all players are ready
                if (room.allPlayersAssetsLoaded()) {
                    console.log(`[WS] All players in room ${ws.roomId} have loaded assets!`);
                    // Broadcast game start
                    broadcastToRoom(ws.roomId, {
                        type: "all-players-ready"
                    });
                }
            }
        });

        ws.on("close", () => {
            console.log(`[WS] Client disconnected (Total: ${wss.clients.size})`);

            if (ws.roomId && ws.playerId) {
                const room = roomManager.getRoom(ws.roomId);
                if (room) {
                    if (room.status === "playing" && room.game) {
                        // Game in progress: Mark as disconnected but keep in game
                        room.game.setPlayerDisconnected(ws.playerId, true);
                        console.log(
                            `[WS] Player ${ws.playerId} disconnected (kept in game)`
                        );
                    } else {
                        // Lobby/Waiting: Remove player
                        if (roomManager.leaveRoom(ws.roomId, ws.playerId)) {
                            console.log(
                                `[WS] Player ${ws.playerId} left room ${ws.roomId}`
                            );
                            broadcastToRoom(ws.roomId, {
                                type: "room-update",
                                players: room.getPlayersList(),
                            });
                        }
                    }
                }
            }
        });
    });

    return wss;
}

/**
 * Get WebSocket server instance
 * @returns {WebSocket.Server}
 */
function getWebSocketServer() {
    return wss;
}

module.exports = {
    setupWebSocket,
    broadcastToRoom,
    getWebSocketServer,
};
