// Game Loop Module
// Main game loop for rendering and updates

import { me, others, playerTransform, getGameState, lastBroadcast, setLastBroadcast } from "./game-state.js";
import { updateProjectiles } from "./projectiles.js";
import { updatePlayerMovement, applyMovement } from "./player-movement.js";
import { render, updateCameraPosition } from "../scene.js";
import { sendStateUpdate } from "./network.js";

/**
 * Start the game loop
 */
export function startGameLoop() {
    requestAnimationFrame(tick);
}

/**
 * Main game loop tick function
 * @param {number} t - Current timestamp
 */
function tick(t) {
    requestAnimationFrame(tick);
    const dt = Math.min(0.033, tick.prevT ? (t - tick.prevT) / 1000 : 0.016);
    tick.prevT = t;

    // Only run game logic if in 'playing' state
    if (getGameState() !== "playing") {
        render(); // Still render the scene
        return;
    }

    // Calculate movement
    const { vx, vz } = updatePlayerMovement(dt);

    // Apply movement to player position
    applyMovement(vx, vz, dt);

    // Update player mesh position
    if (me.mesh) {
        me.mesh.position.set(playerTransform.x, playerTransform.y, playerTransform.z);
        me.mesh.rotation.y = playerTransform.rotY;
        if (me.mesh.userData.hud) {
            me.mesh.userData.hud.rotation.y = -playerTransform.rotY;
        }
    }

    // Update other players' HUD rotation
    for (const playerMesh of others.values()) {
        if (playerMesh.userData.hud) {
            playerMesh.userData.hud.rotation.y = -playerMesh.rotation.y;
        }
    }

    // Update projectiles
    updateProjectiles(dt);

    // Update camera
    updateCameraPosition(playerTransform.x, playerTransform.z);
    render();

    // Send state update to server (throttled to ~30fps)
    const now = performance.now();
    if (now - lastBroadcast > 33) {
        setLastBroadcast(now);
        sendStateUpdate(
            playerTransform.x,
            playerTransform.y,
            playerTransform.z,
            playerTransform.rotY
        );
    }
}
