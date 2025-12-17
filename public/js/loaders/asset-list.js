/**
 * Asset List Builder
 * Generates list of all assets needed for a game session
 */

/**
 * Get all assets needed for the current game
 * @param {Object} roomData - Room data from server
 * @returns {Array} List of assets to load
 */
import { charactersData } from "../main/game-state.js";

export function getRequiredAssets(roomData) {
	const assets = [];
	const basePath = "/media";

	// Get unique character models from players
	const characters = new Set();
	for (const player of roomData.room.players) {
		if (player.character) {
			characters.add(player.character);
		}
	}

	// Add character models
	// Add character models and animations
	for (const characterName of characters) {
		const charData = charactersData[characterName];
		if (charData) {
			// Main model
			const fileName = charData.fbx || charData.glb || charData.gltf;
			if (fileName) {
				const isFbx = fileName.toLowerCase().endsWith('.fbx');
				const type = isFbx ? 'fbx' : 'gltf';

				assets.push({
					type: type,
					path: `${basePath}/characters/glb/${fileName}`,
					name: `character_${characterName}`,
				});
			}

			// Animations
			if (charData.animations) {
				for (const [animName, animPath] of Object.entries(charData.animations)) {
					if (typeof animPath !== 'string') {
						console.warn(`[AssetList] Invalid animation path for ${characterName} animation ${animName}:`, animPath);
						continue;
					}
					const isFbx = animPath.toLowerCase().endsWith('.fbx');
					// We treat animations as models for loading purposes
					assets.push({
						type: isFbx ? 'fbx' : 'gltf',
						path: `${basePath}/characters/${animPath}`,
						name: `character_${characterName}_anim_${animName}`,
					});
				}
			}
		}
	}

	// Add minion models (using exact FBX filenames from server/server_side/minions.js)
	const minionAssets = [
		{ fbx: "minion_tank_blue.fbx" },
		{ fbx: "minion_tank_red.fbx" },
		{ fbx: "minion_mage_blue.fbx" },
		{ fbx: "minion_mage_red.fbx" },
	];

	for (const minion of minionAssets) {
		// Use filename without extension as the asset key
		const assetKey = minion.fbx.replace(".fbx", "");

		// Add main mesh
		assets.push({
			type: "fbx",
			path: `${basePath}/minions/glb/${minion.fbx}`,
			name: assetKey,
		});

		// Check for animations (Currently only Tank has them)
		if (minion.fbx.includes("tank")) {
			// Extract color (blue/red) from filename "minion_tank_{color}.fbx"
			// minion.fbx is "minion_tank_blue.fbx" -> parts: ["minion", "tank", "blue.fbx"] -> "blue"
			const color = minion.fbx.includes("blue") ? "blue" : "red";
			// Construct animation asset key: minion_tank_blue_anim_Walk

			const anims = ["Walk", "AutoAttack", "Dying"];
			for (const anim of anims) {
				assets.push({
					type: "fbx",
					path: `${basePath}/minions/glb/animations/minion_tank_${color}_${anim}.fbx`,
					name: `${assetKey}_anim_${anim.toLowerCase()}`, // Normalize to lowercase for consistency
				});
			}
		}
	}

	// Add structure models
	const structures = [
		{ name: "baseTeamA", file: "baseTeamA.glb" },
		{ name: "baseTeamB", file: "baseTeamB.glb" }
	];

	for (const structure of structures) {
		assets.push({
			type: "gltf",
			path: `${basePath}/structures/glb/${structure.file}`,
			name: structure.name,
		});
	}

	return assets;
}
