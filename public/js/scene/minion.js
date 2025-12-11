import * as THREE from "/node_modules/three/build/three.module.js";
import { assetLoader } from "../loaders/asset-loader.js";
import { createHUD, updateHUD } from "./hud.js";

/**
 * Create a 3D mesh for a minion
 * @param {string} name - Minion type name
 * @param {string} faction - "blue" or "red"
 * @returns {THREE.Group} Minion mesh group
 */
export function makeMinionMesh(name, faction) {
	const g = new THREE.Group();

	// Health bar (create immediately)
	// Unified HUD for Minions
	const factionColor = faction === "blue" ? 0x4169e1 : 0xdc143c;
	const healthBarGroup = createHUD({
		name: name, // Can show minion type
		teamColor: factionColor,
		width: 1.0,
		height: 0.25,
		showLevel: true, // Enable level display
		showMana: true,
		showName: true,
	});
	healthBarGroup.position.y = 1.2; // Adjust height for minion
	g.add(healthBarGroup);
	g.userData.hud = healthBarGroup; // Standardize userData.hud key (was healthBarGroup before, careful!)
	g.add(healthBarGroup);
	g.userData.healthBarGroup = healthBarGroup; // Build compatibility alias if needed by other files?
	// Checking `updateMinionHealth` locally uses `healthBarGroup`, so I should update that function too.
	// The previous code line 16 was: g.userData.healthBarGroup = healthBarGroup;
	// I will keep it for safety if external code checks it, but I will primarily use hud.

	g.userData.level = 1; // Default level, will be updated from logic

	// Store faction and name
	g.userData.faction = faction;
	g.userData.name = name;

	// Get model from asset loader (already pre-loaded)
	const model = assetLoader.getModel(name);

	if (model) {
		// Setup model
		model.scale.set(1, 1, 1);
		model.traverse((child) => {
			if (child.isMesh) {
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});
		model.scale.set(0.01, 0.01, 0.01);
		g.add(model);
	} else {
		console.warn(`[Minion] Model ${name} not found in cache, using fallback`);
		createFallbackMesh(g, faction);
	}

	return g;
}

/**
 * Update minion health bar
 * @param {THREE.Group} minionMesh - Minion mesh
 * @param {number} health - Current health
 * @param {number} maxHealth - Max health
 * @param {number} level - Current level
 */
export function updateMinionHealth(minionMesh, health, maxHealth, level) {
	// Support both old key (mesh.userData.healthBarGroup) and new standard (mesh.userData.hud)
	const hud = minionMesh.userData.hud || minionMesh.userData.healthBarGroup;

	updateHUD(hud, {
		health,
		maxHealth,
		level: level || minionMesh.userData.level || 1,
	});

	if (level) {
		minionMesh.userData.level = level;
	}
}

function createFallbackMesh(g, faction) {
	const bodyColor = faction === "blue" ? 0x4169e1 : 0xdc143c;
	const body = new THREE.Mesh(
		new THREE.CylinderGeometry(0.25, 0.25, 0.6, 8),
		new THREE.MeshStandardMaterial({ color: bodyColor })
	);
	body.position.y = 0.3;
	g.add(body);
}
