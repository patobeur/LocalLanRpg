// Message Handlers Module
// Processes all WebSocket messages from the server

import { setGameUI, setPlayerColor } from "./game-state.js";
import {
    handleServerShutdown,
    handleHello,
    handlePlayerJoin,
    handlePlayerLeft
} from "./handlers/connection-handlers.js";
import {
    handleShoot,
    handleProjectileHit,
    handlePlayerHealth,
    handlePlayerDeath,
    handlePlayerRespawn
} from "./handlers/combat-handlers.js";
import {
    handleStructureHit,
    handleStructureDeath
} from "./handlers/structure-handlers.js";
import {
    handlePlayerXp,
    handleLevelUp
} from "./handlers/progression-handlers.js";
import {
    handlePlayerState
} from "./handlers/movement-handlers.js";

// Re-export setters for compatibility
export { setGameUI, setPlayerColor };

/**
 * Main message dispatcher
 * @param {object} msg - Parsed WebSocket message
 */
export function handleMessage(msg) {
    switch (msg.type) {
        case "server-shutdown":
            handleServerShutdown();
            break;
        case "hello":
            handleHello(msg);
            break;
        case "player-join":
            handlePlayerJoin(msg);
            break;
        case "player-state":
            handlePlayerState(msg);
            break;
        case "player-left":
            handlePlayerLeft(msg);
            break;
        case "shoot":
            handleShoot(msg);
            break;
        case "player-health":
            handlePlayerHealth(msg);
            break;
        case "projectile-hit":
            handleProjectileHit(msg);
            break;
        case "player-death":
            handlePlayerDeath(msg);
            break;
        case "player-respawn":
            handlePlayerRespawn(msg);
            break;
        case "player-xp":
            handlePlayerXp(msg);
            break;
        case "level-up":
            handleLevelUp(msg);
            break;
        case "structure-hit":
            handleStructureHit(msg);
            break;
        case "structure-death":
            handleStructureDeath(msg);
            break;
        default:
            // Unknown message type
            break;
    }
}
