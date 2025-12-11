// Projectiles Module
// Handles creation, update, and destruction of projectiles

import * as THREE from "/node_modules/three/build/three.module.js";
import { scene } from "../scene.js";
import { me, ws } from "./game-state.js";
import { GAME_CONSTANTS } from "../client-config.js";

// Projectiles array
export const projectiles = [];

// Re-export constants for backward compatibility (will be removed later)
export const PROJECTILE_SPEED = GAME_CONSTANTS.PROJECTILE_SPEED;
export const PROJECTILE_RANGE = GAME_CONSTANTS.PROJECTILE_RANGE;

/**
 * Create and shoot a projectile
 * @param {number} x - Starting X position
 * @param {number} y - Starting Y position
 * @param {number} z - Starting Z position
 * @param {number} angle - Angle in radians
 * @param {string} shooterId - ID of the shooter
 */
export function shootProjectile(x, y, z, angle, shooterId) {
    const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xffff00 })
    );
    mesh.position.set(x, y + 0.5, z);
    scene.add(mesh);

    projectiles.push({
        mesh,
        x,
        z,
        vx: Math.sin(angle),
        vz: Math.cos(angle),
        distTraveled: 0,
        shooterId,
    });

    // Send to server if it's my projectile
    if (shooterId === me.id && ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "shoot", x, y, z, angle }));
    }
}

/**
 * Update all projectiles
 * @param {number} dt - Delta time in seconds
 */
export function updateProjectiles(dt) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        const move = GAME_CONSTANTS.PROJECTILE_SPEED * dt;
        p.x += p.vx * move;
        p.z += p.vz * move;
        p.distTraveled += move;

        p.mesh.position.x = p.x;
        p.mesh.position.z = p.z;

        // Check range
        if (projectiles[i] === p && p.distTraveled >= GAME_CONSTANTS.PROJECTILE_RANGE) {
            scene.remove(p.mesh);
            projectiles.splice(i, 1);
        }
    }
}

/**
 * Remove a specific projectile (used when it hits a target)
 * @param {object} projectile - The projectile to remove
 */
export function removeProjectile(projectile) {
    scene.remove(projectile.mesh);
    const idx = projectiles.indexOf(projectile);
    if (idx > -1) {
        projectiles.splice(idx, 1);
    }
}
