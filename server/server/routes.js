// Routes Module
// HTTP routes for serving HTML pages

const path = require("path");
const characters = require("../server_side/characters");
const skills = require("../server_side/skills.js");
const config = require("../server_side/config.js");
const { getAllUsersStats } = require("../database.js");

/**
 * Setup all HTTP routes for pages
 * @param {Express} app - Express application
 * @param {Function} requireAuth - Authentication middleware
 * @param {RoomManager} roomManager - Room manager instance
 */
function setupRoutes(app, requireAuth, roomManager) {
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
			if (
				room.status === "playing" &&
				room.players.has(req.session.userId)
			) {
				return res.redirect(`/jouer.html?roomId=${room.id}`);
			}
		}
		res.sendFile(path.join(__dirname, "../../public/lobby.html"));
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
		res.sendFile(path.join(__dirname, "../../public/room.html"));
	});

	// Route du jeu - nécessite authentification
	app.get("/jouer.html", requireAuth, (req, res) => {
		res.sendFile(path.join(__dirname, "../../public/jouer.html"));
	});

	// Route pour la vue des modèles 3D - nécessite authentification
	app.get("/meshes3d.html", requireAuth, (req, res) => {
		res.sendFile(path.join(__dirname, "../../public/meshes3d.html"));
	});

	// Route pour la page des statistiques des joueurs - nécessite authentification
	app.get("/players.html", requireAuth, (req, res) => {
		res.sendFile(path.join(__dirname, "../../public/players.html"));
	});

	// Route de connexion - accessible sans auth
	app.get("/login.html", (req, res) => {
		res.sendFile(path.join(__dirname, "../../public/login.html"));
	});
	// API Players Stats
	app.get("/api/players/stats", requireAuth, async (req, res) => {
		try {
			const players = await getAllUsersStats();
			res.json(players);
		} catch (error) {
			console.error("Error fetching players stats:", error);
			res.status(500).json({ error: "Failed to fetch players stats" });
		}
	});

	// API Personnages
	app.get("/api/characters", (req, res) => {
		// Enrich character data with skills
		const enrichedChars = JSON.parse(JSON.stringify(characters)); // Deep copy

		for (const charKey in enrichedChars.chars) {
			const char = enrichedChars.chars[charKey];
			char.skills = [];

			// Map skill IDs to skill objects
			if (char.skill1Id !== undefined && skills[char.skill1Id])
				char.skills.push(skills[char.skill1Id]);
			if (char.skill2Id !== undefined && skills[char.skill2Id])
				char.skills.push(skills[char.skill2Id]);
			if (char.skill3Id !== undefined && skills[char.skill3Id])
				char.skills.push(skills[char.skill3Id]);
			if (char.ultimatId !== undefined && skills[char.ultimatId])
				char.skills.push(skills[char.ultimatId]);
		}

		res.json(enrichedChars);
	});
	// API Configuration
	app.get("/api/config", (req, res) => {
		res.json(config.GAME_CONSTANTS);
	});
}

module.exports = {
	setupRoutes,
};
