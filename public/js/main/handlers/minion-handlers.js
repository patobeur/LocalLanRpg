// Minion Handlers Module
// Handles all minion-related WebSocket messages

import { world } from "../../scene.js";
import { makeMinionMesh, updateMinionHealth } from "../../scene/minion.js";

// Store minion meshes
export const minions = new Map();

/**
 * Handle minion spawn event
 * @param {object} msg - { type: "minion-spawn", minion: {...} }
 */
export function handleMinionSpawn(msg) {
    const { minion } = msg;
    if (!world) return;

    // Create minion mesh
    const minionMesh = makeMinionMesh(minion.name, minion.faction);
    minionMesh.position.set(minion.x, minion.y, minion.z);
    minionMesh.rotation.y = minion.rotY || 0;

    // Store health and maxHealth in userData
    minionMesh.userData.health = minion.health;
    minionMesh.userData.maxHealth = minion.maxHealth;
    minionMesh.userData.id = minion.id;

    // Add to scene
    world.add(minionMesh);
    minions.set(minion.id, minionMesh);

    console.log(`[Minion] Spawned ${minion.id} at (${minion.x.toFixed(1)}, ${minion.z.toFixed(1)})`);
}

/**
 * Handle minion movement update
 * @param {object} msg - { type: "minion-move", minionId, x, y, z, rotY }
 */
export function handleMinionMove(msg) {
    const minionMesh = minions.get(msg.minionId);
    if (!minionMesh) return;

    // Update position
    minionMesh.position.set(msg.x, msg.y, msg.z);
    minionMesh.rotation.y = msg.rotY;
}

/**
 * Handle minion health update
 * @param {object} msg - { type: "minion-health", minionId, health, maxHealth }
 */
export function handleMinionHealth(msg) {
    const minionMesh = minions.get(msg.minionId);
    if (!minionMesh) return;

    // Update health data
    minionMesh.userData.health = msg.health;
    minionMesh.userData.maxHealth = msg.maxHealth;

    // Update health bar
    updateMinionHealth(minionMesh, msg.health, msg.maxHealth);
}

/**
 * Handle minion death event
 * @param {object} msg - { type: "minion-death", minionId }
 */
export function handleMinionDeath(msg) {
    const minionMesh = minions.get(msg.minionId);
    if (!minionMesh) return;

    if (world) {
        world.remove(minionMesh);
    }

    minions.delete(msg.minionId);
    console.log(`[Minion] Removed ${msg.minionId}`);
}

/**
 * Get minion mesh by ID
 * @param {string} minionId
 * @returns {THREE.Group|null}
 */
export function getMinionMesh(minionId) {
    return minions.get(minionId) || null;
}

/**
 * Clear all minions (e.g., when leaving game)
 */
export function clearAllMinions() {
    if (world) {
        for (const minionMesh of minions.values()) {
            world.remove(minionMesh);
        }
    }
    minions.clear();
}
