import { structures } from "../game-state.js";
import { updateStructureHUD, world } from "../../scene.js";

export function handleStructureHit(msg) {
	updateStructureHUD(msg.structureId, msg.hp, msg.maxHp);
}

export function handleStructureDeath(msg) {
	console.log(
		`[Game] Structure ${msg.structureId} destroyed by player ${msg.killerId}!`
	);

	const mesh = structures.get(msg.structureId);
	if (mesh) {
		// Remove HUD from world
		if (mesh.userData.hud && mesh.userData.hud.group) {
			world.remove(mesh.userData.hud.group);
		}

		// Remove mesh from world
		world.remove(mesh);

		// Remove from structures map
		structures.delete(msg.structureId);
	}
}

export function handleStructureLevelUp(msg) {
	console.log(
		`[Game] Structure ${msg.structureId} leveled up to ${msg.level}!`
	);
	const structure = structures.get(msg.structureId);
	if (structure) {
		// Update the level in the structure's userData
		structure.userData.level = msg.level;
		// Call HUD update with all relevant info
		updateStructureHUD(
			msg.structureId,
			structure.userData.hp,
			structure.userData.maxHp,
			structure.userData.level
		);
	}
}
