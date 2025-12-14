// Game Loop Module
// Main game loop for rendering and updates

import { me, others, playerTransform, getGameState, lastBroadcast, setLastBroadcast } from "./game-state.js";
import { updateProjectiles } from "./projectiles.js";
import { updatePlayerMovement, applyMovement } from "./player-movement.js";
import { minions } from "./handlers/minion-handlers.js";
import { render, updateCameraPosition } from "../scene.js";
import { sendStateUpdate } from "./network.js";

/**
 * Start the game loop
 */
let animationFrameId = null;

/**
 * Start the game loop
 */
export function startGameLoop() {
    if (!animationFrameId) {
        tick(performance.now());
    }
}

/**
 * Stop the game loop
 */
export function stopGameLoop() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        console.log("[Game] Loop stopped");
    }
}

/**
 * Main game loop tick function
 * @param {number} t - Current timestamp
 */
function tick(t) {
    animationFrameId = requestAnimationFrame(tick);
    const dt = Math.min(0.033, tick.prevT ? (t - tick.prevT) / 1000 : 0.016);
    tick.prevT = t;

    // Only run game logic if in 'playing' state
    if (getGameState() !== "playing") {
        render(); // Still render the scene
        return;
    }

    // Calculate movement
    const { vx, vz } = updatePlayerMovement(dt);
    const isMoving = Math.abs(vx) > 0.01 || Math.abs(vz) > 0.01;

    // Apply movement to player position
    applyMovement(vx, vz, dt);

    // Update player mesh position and animation
    if (me.mesh) {
        me.mesh.position.set(playerTransform.x, playerTransform.y, playerTransform.z);
        me.mesh.rotation.y = playerTransform.rotY;
        if (me.mesh.userData.hud) {
            me.mesh.userData.hud.rotation.y = -playerTransform.rotY;
        }

        // Update Animation
        updateEntityAnimation(me.mesh, dt, isMoving);
    }

    // Update other players' HUD rotation and animation
    for (const playerMesh of others.values()) {
        if (playerMesh.userData.hud) {
            playerMesh.userData.hud.rotation.y = -playerMesh.rotation.y;
        }

        // Placeholder for others: assuming idle for now as we don't have their velocity easily available yet
        updateEntityAnimation(playerMesh, dt, false);
    }

    // Update minions' HUD rotation (Counter-rotate to face camera/south)
    for (const minionMesh of minions.values()) {
        if (minionMesh.userData.hud) {
            minionMesh.userData.hud.rotation.y = -minionMesh.rotation.y;
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

/**
 * Helper to update entity animation
 */
function updateEntityAnimation(mesh, dt, isMoving) {
    if (!mesh.userData.mixer) return;

    mesh.userData.mixer.update(dt);

    const actions = mesh.userData.actions;
    if (!actions) return;

    // Default logic: 'walk' if moving, 'idle' if not
    let targetActionName = isMoving ? 'walk' : 'idle';

    // Check if target action exists
    let targetAction = actions[targetActionName];

    // Transition logic
    if (targetAction) {
        if (mesh.userData.currentAction !== targetAction) {
            if (mesh.userData.currentAction) {
                mesh.userData.currentAction.fadeOut(0.2);
            }
            targetAction.reset().fadeIn(0.2).play();
            mesh.userData.currentAction = targetAction;
        }
    } else {
        // Target action not found. 
        // If we want 'idle' but don't have it, we might just stop the current animation
        if (mesh.userData.currentAction) {
            mesh.userData.currentAction.fadeOut(0.2);
            mesh.userData.currentAction = null;
        }
    }
}
