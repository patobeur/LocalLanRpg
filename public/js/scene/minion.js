import * as THREE from "/node_modules/three/build/three.module.js";
import { assetLoader } from "../loaders/asset-loader.js";
import { createHUD, updateHUD } from "./hud.js";

/**
 * Create a 3D mesh for a minion
 * @param {string} name - Minion type name
 * @param {string} faction - "blue" or "red"
 * @param {string} fbx - FBX filename from server-side data
 * @param {number} scale - Scale from server-side data
 * @returns {THREE.Group} Minion mesh group
 */
export function makeMinionMesh(name, faction, fbx, scale = 1) {
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
	g.userData.hud = healthBarGroup;
	g.userData.healthBarGroup = healthBarGroup;

	g.userData.level = 1; // Default level, will be updated from logic

	// Store faction and name
	g.userData.faction = faction;
	g.userData.name = name;

	// Use FBX filename (without extension) as the asset key
	const assetKey = fbx ? fbx.replace('.fbx', '') : name;

	// Get model from asset loader (already pre-loaded, using SkeletonUtils.clone via getter)
	const model = assetLoader.getModel(assetKey);

	if (model) {
		// Setup model with server-defined scale
		const modelScale = scale * 0.01; // Apply base scale factor

		// Create a wrapper for scaling independent of animation transforms
		const modelWrapper = new THREE.Group();
		modelWrapper.scale.set(modelScale, modelScale, modelScale);
		modelWrapper.add(model);
		g.add(modelWrapper);

		model.traverse((child) => {
			if (child.isMesh || child.isSkinnedMesh) {
				child.castShadow = true;
				child.receiveShadow = true;
				child.frustumCulled = false; // Important for SkinnedMesh visibility
			}
		});

		// Animation Setup
		const mixer = new THREE.AnimationMixer(model);
		const actions = {};

		// 1. Embedded Animations (e.g. Idle)
		if (model.animations && model.animations.length > 0) {
			const clip = model.animations[0];
			const action = mixer.clipAction(clip);
			actions['idle'] = action;
			// Play idle by default
			action.play();
			g.userData.currentAction = action;
		}

		// 2. External Animations (Walk, AutoAttack, Dying)
		// Try to load standardized names if they exist in cache
		const anims = ['walk', 'autoattack', 'dying'];
		for (const anim of anims) {
			const animAssetKey = `${assetKey}_anim_${anim}`;
			const animAsset = assetLoader.getModel(animAssetKey);

			if (animAsset && animAsset.animations && animAsset.animations.length > 0) {
				const clip = animAsset.animations[0];
				const action = mixer.clipAction(clip);

				if (anim === 'autoattack' || anim === 'dying') {
					action.loop = THREE.LoopOnce;
					action.clampWhenFinished = true;

					// SPEED FIX:
					// Minion shoot event (projectile) happens instantly.
					// The animation is long. We must speed it up drastically so the "release" looks synchronized 
					// and the animation finishes before the next cooldown.
					if (anim === 'autoattack') {
						// Default clip might be ~1-2s. We want it to feel like a quick shot.
						// Let's force it to play in ~0.5 seconds (or faster).
						const duration = clip.duration;
						const desiredDuration = 0.5; // Short snap
						action.setEffectiveTimeScale(duration / desiredDuration);
					}
				}

				actions[anim] = action;
			}
		}

		// Attach mixer/actions to the root group so game-loop can find them
		g.userData.mixer = mixer;
		g.userData.actions = actions;

	} else {
		console.warn(`[Minion] Model ${assetKey} not found in cache, using fallback`);
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
