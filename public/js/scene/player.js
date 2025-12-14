import * as THREE from "/node_modules/three/build/three.module.js";
import { assetLoader } from "../loaders/asset-loader.js";
import { createHUD, updateHUD } from "./hud.js";
import { charactersData } from "../main/game-state.js";
// NOUVEAU: Fonction unifiée pour créer le HUD
// createPlayerHUD removed in favor of unified hud.js

// NOUVEAU: Fonction unifiée de mise à jour du HUD
export function updatePlayerHUD(
	playerMesh,
	health,
	maxHealth,
	mana,
	maxMana,
	level
) {
	if (!playerMesh || !playerMesh.userData.hud) return;

	updateHUD(playerMesh.userData.hud, {
		health,
		maxHealth,
		mana,
		maxMana,
		level
	});
}

// REFACTORISÉ: makePlayerMesh
export function makePlayerMesh(name, level, hexColor, characterName) {
	const g = new THREE.Group();

	// Fallback: reste du code géométrique original
	const body = new THREE.Mesh(
		new THREE.CylinderGeometry(0.35, 0.35, 0.9, 12),
		new THREE.MeshStandardMaterial({
			color: new THREE.Color(hexColor),
		})
	);
	body.position.y = 0.45;
	g.add(body);
	const head = new THREE.Mesh(
		new THREE.SphereGeometry(0.28, 16, 12),
		new THREE.MeshStandardMaterial({ color: 0xffffff })
	);
	head.position.y = 1.1;
	g.add(head);
	const dir = new THREE.Mesh(
		new THREE.ConeGeometry(0.15, 0.3, 10),
		new THREE.MeshStandardMaterial({ color: 0xeeeeee })
	);
	dir.rotation.x = Math.PI;
	dir.position.set(0, 1.1, 0.35);
	g.add(dir);

	// Ajouter le HUD unifié
	const hud = createHUD({
		name: name,
		level: level,
		teamColor: new THREE.Color(hexColor),
		showName: true,
		showLevel: true,
		showMana: true
	});
	g.add(hud);
	g.userData.hud = hud;
	g.userData.level = level;
	g.userData.name = name;

	// Character Mesh Implementation
	let hasMesh = false;
	if (characterName && charactersData[characterName]) {
		const charData = charactersData[characterName];
		// Determine asset name based on config (fbx or glb)
		// In asset-list.js, we named it `character_${characterName}`
		const assetKey = `character_${characterName}`;

		const cachedModel = assetLoader.getModel(assetKey);

		if (cachedModel) {
			hasMesh = true;
			const model = cachedModel; // getModel already clones
			model.name = characterName;

			console.log(`[Player] Created mesh for ${characterName}:`, model);

			// Apply scale
			// FORCE FIX for Torp
			let scale = 0.01;
			if (characterName === 'Torp') {
				scale = 0.01;
				console.log('[Player] FORCING SCALE 0.01 FOR TORP');
			} else if (charData.scale) {
				scale = charData.scale * 0.01;
			} else if (assetKey.toLowerCase().endsWith('.fbx') || charData.glb?.toLowerCase().endsWith('.fbx')) {
				scale = 0.01;
			}

			console.log(`[Player] ${characterName} applying scale: ${scale}`);

			// WRAPPER FIX: Create a container for the model to handle scaling independent of animations
			const modelWrapper = new THREE.Group();
			modelWrapper.name = `${characterName}_Wrapper`;
			modelWrapper.scale.set(scale, scale, scale);
			modelWrapper.add(model);

			model.traverse((child) => {
				console.log(`[Player] ${characterName} child:`, child.name, child.type, 'isMesh:', child.isMesh, 'isSkinned:', child.isSkinnedMesh);

				if (child.isMesh || child.type === 'SkinnedMesh' || child.isSkinnedMesh) {
					child.castShadow = true;
					child.receiveShadow = true;
					child.frustumCulled = false;
					console.log(`[Player] Set frustumCulled=false for ${child.name}`);
				}
			});

			// Center the model?
			model.position.set(0, 0, 0);

			g.add(modelWrapper);
			g.userData.hasCharacterModel = true;
			g.userData.character = characterName;

			// We can just NOT add them, but the code above already added them.
			// Let's remove them or simply toggle their visibility.
			body.visible = false;
			head.visible = false;
			dir.visible = false;

			// Adjust HUD position for mesh
			// Minions put it at y=1.2. Players might be taller.
			// healthBarGroup.position.y = 1.8;
			// Note: 'hud' is the variable name here, not 'healthBarGroup'
			hud.position.y = 1.8;

			// Animation Setup
			const mixer = new THREE.AnimationMixer(model);
			const actions = {};

			// 1. Check for Embedded Animations (e.g. Idle in Torp.fbx)
			if (model.animations && model.animations.length > 0) {
				// We assume the first embedded animation is Idle if not specified otherwise
				const clip = model.animations[0];

				// Optional: Check clip name?
				// console.log(`[Player] Found embedded animation for ${characterName}:`, clip.name);

				const action = mixer.clipAction(clip);
				actions['idle'] = action; // Map to 'idle' by default
			}

			// 2. Load External Animations
			if (charData.animations) {
				for (const [key, path] of Object.entries(charData.animations)) {
					const animName = key.replace('_path', '');
					const assetName = `character_${characterName}_anim_${key}`;

					const animAsset = assetLoader.getModel(assetName);
					if (animAsset && animAsset.animations && animAsset.animations.length > 0) {
						const clip = animAsset.animations[0];
						const action = mixer.clipAction(clip);
						actions[animName] = action;
					}
				}
			}

			model.userData.mixer = mixer;
			model.userData.actions = actions;
			model.userData.currentAction = null;
		}
	}

	return g;
}
