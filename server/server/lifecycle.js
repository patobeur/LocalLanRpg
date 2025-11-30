// Lifecycle Module
// Handles server startup and graceful shutdown

const WebSocket = require("ws");

/**
 * Start the HTTP server
 * @param {http.Server} server - HTTP server instance
 * @param {number} PORT - Port number
 */
function startServer(server, PORT) {
    server.listen(PORT, () => {
        console.log(`[HTTP] Serveur démarré sur http://0.0.0.0:${PORT}`);
        console.log(`[WS] Serveur WebSocket prêt`);
        console.log("Système de rooms activé");
    });
}

/**
 * Setup graceful shutdown handlers
 * @param {http.Server} server - HTTP server instance
 * @param {WebSocket.Server} wss - WebSocket server instance
 */
function setupShutdownHandlers(server, wss) {
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
}

module.exports = {
    startServer,
    setupShutdownHandlers,
};
