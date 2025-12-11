import * as THREE from "/node_modules/three/build/three.module.js";
import { assetLoader } from "../loaders/asset-loader.js";
import { createHUD, updateHUD } from "./hud.js";
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

	// if (characterName) {
	// 	const cachedModel = assetLoader.getModel(`character_${characterName}`);
	// 	if (cachedModel) {
	// 		// Clone the model to avoid reusing the same instance
	// 		const modelToClone = cachedModel;
	// 		const model = modelToClone.clone(true);
	// 		model.name = characterName;

	// 		model.position.set(0, 0, 0);
	// 		model.rotation.set(0, 0, 0);
	// 		model.scale.set(0.5, 0.5, 0.5);
	// 		model.traverse((child) => {
	// 			if (child.isMesh) {
	// 				child.castShadow = true;
	// 				child.receiveShadow = true;
	// 			}
	// 		});

	// 		// Force the model to update its matrix based on parent transformations
	// 		model.matrixAutoUpdate = true;
	// 		model.updateMatrix();
	// 		g.add(model);
	// 		g.userData.hasCharacterModel = true;
	// 		g.userData.character = characterName;

	// 		console.log("----------------------")
	// 		console.log(name)
	// 		console.log("----------------------")
	// 		console.log(model)
	// 		console.log(g)

	// 	}
	// }
	return g;
}
