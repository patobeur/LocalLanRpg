// Serveur WebSocket pour jeu LAN (2 joueurs ou plus) avec envoi de l'IP locale

const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const os = require("os");
const path = require("path");
const session = require("express-session");
const characters = require("./server_side/characters.js");
const authRoutes = require("./authRoutes");
const roomManager = require("./server_side/rooms.js");
const Game = require("./server_side/game.js");
const config = require("./server_side/config.js");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
	session({
		secret: "local-lan-rpg-secret-key-change-in-production",
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 24 * 60 * 60 * 1000, // 24 hours
			secure: false, // set to true if using HTTPS
		},
	})
);

// Auth routes
app.use("/api/auth", authRoutes);

// Servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "../public")));
app.use(
	"/node_modules",
	express.static(path.join(__dirname, "../node_modules"))
);
app.use("/media", express.static(path.join(__dirname, "../public/media")));

// Middleware d'authentification
function requireAuth(req, res, next) {
	if (req.session && req.session.userId) {
		return next();
	}
	// For API routes, return JSON error instead of redirecting
	if (req.path.startsWith("/api/")) {
		return res.status(401).json({ error: "Unauthorized" });
	}
	res.redirect("/login.html");
}

// Route par défaut - redirige vers lobby ou jeu si authentifié
app.get("/", (req, res) => {
	if (req.session && req.session.userId) {
		// Check if user is in an active game
		for (const room of roomManager.rooms.values()) {
			if (
				room.status === "playing" &&
				room.players.has(req.session.userId)
			) {
				return res.redirect(`/jouer.html?roomId=${room.id}`);
			}
		}
		res.redirect("/lobby.html");
	} else {
		res.redirect("/login.html");
	}
});

// Route du lobby - nécessite authentification
app.get("/lobby.html", requireAuth, (req, res) => {
	// Check if user is in an active game
	for (const room of roomManager.rooms.values()) {
		if (room.status === "playing" && room.players.has(req.session.userId)) {
			return res.redirect(`/jouer.html?roomId=${room.id}`);
		}
	}
	res.sendFile(path.join(__dirname, "../public/lobby.html"));
});

// Route de room - nécessite authentification
app.get("/room.html", requireAuth, (req, res) => {
	const roomId = req.query.roomId;
	if (roomId) {
		const room = roomManager.getRoom(roomId);
		// If room is playing, redirect to game
		if (room && room.status === "playing") {
			return res.redirect(`/jouer.html?roomId=${roomId}`);
		}
	}
	res.sendFile(path.join(__dirname, "../public/room.html"));
});

// Route du jeu - nécessite authentification
app.get("/jouer.html", requireAuth, (req, res) => {
	res.sendFile(path.join(__dirname, "../public/jouer.html"));
});

// Route de connexion - accessible sans auth
app.get("/login.html", (req, res) => {
	res.sendFile(path.join(__dirname, "../public/login.html"));
});

// API Personnages
app.get("/api/characters", (req, res) => {
	res.json(characters);
});

// ===== ROOM API ROUTES =====

// Get all rooms
app.get("/api/rooms", requireAuth, (req, res) => {
	try {
		const rooms = roomManager.getRoomsList();
		res.json({ success: true, rooms });
	} catch (error) {
		console.error("Get rooms error:", error);
		res.status(500).json({ error: error.message });
	}
});

// Create room
app.post("/api/rooms", requireAuth, (req, res) => {
	const { name } = req.body;
	if (!name || name.trim().length === 0) {
		return res.status(400).json({ error: "Room name is required" });
	}

	try {
		const room = roomManager.createRoom(
			name.trim(),
			req.session.userId,
			req.session.username
		);
		res.json({
			success: true,
			roomId: room.id,
			room: {
				id: room.id,
				name: room.name,
				creatorUsername: room.creatorUsername,
			},
		});
	} catch (error) {
		console.error("Create room error:", error);
		res.status(500).json({ error: error.message });
	}
});

// Get room details
app.get("/api/rooms/:roomId", requireAuth, (req, res) => {
	const { roomId } = req.params;
	try {
		const room = roomManager.getRoom(roomId);
		if (!room) {
			return res.status(404).json({ error: "Room not found" });
		}
		res.json({
			success: true,
			room: {
				id: room.id,
				name: room.name,
				creatorId: room.creatorId,
				creatorUsername: room.creatorUsername,
				status: room.status,
				players: room.getPlayersList(),
			},
		});
	} catch (error) {
		console.error("Get room error:", error);
		res.status(500).json({ error: error.message });
	}
});

// Join room
app.post("/api/rooms/:roomId/join", requireAuth, (req, res) => {
	const { roomId } = req.params;
	try {
		const room = roomManager.joinRoom(
			roomId,
			req.session.userId,
			req.session.username
		);
		res.json({ success: true, roomId: room.id });
	} catch (error) {
		console.error("Join room error:", error);
		res.status(400).json({ error: error.message });
	}
});

// Leave room
app.post("/api/rooms/:roomId/leave", requireAuth, (req, res) => {
	const { roomId } = req.params;
	try {
		const room = roomManager.getRoom(roomId);
		if (!room) {
			return res.status(404).json({ error: "Room not found" });
		}

		const { removed, leftGame } = roomManager.leaveRoom(
			roomId,
			req.session.userId
		);

		if (removed) {
			// Broadcast to all clients in the room that the player has left.
			broadcastToRoom(roomId, {
				type: "room-update",
				players: room.getPlayersList(),
			});
		}

		if (leftGame) {
			broadcastToRoom(roomId, {
				type: "player-left",
				id: req.session.userId,
			});
		}
		res.json({ success: true });
	} catch (error) {
		console.error("Leave room error:", error);
		res.status(500).json({ error: error.message });
	}
});

// Set faction
app.post("/api/rooms/:roomId/faction", requireAuth, (req, res) => {
	const { roomId } = req.params;
	const { faction } = req.body;

	if (!faction || (faction !== "blue" && faction !== "red")) {
		return res
			.status(400)
			.json({ error: "Invalid faction. Must be 'blue' or 'red'" });
	}

	try {
		roomManager.setPlayerFaction(roomId, req.session.userId, faction);
		res.json({ success: true });
	} catch (error) {
		console.error("Set faction error:", error);
		res.status(400).json({ error: error.message });
	}
});

// Set character
app.post("/api/rooms/:roomId/character", requireAuth, (req, res) => {
	const { roomId } = req.params;
	const { character } = req.body;

	if (!character || !characters.chars[character]) {
		return res.status(400).json({ error: "Invalid character" });
	}

	try {
		roomManager.setPlayerCharacter(roomId, req.session.userId, character);
		res.json({ success: true });
	} catch (error) {
		console.error("Set character error:", error);
		res.status(400).json({ error: error.message });
	}
});

// Start game
app.post("/api/rooms/:roomId/start", requireAuth, (req, res) => {
	const { roomId } = req.params;
	try {
		const room = roomManager.startGame(roomId, req.session.userId);
		res.json({ success: true, roomId: room.id });
	} catch (error) {
		console.error("Start game error:", error);
		res.status(400).json({ error: error.message });
	}
});

const wss = new WebSocket.Server({ server });

// Broadcast to all clients in a specific room
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
					config: {
						locations: config.locations,
						structures: config.structures,
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

// Game loop for all active rooms
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
						level: e.level
					});
				}
			});
		}
	}
}, 1000 / 60);

server.listen(PORT, () => {
	console.log(`[HTTP] Serveur démarré sur http://0.0.0.0:${PORT}`);
	console.log(`[WS] Serveur WebSocket prêt`);
	console.log("Système de rooms activé");
});

// Handle server shutdown
const shutdown = () => {
	console.log("Shutting down server...");
	// Broadcast shutdown to all clients
	for (const client of wss.clients) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(JSON.stringify({ type: "server-shutdown" }));
		}
	}
	server.close(() => {
		console.log("Server closed");
		process.exit(0);
	});
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
