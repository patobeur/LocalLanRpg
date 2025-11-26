// Serveur WebSocket pour jeu LAN (2 joueurs ou plus) avec envoi de l'IP locale

const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const os = require("os");
const session = require("express-session");
const characters = require("./server_side/characters.js");
const authRoutes = require("./authRoutes");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
	secret: "local-lan-rpg-secret-key-change-in-production",
	resave: false,
	saveUninitialized: false,
	cookie: {
		maxAge: 24 * 60 * 60 * 1000, // 24 hours
		secure: false // set to true if using HTTPS
	}
}));

// Auth routes
app.use('/api/auth', authRoutes);

// Servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static(__dirname));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

// Middleware d'authentification
function requireAuth(req, res, next) {
	if (req.session && req.session.userId) {
		return next();
	}
	res.redirect('/login.html');
}

// Route par défaut - redirige vers login si non authentifié
app.get("/", (req, res) => {
	if (req.session && req.session.userId) {
		res.redirect('/jouer.html');
	} else {
		res.redirect('/login.html');
	}
});

// Route du jeu - nécessite authentification
app.get("/jouer.html", requireAuth, (req, res) => {
	res.sendFile(__dirname + "/jouer.html");
});

// Route de connexion - accessible sans auth
app.get("/login.html", (req, res) => {
	res.sendFile(__dirname + "/login.html");
});

// API Personnages
app.get("/api/characters", (req, res) => {
	res.json(characters);
});

const wss = new WebSocket.Server({ server });

const game = require("./server_side/game.js");

// Obtenir toutes les IPs locales disponibles
function getLocalIPs() {
	return Object.values(os.networkInterfaces())
		.flat()
		.filter((net) => net.family === "IPv4" && !net.internal)
		.map((net) => `ws://${net.address}:${PORT}`);
}

function broadcast(obj, excludeId = null) {
	const msg = JSON.stringify(obj);
	for (const client of wss.clients) {
		if (client.readyState === WebSocket.OPEN && client.id !== excludeId) {
			client.send(msg);
		}
	}
}

wss.on("connection", (ws) => {
	const id = game.generateId();
	ws.id = id;
	console.log(`[WS] Client connecté: ${id} (Total: ${wss.clients.size})`);

	// Envoi IP serveur + état initial
	ws.send(JSON.stringify({ type: "server-ip", ips: getLocalIPs() }));

	ws.send(
		JSON.stringify({
			type: "hello",
			id,
			players: game.getPlayers(),
		})
	);

	ws.send(
		JSON.stringify({
			type: "players-list",
			players: game.getPlayersList(),
		})
	);

	ws.on("message", (data) => {
		let msg;
		try {
			msg = JSON.parse(data);
		} catch {
			return;
		}

		if (msg.type === "join") {
			const player = game.addPlayer(id, msg);
			broadcast({ type: "player-join", player }, id);
		}

		if (msg.type === "state") {
			const p = game.updatePlayer(id, msg);
			if (p) {
				broadcast(
					{
						type: "player-state",
						id,
						x: p.x,
						y: p.y,
						z: p.z,
						rotY: p.rotY,
						ts: p.ts,
					},
					id
				);
			}
		}

		if (msg.type === "shoot") {
			// Add projectile to server game state
			game.addProjectile(id, msg.x, msg.y, msg.z, msg.angle);

			// Broadcast shoot event to all other players (for visuals)
			broadcast(
				{
					type: "shoot",
					shooterId: id,
					x: msg.x,
					y: msg.y,
					z: msg.z,
					angle: msg.angle,
				},
				id
			);
		}

		// Client no longer sends 'hit' messages
	});

	ws.on("close", () => {
		console.log(`[WS] Client parti: ${id} (Total: ${wss.clients.size})`);
		if (game.removePlayer(id)) {
			console.log(`[WS] Joueur ${id} supprimé du jeu.`);
			broadcast({ type: "player-leave", id });
		} else {
			console.log(`[WS] Joueur ${id} introuvable lors de la suppression.`);
		}
	});
});

// Server Game Loop (60 FPS)
setInterval(() => {
	const dt = 1 / 60;
	const events = game.update(dt);

	events.forEach((e) => {
		if (e.type === "hit") {
			// Broadcast health update
			broadcast({
				type: "player-health",
				id: e.targetId,
				health: e.targetHealth,
				maxHealth: e.targetMaxHealth,
			});

			// Broadcast projectile hit to remove projectile on other clients
			broadcast({
				type: "projectile-hit",
				shooterId: e.shooterId,
				targetId: e.targetId,
			});

			console.log(`[Game] Player ${e.shooterId} hit Player ${e.targetId} for ${e.damage} dmg. HP: ${e.targetHealth}`);
		}
	});
}, 1000 / 60);

server.listen(PORT, () => {
	console.log(`[HTTP] Serveur démarré sur http://0.0.0.0:${PORT}`);
	console.log(`[WSWebSocket prêt`);
	console.log("IP(s) locale(s) :", getLocalIPs().join(", "));
});
