// Network Module
// Handles WebSocket connection and communication

import {
    me,
    roomId,
    setWebSocket,
    setGameState,
} from "./game-state.js";
import {
    handleMessage,
    setGameUI as setMessageHandlerGameUI,
    setPlayerColor as setMessageHandlerPlayerColor,
} from "./message-handlers.js";
import { loadingScreen } from "../loaders/loading-screen.js";
import { stopGameLoop } from "./game-loop.js";

let ws = null;

/**
 * Connect to the game room via WebSocket
 * @param {object} gameUI - Game UI instance for updates
 */
export async function connectToRoomGame(gameUI) {
    try {
        const roomRes = await fetch(`/api/rooms/${roomId}`);
        const roomData = await roomRes.json();

        if (!roomData.success) {
            alert("Salle introuvable");
            window.location.href = "/lobby.html";
            return;
        }

        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        const myUserId = sessionData.user.id;

        // Find my player in room
        const myPlayer = roomData.room.players.find((p) => p.id === myUserId);
        if (!myPlayer || !myPlayer.character) {
            alert("Vous devez choisir un personnage dans la salle");
            window.location.href = `/room.html?roomId=${roomId}`;
            return;
        }

        me.character = myPlayer.character;
        me.username = myPlayer.username;
        const playerColor = myPlayer.faction === "blue" ? "#4A90E2" : "#E74C3C";

        // Set player color in message handlers
        setMessageHandlerPlayerColor(playerColor);
        setMessageHandlerGameUI(gameUI);

        // Connect to WebSocket
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}`;

        ws = new WebSocket(wsUrl);
        setWebSocket(ws);

        ws.onopen = () => {
            console.log("[WS] Connected to game");

            // Join game with room context
            ws.send(
                JSON.stringify({
                    type: "join-game",
                    roomId: roomId,
                    playerId: myUserId,
                })
            );
        };

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            handleMessage(msg);

            // After hello message, send join confirmation
            if (msg.type === "hello") {
                ws.send(
                    JSON.stringify({
                        type: "join",
                        name: myPlayer.username,
                        color: playerColor,
                        character: me.character,
                    })
                );

                // Now send assets-loaded (all assets are pre-loaded)
                sendAssetsLoaded();
            }

            // Handle ready players update
            if (msg.type === "ready-players-update") {
                console.log("[Network] Ready players:", msg.readyPlayers);
                loadingScreen.updateReadyPlayers(msg.readyPlayers);
            }

            // Handle all players ready - start game
            if (msg.type === "all-players-ready") {
                console.log("[Network] All players ready, starting game!");
                loadingScreen.hide();
                import("./game-loop.js").then(({ startGameLoop }) => {
                    startGameLoop();
                });
            }

            // Handle server shutdown
            if (msg.type === "server-shutdown") {
                console.warn("[WS] Server shutting down");
                stopGameLoop();
                alert("Le serveur s'est arrêté. Retour à l'accueil.");
                window.location.href = "/lobby.html";
            }
        };

        ws.onclose = () => {
            console.log("[WS] Disconnected from game");
            setGameState("connecting");

            // If we didn't initiate the disconnect (e.g. shutdown), we should stop
            import("./game-loop.js").then(({ stopGameLoop }) => {
                stopGameLoop();
            });

            // Optional: Show offline status in HUD instead of alert if it's just a hiccup
            // But for now, let's be explicit
            const statusEl = document.getElementById("status");
            if (statusEl) statusEl.textContent = "Déconnecté...";
        };

        ws.onerror = (error) => {
            console.error("[WS] Error:", error);
        };
    } catch (error) {
        console.error("Connect to room game error:", error);
        alert("Erreur de connexion au jeu");
        window.location.href = "/lobby.html";
    }
}

/**
 * Send a state update to the server
 * @param {number} x - Player X position
 * @param {number} y - Player Y position
 * @param {number} z - Player Z position
 * @param {number} rotY - Player rotation Y
 */
export function sendStateUpdate(x, y, z, rotY) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "state", x, y, z, rotY }));
    }
}

/**
 * Get the WebSocket instance
 */
export function getWebSocket() {
    return ws;
}

/**
 * Send assets-loaded message to server
 */
export function sendAssetsLoaded() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "assets-loaded" }));
        console.log("[Network] Sent assets-loaded to server");
    }
}
