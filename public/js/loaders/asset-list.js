/**
 * Asset List Builder
 * Generates list of all assets needed for a game session
 */

/**
 * Get all assets needed for the current game
 * @param {Object} roomData - Room data from server
 * @returns {Array} List of assets to load
 */
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
	for (const characterName of characters) {
		// Assuming GLTF format based on user's changes
		assets.push({
			type: "gltf",
			path: `${basePath}/characters/glb/${characterName}.gltf`,
			name: `character_${characterName}`,
		});
	}

	// Add minion models (all types for both factions)
	const minionTypes = [
		"minion_tank_blue",
		"minion_tank_red",
		"minion_mage_blue",
		"minion_mage_red",
	];

	for (const minionType of minionTypes) {
		assets.push({
			type: "fbx",
			path: `${basePath}/minions/glb/${minionType}.fbx`,
			name: minionType,
		});
	}

	// Add structure models
	const structures = [
		{ name: "baseTeamA", file: "baseTeamA.glb" },
		{ name: "baseTeamB", file: "baseTeamB.glb" },
		{ name: "house", file: "house.glb" },
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
