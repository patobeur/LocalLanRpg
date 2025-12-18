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
    const { vx, vz, attacking, shotFired } = updatePlayerMovement(dt);
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
        updateEntityAnimation(me.mesh, dt, isMoving, attacking, shotFired);
    }

    // Update other players' HUD rotation and animation
    for (const playerMesh of others.values()) {
        if (playerMesh.userData.hud) {
            playerMesh.userData.hud.rotation.y = -playerMesh.rotation.y;
        }

        // Determine animation state for others based on network updates
        const now = performance.now();
        const lastMove = playerMesh.userData.lastMoveTime || 0;
        // Consider moving if update received efficiently recent (e.g. 100ms)
        // Since updates are 30fps (~33ms), 100ms is a safe buffer
        const isMoving = (now - lastMove) < 100;

        const shotFired = !!playerMesh.userData.shotFiredPending;
        // Consume the flag
        if (shotFired) playerMesh.userData.shotFiredPending = false;

        // Consider "attacking" if we just shot or are essentially in cooldown period
        // For visual purposes, we just need to pass 'shotFired' to trigger the loop reset.
        // We can set isAttacking = true for a short duration to keep the "stance" if we had separate non-firing attack stance.
        // But since 'autoattack' IS the shooting animation, we just need to ensure it plays.
        // If we set isAttacking = true, it tries to play 'autoattack'.
        const lastShot = playerMesh.userData.lastShotTime || 0;
        const isAttacking = (now - lastShot) < 500; // Stay in attack state for 0.5s

        updateEntityAnimation(playerMesh, dt, isMoving, isAttacking, shotFired);
    }

    // Update minions' HUD rotation (Counter-rotate to face camera/south)
    // Update minions' HUD rotation and animation
    for (const minionMesh of minions.values()) {
        if (minionMesh.userData.hud) {
            minionMesh.userData.hud.rotation.y = -minionMesh.rotation.y;
        }

        const now = performance.now();
        const lastMove = minionMesh.userData.lastMoveTime || 0;
        // Increase buffer to 300ms to handle variable network updates and prevent animation stutter
        const isMoving = (now - lastMove) < 300;

        const shotFired = !!minionMesh.userData.shotFiredPending;
        if (shotFired) minionMesh.userData.shotFiredPending = false;

        const lastShot = minionMesh.userData.lastShotTime || 0;
        const isAttacking = (now - lastShot) < 500;

        updateEntityAnimation(minionMesh, dt, isMoving, isAttacking, shotFired);
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

// --- Debugging Helper for Animation Warnings ---
let currentUpdatingEntityName = null;
const originalWarn = console.warn;
if (!console.warn.__isPatched) {
    console.warn = function (...args) {
        if (currentUpdatingEntityName && args.length > 0 && typeof args[0] === 'string') {
            // Check for specific Three.js warning
            if (args[0].includes('THREE.PropertyBinding: No target node found')) {
                originalWarn.call(console, `[Debug] Animation Warning for Entity: "${currentUpdatingEntityName}"`);
            }
        }
        originalWarn.apply(console, args);
    };
    console.warn.__isPatched = true;
}
// -----------------------------------------------

/**
 * Helper to update entity animation
 */
function updateEntityAnimation(mesh, dt, isMoving, isAttacking = false, shotFired = false) {
    // Set the current model name for debugging console warnings
    currentUpdatingEntityName = mesh.userData.name || mesh.userData.character || "Unknown Entity";
    try {
        if (!mesh.userData.mixer) return;

        mesh.userData.mixer.update(dt);

        const actions = mesh.userData.actions;
        if (!actions) return;

        // Logic: 'autoattack' > 'walk' > 'idle'
        let targetActionName = 'idle';
        if (isAttacking) targetActionName = 'autoattack';
        else if (isMoving) targetActionName = 'walk';

        // If autoattack missing, fallback to idle/walk
        if (isAttacking && !actions['autoattack']) {
            targetActionName = isMoving ? 'walk' : 'idle';
        }

        // Check if target action exists
        const targetAction = actions[targetActionName];

        // Transition logic
        if (targetAction) {
            // If we just fired a shot, FORCE reset the attack animation
            if (shotFired && targetActionName === 'autoattack') {
                targetAction.reset().play();
                mesh.userData.currentAction = targetAction;
            }
            else if (mesh.userData.currentAction !== targetAction) {
                if (mesh.userData.currentAction) {
                    mesh.userData.currentAction.fadeOut(0.2);
                }
                targetAction.reset().fadeIn(0.2).play();
                mesh.userData.currentAction = targetAction;

                // If it's an attack, strictly it might need to loop or not. 
                // For now default loop is fine (repeated attacks).
            }
        } else {
            // Target action not found
            if (mesh.userData.currentAction) {
                mesh.userData.currentAction.fadeOut(0.2);
                mesh.userData.currentAction = null;
            }
        }
    } finally {
        currentUpdatingEntityName = null;
    }
}
