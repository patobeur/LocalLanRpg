// Barrel file for scene modules
// Re-exports all scene functionality from organized modules

// Core scene components
export { scene, world, camera, renderer, initScene } from "./scene/core.js";

// Camera controls
export { updateCameraPosition } from "./scene/camera.js";

// Map object creation
export { createMapObjects, updateStructureHUD } from "./scene/map-objects.js";

// Player mesh and HUD
export { makePlayerMesh, updatePlayerHUD } from "./scene/player.js";

// Raycasting utilities
export {
	getGroundIntersection,
	getPlayerIntersection,
	getStructureIntersection,
	getMinionIntersection,
} from "./scene/raycasting.js";

// Scene utilities
export { render, clearPlayers, removePlayerMesh } from "./scene/utils.js";

