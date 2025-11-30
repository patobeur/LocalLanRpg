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
            }
        };

        ws.onclose = () => {
            console.log("[WS] Disconnected from game");
            setGameState("connecting");
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
