import { getGroundIntersection, getPlayerIntersection, getStructureIntersection, getMinionIntersection } from "./scene.js";
import { me, structures } from "./main/game-state.js";
import { minions } from "./main/handlers/minion-handlers.js";

const keys = new Set();
let mode = "keyboard"; // 'keyboard' | 'mouse'
let target = null; // {x, z}
let attackTarget = null; // player id or structure id
let playersMap = null;

export function setPlayersMap(map) {
    playersMap = map;
}

export function initInput() {
    addEventListener("keydown", (e) => {
        if (mode === "keyboard") {
            keys.add(e.key.toLowerCase());
        }
    });
    addEventListener("keyup", (e) => {
        if (mode === "keyboard") {
            keys.delete(e.key.toLowerCase());
        }
    });

    addEventListener("mousedown", (e) => {
        if (e.button === 0) {
            // Check player click first (ALWAYS allowed)
            if (playersMap) {
                const playerHit = getPlayerIntersection(e.clientX, e.clientY, playersMap);
                if (playerHit) {
                    const targetMesh = playersMap.get(playerHit.id);
                    if (targetMesh && targetMesh.userData.faction !== me.faction) {
                        attackTarget = playerHit.id;
                        target = null; // Stop moving to ground
                    }
                    return; // Return whether we found a valid target or not
                }
            }

            // Check structure click
            if (structures) {
                const structureHit = getStructureIntersection(e.clientX, e.clientY, structures);
                if (structureHit) {
                    console.log("[Input] Structure hit:", structureHit.id);
                    const targetMesh = structures.get(structureHit.id);
                    // Check if enemy structure (simple check based on ID naming convention or userData)
                    // Assuming BaseTeamA is blue and BaseTeamB is red
                    let isEnemy = false;
                    if (me.faction === "blue" && structureHit.id === "BaseTeamB") isEnemy = true;
                    if (me.faction === "red" && structureHit.id === "BaseTeamA") isEnemy = true;

                    if (isEnemy) {
                        console.log("[Input] Enemy structure targeted:", structureHit.id);
                        attackTarget = structureHit.id;
                        target = null;
                        return;
                    } else {
                        console.log("[Input] Friendly structure clicked, ignoring.");
                    }
                }
            }

            // Check minion click
            if (minions) {
                const minionHit = getMinionIntersection(e.clientX, e.clientY, minions);
                if (minionHit) {
                    const targetMesh = minions.get(minionHit.id);
                    if (targetMesh && targetMesh.userData.faction !== me.faction) {
                        console.log("[Input] Enemy minion targeted:", minionHit.id);
                        attackTarget = minionHit.id;
                        target = null;
                        return;
                    }
                }
            }

            // Click gauche (ground) - ONLY in mouse mode
            if (mode === "mouse") {
                const point = getGroundIntersection(e.clientX, e.clientY);
                if (point) {
                    target = { x: point.x, z: point.z };
                    attackTarget = null; // Stop attacking
                }
            }
        }
    });
}

export function setInputMode(newMode) {
    mode = newMode;
    keys.clear();
    target = null;
}

export function getMovementMode() {
    return mode;
}

export function getTarget() {
    return target;
}

export function getAttackTarget() {
    return attackTarget;
}

export function clearTarget() {
    target = null;
}

export function clearAttackTarget() {
    attackTarget = null;
}

export function getMoveDir() {
    return {
        up: keys.has("arrowup"),
        right: keys.has("arrowright"),
        down: keys.has("arrowdown"),
        left: keys.has("arrowleft"),
        autoAttack: keys.has("a"),
        skill1: keys.has("z"),
        skill2: keys.has("e"),
        skill3: keys.has("r"),
    };
}
