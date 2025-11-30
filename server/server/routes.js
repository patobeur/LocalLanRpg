// Routes Module
// HTTP routes for serving HTML pages

const path = require("path");
const characters = require("../server_side/characters.js");

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
            if (room.status === "playing" && room.players.has(req.session.userId)) {
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

    // Route de connexion - accessible sans auth
    app.get("/login.html", (req, res) => {
        res.sendFile(path.join(__dirname, "../../public/login.html"));
    });

    // API Personnages
    app.get("/api/characters", (req, res) => {
        res.json(characters);
    });
}

module.exports = {
    setupRoutes,
};
