// Room Routes Module
// API routes for room management

const characters = require("../server_side/characters.js");

/**
 * Setup all room API routes
 * @param {Express} app - Express application
 * @param {Function} requireAuth - Authentication middleware
 * @param {RoomManager} roomManager - Room manager instance
 * @param {Function} broadcastToRoom - Broadcast function
 */
function setupRoomRoutes(app, requireAuth, roomManager, broadcastToRoom) {
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
}

module.exports = {
    setupRoomRoutes,
};
