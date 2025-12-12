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

			// Apply scale from data if available
			const scale = charData.scale ? charData.scale * 0.01 : 0.01;
			model.scale.set(scale, scale, scale);

			model.traverse((child) => {
				if (child.isMesh) {
					child.castShadow = true;
					child.receiveShadow = true;
				}
			});

			// Center the model?
			// Existing primitives were at y=0.45 (body) and y=1.1 (head)
			// Minions are just at 0
			model.position.set(0, 0, 0);

			// Correct rotation if needed (FBX often need rotation)
			// Minions didn't seem to need extra rotation in their code, but let's see.
			// If it's facing wrong, we might need model.rotation.y = Math.PI or similar.

			g.add(model);
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
		}
	}

	return g;
}
