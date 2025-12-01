import * as THREE from "/node_modules/three/build/three.module.js";
import { GLTFLoader } from "/node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { world } from "./core.js";

export function createMapObjects(mapConfig) {
    if (!mapConfig) return;

    // Color mapping for different spawn types
    const colorMap = {
        spawnTeamA: 0x4a90e2, // Blue
        spawnTeamB: 0xe74c3c, // Red
        spawnMinionsA: 0x85c1e9, // Light blue
        spawnMinionsB: 0xf1948a, // Light red
        BaseTeamA: 0x2e86de, // Darker blue
        BaseTeamB: 0xc0392b, // Darker red
    };

    // Create locations (spawn points)
    if (mapConfig.locations) {
        for (const [key, loc] of Object.entries(mapConfig.locations)) {
            let geometry;

            if (loc.type === "CylinderGeometry") {
                // For cylinders: w and d are diameter, h is height
                const radius = loc.w / 2; // w is diameter
                geometry = new THREE.CylinderGeometry(radius, radius, loc.h, 32);
            } else if (loc.type === "sphereGeometry") {
                // For spheres: w is diameter
                const radius = loc.w / 2;
                geometry = new THREE.SphereGeometry(radius, 32, 32);
            }

            if (geometry) {
                const material = new THREE.MeshStandardMaterial({
                    color: colorMap[key] || 0x888888,
                    transparent: true,
                    opacity: 0.6,
                    depthTest: true,   // IMPORTANT
                    depthWrite: false, // pour éviter des artefacts
                });
                const mesh = new THREE.Mesh(geometry, material);
                // Position: x, z from config (y is up in 3D)
                mesh.position.set(loc.x, loc.z, loc.y);
                world.add(mesh);
            }
        }
    }

    // Create structures (bases)
    if (mapConfig.structures) {
        for (const [key, str] of Object.entries(mapConfig.structures)) {
            let geometry;

            if (str.type === "sphereGeometry") {
                const radius = str.w / 2;
                geometry = new THREE.SphereGeometry(radius, 32, 32);
            } else if (str.type === "CylinderGeometry") {
                const radius = str.w / 2;
                geometry = new THREE.CylinderGeometry(radius, radius, str.h, 32);
            } else if (str.type === "GLB") {
                const loader = new GLTFLoader();
                loader.load(
                    str.filepath,
                    (gltf) => {
                        const model = gltf.scene;
                        model.position.set(str.x, str.z, str.y);

                        if (str.rotation) {
                            model.rotation.set(
                                THREE.MathUtils.degToRad(str.rotation.x || 0),
                                THREE.MathUtils.degToRad(str.rotation.y || 0),
                                THREE.MathUtils.degToRad(str.rotation.z || 0)
                            );
                        }
                        if (str.scale) {
                            model.scale.set(
                                str.scale.x || 0,
                                str.scale.y || 0,
                                str.scale.z || 0
                            );
                        }

                        world.add(model);
                    },
                    undefined,
                    (error) => {
                        console.error(
                            "An error happened loading GLB:",
                            str.filepath,
                            error
                        );
                    }
                );
            }

            if (geometry) {
                const material = new THREE.MeshStandardMaterial({
                    color: colorMap[key] || 0x666666,
                    transparent: true,
                    opacity: 0.7,
                    depthTest: true,   // IMPORTANT
                    depthWrite: false, // pour éviter des artefacts
                });
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(str.x, str.z, str.y);
                world.add(mesh);
            }
        }
    }
}
