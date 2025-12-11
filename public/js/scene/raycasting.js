import * as THREE from "/node_modules/three/build/three.module.js";
import { camera, world } from "./core.js";

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Helper to check if an object should be ignored
function shouldIgnore(object) {
    let obj = object;
    while (obj) {
        if (obj.userData && obj.userData.ignoreRaycast) {
            return true;
        }
        obj = obj.parent;
    }
    return false;
}

export function getGroundIntersection(clientX, clientY) {
    // Find the ground plane in the world
    let planeMesh = null;
    world.traverse((child) => {
        if (child.userData.isGroundPlane) {
            planeMesh = child;
        }
    });

    if (!planeMesh) return null;

    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(planeMesh);
    if (intersects.length > 0) {
        return intersects[0].point;
    }
    return null;
}

export function getPlayerIntersection(clientX, clientY, playersMap) {
    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const meshes = Array.from(playersMap.values());
    // Raycast récursif car les joueurs sont des groupes
    const intersects = raycaster.intersectObjects(meshes, true);

    for (const intersect of intersects) {
        if (shouldIgnore(intersect.object)) continue;

        // Trouver à quel groupe de joueur ce maillage appartient
        let obj = intersect.object;
        while (obj.parent && obj.parent !== world) {
            obj = obj.parent;
        }
        // Trouver l'ID associé à ce maillage
        for (const [id, mesh] of playersMap.entries()) {
            if (mesh === obj) {
                return { id, point: intersect.point };
            }
        }
    }
    return null;
}

export function getStructureIntersection(clientX, clientY, structuresMap) {
    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const meshes = Array.from(structuresMap.values());
    const intersects = raycaster.intersectObjects(meshes, true);

    for (const intersect of intersects) {
        if (shouldIgnore(intersect.object)) continue;

        let obj = intersect.object;
        while (obj.parent && obj.parent !== world) {
            obj = obj.parent;
        }
        for (const [id, mesh] of structuresMap.entries()) {
            if (mesh === obj) {
                return { id, point: intersect.point };
            }
        }
    }
    return null;
}

export function getMinionIntersection(clientX, clientY, minionsMap) {
    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const meshes = Array.from(minionsMap.values());
    const intersects = raycaster.intersectObjects(meshes, true);

    for (const intersect of intersects) {
        if (shouldIgnore(intersect.object)) continue;

        let obj = intersect.object;
        while (obj.parent && obj.parent !== world) {
            obj = obj.parent;
        }
        for (const [id, mesh] of minionsMap.entries()) {
            if (mesh === obj) {
                return { id, point: intersect.point };
            }
        }
    }
    return null;
}
