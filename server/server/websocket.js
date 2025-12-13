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
function setupWebSocket(server, roomManager, sessionMiddleware) {
    wss = new WebSocket.Server({ server });

    wss.on("connection", (ws, req) => {
        // Use session middleware to parse session
        sessionMiddleware(req, {}, () => {
            if (!req.session || !req.session.userId) {
                console.log("[WS] Connection rejected: No active session");
                ws.close();
                return;
            }

            // Trust the session ID, not the client claims
            ws.userId = req.session.userId;
            console.log(`[WS] Client connected (Total: ${wss.clients.size}) - UserID: ${ws.userId}`);

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
                    // Enforce identity from session
                    const playerId = ws.userId;

                    ws.roomId = roomId;
                    ws.playerId = playerId;

                    const room = roomManager.getRoom(roomId);
                    if (!room || !room.game) {
                        console.error(`[WS] Game not found for room ${roomId}`);
                        return;
                    }

                    console.log(
                        `[WS] Player ${playerId} (Session Verified) joined game in room ${roomId}`
                    );

                    // Add player to game if not already present
                    if (!room.game.players.has(playerId)) {
                        const roomPlayer = room.players.get(playerId);
                        if (roomPlayer) {
                            // Create a message with player info including faction
                            const playerMsg = {
                                name: roomPlayer.username,
                                color: roomPlayer.faction === "blue" ? "#4A90E2" : "#E74C3C",
                                character: roomPlayer.character,
                                faction: roomPlayer.faction,
                            };
                            room.game.addPlayer(playerId, playerMsg);
                            console.log(
                                `[WS] Added player ${playerId} to game with faction ${roomPlayer.faction}`
                            );
                        } else {
                            // This handles the case where session ID exists but player isn't in room list? 
                            // Might happen if server restarted but client kept session cookie.
                            console.warn(`[WS] Player ${playerId} not found in room ${roomId} player list`);
                        }
                    } else {
                        // Player reconnecting
                        room.game.setPlayerDisconnected(playerId, false);
                    }

                    // Send hello with room's game state (now includes this player)
                    ws.send(
                        JSON.stringify({
                            type: "hello",
                            id: playerId,
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
                    // Security: ws.playerId is derived from session, so we can trust it matches the connection

                    const room = roomManager.getRoom(ws.roomId);
                    if (!room || !room.game) return;

                    const p = room.game.updatePlayer(ws.playerId, msg);
                    if (p) {
                        // We are now batching, so no need to broadcast here? 
                        // Wait, in previous step I removed broadcast for 'state'?
                        // No, I only Batched 'server-player-move'. 
                        // Check Step 16: "if (msg.type === 'state') ... broadcastToRoom"
                        // Check Step 66 (Game Loop): It reads "server-player-move".
                        // Wait, does updatePlayer return an event or update internal state?
                        // In `game.js`: `updatePlayer` calls `playerManager.updatePlayer`.
                        // `playerManager.updatePlayer` updates the object.
                        // `game.update()` generates events based on state?
                        // Loop logic (Step 66) iterates `events` from `room.game.update(dt)`.
                        // BUT `server/server/websocket.js` (Step 16) ALSO broadcasts "player-state" immediately upon receiving message.
                        // This is DOUBLE broadcasting!
                        // One from client input -> broadcast immediately (to reduce latency?)
                        // One from server loop -> broadcast authoritative state.
                        // If I use batching, I should probably STOP broadcasting here and let the server loop handle it.
                        // BUT `updatePlayer` in `websocket.js` updates the server state.
                        // Does `game.js`'s `update(dt)` emit "server-player-move"?
                        // I need to check `Game.update` or `PlayerManager.update`.
                        // Assuming the optimization task was correct, the `game.update` emits the moves.
                        // So I should REMOVE the broadcast here to fully realize the optimization benefits.
                        // AND for security, it makes sense.
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
