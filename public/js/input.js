import { getGroundIntersection, getPlayerIntersection, getStructureIntersection, getMinionIntersection } from "./scene.js";
import { me, structures } from "./main/game-state.js";
import { minions } from "./main/handlers/minion-handlers.js";

const keys = new Set();
let mode = "keyboard"; // 'keyboard' | 'mouse'
let target = null; // {x, z}
let attackTarget = null; // player id or structure id
let playersMap = null;
let smartTargeting = false;
let smartTargetingKey = "Shift";

export function setPlayersMap(map) {
    playersMap = map;
}

export function setOptions(options) {
    if (!options) return;
    mode = options.mode || "keyboard";
    smartTargeting = options.smartTargeting ?? true;
    smartTargetingKey = (options.smartTargetingKey || "Shift").toLowerCase();
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
            // Check for smart targeting
            if (smartTargeting && keys.has(smartTargetingKey)) {
                const clickPoint = getGroundIntersection(e.clientX, e.clientY);
                if (clickPoint) {
                    let closestTarget = null;
                    let minDistance = Infinity;

                    const findClosest = (entities) => {
                        entities.forEach((entity) => {
                            if (entity.userData.faction !== me.faction) {
                                const distance = entity.position.distanceTo(clickPoint);
                                if (distance < minDistance) {
                                    minDistance = distance;
                                    closestTarget = entity.userData.id;
                                }
                            }
                        });
                    };

                    if (playersMap) findClosest(playersMap.values());
                    if (structures) findClosest(structures.values());
                    if (minions) findClosest(minions.values());

                    if (closestTarget) {
                        attackTarget = closestTarget;
                        target = null; // Stop ground movement
                        return; // Found a target, exit
                    }
                }
            }

            // Standard targeting logic (unchanged)
            if (playersMap) {
                const playerHit = getPlayerIntersection(e.clientX, e.clientY, playersMap);
                if (playerHit) {
                    const targetMesh = playersMap.get(playerHit.id);
                    if (targetMesh && targetMesh.userData.faction !== me.faction) {
                        attackTarget = playerHit.id;
                        target = null;
                        return;
                    }
                    return;
                }
            }

            if (structures) {
                const structureHit = getStructureIntersection(e.clientX, e.clientY, structures);
                if (structureHit) {
                    const targetMesh = structures.get(structureHit.id);
                    let isEnemy = (me.faction === "blue" && structureHit.id === "BaseTeamB") || (me.faction === "red" && structureHit.id === "BaseTeamA");
                    if (isEnemy) {
                        attackTarget = structureHit.id;
                        target = null;
                        return;
                    }
                }
            }

            if (minions) {
                const minionHit = getMinionIntersection(e.clientX, e.clientY, minions);
                if (minionHit) {
                    const targetMesh = minions.get(minionHit.id);
                    if (targetMesh && targetMesh.userData.faction !== me.faction) {
                        attackTarget = minionHit.id;
                        target = null;
                        return;
                    }
                }
            }

            if (mode === "mouse") {
                const point = getGroundIntersection(e.clientX, e.clientY);
                if (point) {
                    target = { x: point.x, z: point.z };
                    attackTarget = null;
                }
            }
        }
    });
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
