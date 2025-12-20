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
    handlePlayerRespawn,
    handleSkillEffect
} from "./handlers/combat-handlers.js";
import {
    handleStructureHit,
    handleStructureDeath,
    handleStructureLevelUp
} from "./handlers/structure-handlers.js";
import {
    handlePlayerXp,
    handleLevelUp
} from "./handlers/progression-handlers.js";
import {
    handlePlayerState
} from "./handlers/movement-handlers.js";
import {
    handleMinionSpawn,
    handleMinionMove,
    handleMinionHealth,
    handleMinionDeath
} from "./handlers/minion-handlers.js";

// Re-export setters for compatibility
export { setGameUI, setPlayerColor };

/**
 * Main message dispatcher
 * @param {object} msg - Parsed WebSocket message
 */
export function handleMessage(msg) {
    switch (msg.type) {
        case "world-state":
            handleWorldState(msg);
            break;
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
        case "skill-effect":
            handleSkillEffect(msg);
            break;
        case "projectile":
            // Handle both player and minion projectiles
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
        case "structure-level-up":
            handleStructureLevelUp(msg);
            break;
        case "minion-spawn":
            handleMinionSpawn(msg);
            break;
        case "minion-move":
            handleMinionMove(msg);
            break;
        case "minion-health":
            handleMinionHealth(msg);
            break;
        case "minion-death":
            handleMinionDeath(msg);
            break;
        case "game-over":
            handleGameOver(msg);
            break;
        default:
            // Unknown message type
            break;
    }
}

/**
 * Handle batched world state update
 * @param {object} msg - The world-state message containing lists of updates
 */
function handleWorldState(msg) {
    // 1. Update Players
    if (msg.players && msg.players.length > 0) {
        msg.players.forEach(pState => {
            // pState is already formatted as a player-state object by the server
            // or we can construct it if needed.
            // Server sends: { type: "player-state", id, x, y, z, rotY, level, ts }
            handlePlayerState(pState);
        });
    }

    // 2. Update Minions
    if (msg.minions && msg.minions.length > 0) {
        msg.minions.forEach(mState => {
            // Server sends: { minionId, x, y, z, rotY }
            // Handler expects the full message
            handleMinionMove({
                type: "minion-move",
                minionId: mState.minionId,
                x: mState.x,
                y: mState.y,
                z: mState.z,
                rotY: mState.rotY
            });
        });
    }

    // 3. Process other events
    if (msg.events && msg.events.length > 0) {
        msg.events.forEach(event => {
            // Recursively dispatch standard events
            handleMessage(event);
        });
    }
}

/**
 * Handle game-over event
 * @param {object} msg - Message with winningTeam and players
 */
function handleGameOver(msg) {
    const { winningTeam, players } = msg;
    console.log(`[Client] Game Over! Team ${winningTeam} wins!`);

    // Get gameUI instance from game-state
    import("./game-state.js").then(({ getGameUI }) => {
        const gameUI = getGameUI();
        if (gameUI && gameUI.showVictoryModal) {
            gameUI.showVictoryModal(winningTeam, players);
        }
    });
}
