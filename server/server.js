// Server Entry Point - Simplified
// Orchestrates all server modules

const express = require("express");
const http = require("http");
const roomManager = require("./server_side/rooms.js");

// Import server modules
const { setupApp, requireAuth } = require("./server/app-config.js");
const { setupRoutes } = require("./server/routes.js");
const { setupRoomRoutes } = require("./server/room-routes.js");
const { setupWebSocket, broadcastToRoom } = require("./server/websocket.js");
const { setupGameLoop } = require("./server/game-events.js");
const { startServer, setupShutdownHandlers } = require("./server/lifecycle.js");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8080;

// Setup app configuration (middleware, static files, sessions)
setupApp(app);

// Setup HTTP routes (pages and API)
setupRoutes(app, requireAuth, roomManager);
setupRoomRoutes(app, requireAuth, roomManager, broadcastToRoom);

// Setup WebSocket server
const wss = setupWebSocket(server, roomManager);

// Setup game loop (60 FPS)
setupGameLoop(roomManager, broadcastToRoom);

// Start server and setup shutdown handlers
startServer(server, PORT);
setupShutdownHandlers(server, wss);
