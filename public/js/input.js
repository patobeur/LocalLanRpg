import { getGroundIntersection, getPlayerIntersection } from "./scene.js";
import { me } from "./main/game-state.js";

const keys = new Set();
let mode = "keyboard"; // 'keyboard' | 'mouse'
let target = null; // {x, z}
let attackTarget = null; // player id
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
