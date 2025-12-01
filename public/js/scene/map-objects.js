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
            let mesh;

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

                        // Add HUD to GLB model
                        addStructureHUD(model, str, key);
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
                    depthTest: true,
                    depthWrite: false,
                });
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(str.x, str.z, str.y);
                world.add(mesh);

                // Add HUD to geometry mesh
                addStructureHUD(mesh, str, key);
            }
        }
    }
}

import { structures } from "../main/game-state.js";

function addStructureHUD(mesh, strData, id) {
    const hudGroup = new THREE.Group();
    const barWidth = 4; // Wider for base
    const healthBarHeight = 0.5;

    // --- Health Bar Background ---
    const healthBgGeom = new THREE.PlaneGeometry(barWidth, healthBarHeight);
    const healthBgMat = new THREE.MeshBasicMaterial({
        color: 0x111111,
        depthTest: true,
    });
    const healthBg = new THREE.Mesh(healthBgGeom, healthBgMat);
    hudGroup.add(healthBg);

    // --- Health Bar Foreground ---
    const healthFgGeom = new THREE.PlaneGeometry(barWidth, healthBarHeight);
    const healthFgMat = new THREE.MeshBasicMaterial({
        color: 0x2ecc71, // Green
        depthTest: true,
    });
    const healthFg = new THREE.Mesh(healthFgGeom, healthFgMat);
    healthFg.position.z = 0.01;
    hudGroup.add(healthFg);

    // Calculate bounding box to position HUD correctly
    // Ensure mesh is updated
    mesh.updateMatrixWorld();
    const box = new THREE.Box3().setFromObject(mesh);

    // Position above the object in WORLD space
    const worldTop = box.max.y;
    const hudWorldHeight = 2; // 2 units above top

    // Center X and Z
    const center = new THREE.Vector3();
    box.getCenter(center);

    hudGroup.position.set(center.x, worldTop + hudWorldHeight, center.z);

    // Add to WORLD, not mesh
    world.add(hudGroup);

    // Store references on the mesh so we can find the HUD later
    mesh.userData.structureId = id;
    mesh.userData.hud = {
        healthBar: healthFg,
        barWidth: barWidth,
        group: hudGroup // Store group ref if needed
    };

    // Add to global structures map
    structures.set(id, mesh);

    // Initial update
    updateStructureHUD(id, strData.hp || strData.maxHp, strData.maxHp || 1000);
}

export function updateStructureHUD(id, hp, maxHp) {
    const mesh = structures.get(id);
    if (!mesh || !mesh.userData.hud) return;

    const { healthBar, barWidth } = mesh.userData.hud;
    const healthPercent = Math.max(0, Math.min(1, hp / maxHp));

    healthBar.scale.x = healthPercent;
    healthBar.position.x = -barWidth / 2 + (barWidth * healthPercent) / 2;
}
