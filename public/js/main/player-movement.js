// Player Movement Module
// Handles player movement logic and auto-attack

import {
    getMoveDir,
    getMovementMode,
    getTarget,
    clearTarget,
    getAttackTarget,
    clearAttackTarget,
} from "../input.js";
import { me, others, structures, playerTransform, charactersData, GAME_CONSTANTS } from "./game-state.js";
import { shootProjectile } from "./projectiles.js";
import { minions } from "./handlers/minion-handlers.js";

/**
 * Calculate player movement and auto-attack
 * @param {number} dt - Delta time in seconds
 * @returns {{vx: number, vz: number, attacking: boolean}} Movement vector and attack status
 */
export function updatePlayerMovement(dt) {
    // Block movement and attack if dead
    if (me.respawnTime) {
        return { vx: 0, vz: 0, attacking: false };
    }

    let vx = 0;
    let vz = 0;
    let attacking = false;

    // Auto Attack Logic
    const attackId = String(getAttackTarget());

    if (attackId && (others.has(attackId) || structures.has(attackId) || minions.has(attackId))) {
        // Check if we should break attack due to keyboard movement
        if (getMovementMode() === "keyboard") {
            const d = getMoveDir();
            if (d.up || d.down || d.left || d.right) {
                clearAttackTarget();
                attacking = false;
            }
        }
    }

    // Re-check attackId after potential clear
    const currentAttackId = String(getAttackTarget());
    if (currentAttackId && !attacking) {
        let targetMesh = others.get(currentAttackId);
        if (!targetMesh) targetMesh = structures.get(currentAttackId);
        if (!targetMesh) targetMesh = minions.get(currentAttackId);

        if (targetMesh) {
            const dx = targetMesh.position.x - playerTransform.x;
            const dz = targetMesh.position.z - playerTransform.z;
            const dist = Math.hypot(dx, dz);

            const myChar = charactersData[me.character] || charactersData["Moumba"];
            const levelIndex = Math.max(0, (me.level || 1) - 1);
            const range = myChar
                ? (Array.isArray(myChar.hitDistance)
                    ? myChar.hitDistance[Math.min(levelIndex, myChar.hitDistance.length - 1)]
                    : myChar.hitDistance)
                : 5;
            const cdSeconds = myChar && myChar.autoAttackCd ? myChar.autoAttackCd[0] : 1;
            const cdMs = cdSeconds * 1000;

            if (dist > range) {
                // Move towards target
                vx = dx / dist;
                vz = dz / dist;
            } else {
                // In range, stop and shoot
                attacking = true;
                vx = 0;
                vz = 0;
                // Face target
                playerTransform.rotY = Math.atan2(dx, dz);

                // Shoot if cooldown ready
                const now = performance.now();
                if (me.lastAttack === undefined) me.lastAttack = -cdMs;

                if (now - me.lastAttack > cdMs) {
                    me.lastAttack = now;
                    shootProjectile(
                        playerTransform.x,
                        playerTransform.y,
                        playerTransform.z,
                        playerTransform.rotY,
                        me.id
                    );
                    console.log(`[AutoAttack] Fired! CD: ${cdSeconds}s`);
                }
            }
        }
    }

    if (!attacking) {
        if (getMovementMode() === "keyboard") {
            const d = getMoveDir();
            if (d.up) vz -= 1;
            if (d.down) vz += 1;
            if (d.left) vx -= 1;
            if (d.right) vx += 1;
        } else {
            // Mouse mode
            const target = getTarget();
            if (target) {
                const dx = target.x - playerTransform.x;
                const dz = target.z - playerTransform.z;
                const dist = Math.hypot(dx, dz);
                if (dist > 0.1) {
                    vx = dx / dist;
                    vz = dz / dist;
                } else {
                    clearTarget();
                }
            }
        }
    }

    return { vx, vz, attacking };
}

/**
 * Apply movement to player position
 * @param {number} vx - Velocity X
 * @param {number} vz - Velocity Z
 * @param {number} dt - Delta time
 */
export function applyMovement(vx, vz, dt) {
    if (vx || vz) {
        const len = Math.hypot(vx, vz) || 1;
        vx /= len;
        vz /= len;
        playerTransform.x += vx * GAME_CONSTANTS.PLAYER_SPEED * dt;
        playerTransform.z += vz * GAME_CONSTANTS.PLAYER_SPEED * dt;
        playerTransform.rotY = Math.atan2(vx, vz);
    }

    // Clamp to grid
    const half = GAME_CONSTANTS.GRID_SIZE;
    playerTransform.x = Math.max(-half, Math.min(half, playerTransform.x));
    playerTransform.z = Math.max(-half, Math.min(half, playerTransform.z));
}
