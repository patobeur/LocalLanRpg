import * as THREE from "/node_modules/three/build/three.module.js";
import { renderer, scene, camera, world } from "./core.js";

export function render() {
    renderer.render(scene, camera);
}

export function clearPlayers(meshes) {
    meshes.forEach((mesh) => {
        world.remove(mesh);
    });
}

export function removePlayerMesh(object) {
    if (!object) return;

    // Traverse the object and its descendants
    object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            // Dispose of geometry and material
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                // If the material is an array, dispose of each material
                if (Array.isArray(child.material)) {
                    child.material.forEach((material) => {
                        if (material.map) {
                            material.map.dispose();
                        }
                        material.dispose();
                    });
                } else {
                    // Single material
                    if (child.material.map) {
                        child.material.map.dispose();
                    }
                    child.material.dispose();
                }
            }
        } else if (child instanceof THREE.Sprite) {
            // Dispose of sprite material and its texture
            if (child.material) {
                if (child.material.map) {
                    child.material.map.dispose();
                }
                child.material.dispose();
            }
        }
    });

    // Remove the object from its parent
    if (object.parent) {
        object.parent.remove(object);
    }
}
