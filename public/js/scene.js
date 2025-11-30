import * as THREE from "/node_modules/three/build/three.module.js";
import { GLTFLoader } from "/node_modules/three/examples/jsm/loaders/GLTFLoader.js";

export const scene = new THREE.Scene();
export const world = new THREE.Group();
export const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
export const renderer = new THREE.WebGLRenderer({
	canvas: document.getElementById("c"),
	antialias: true,
});

const gridSize = 60;
let ZOOM_SCALE = 100;
const MIN_ZOOM = 20;
const MAX_ZOOM = 200;
const ZOOM_SPEED = 0.1;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let planeMesh = null;

function handleZoom(delta) {
	ZOOM_SCALE += delta * ZOOM_SPEED * -1; // Invert delta for intuitive zoom
	ZOOM_SCALE = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, ZOOM_SCALE));
	updateCameraProjection();
}

export function initScene() {
	scene.background = new THREE.Color(0x0b1020);
	scene.add(world);
	scene.add(new THREE.AmbientLight(0xffffff, 0.6));
	const dl = new THREE.DirectionalLight(0xffffff, 0.8);
	dl.position.set(2, 3, 1);
	scene.add(dl);

	const plane = new THREE.Mesh(
		new THREE.PlaneGeometry(gridSize, gridSize),
		new THREE.MeshStandardMaterial({ color: 0x0d1527 })
	);
	plane.rotation.x = -Math.PI / 2;
	planeMesh = plane;
	world.add(plane);
	world.add(new THREE.GridHelper(gridSize, gridSize, 0x335, 0x224));

	renderer.setSize(innerWidth, innerHeight);
	updateCameraProjection();

	camera.position.set(0, 20, 0);
	camera.lookAt(0, 0, 0);

	addEventListener("resize", () => {
		updateCameraProjection();
		renderer.setSize(innerWidth, innerHeight);
	});

	// Zoom listeners
	addEventListener("wheel", (e) => {
		handleZoom(e.deltaY);
	});

	addEventListener("keydown", (e) => {
		if (e.key === "+" || e.key === "=") {
			// = is often on the same key as +
			handleZoom(-100); // Zoom in
		} else if (e.key === "-" || e.key === "_") {
			handleZoom(100); // Zoom out
		}
	});
}

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

						world.add(model);
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
				});
				const mesh = new THREE.Mesh(geometry, material);
				mesh.position.set(str.x, str.z, str.y);
				world.add(mesh);
			}
		}
	}
}

function updateCameraProjection() {
	const aspect = innerWidth / innerHeight;
	const viewSize = innerHeight / ZOOM_SCALE;

	camera.left = -viewSize * aspect;
	camera.right = viewSize * aspect;
	camera.top = viewSize;
	camera.bottom = -viewSize;
	camera.updateProjectionMatrix();
}

export function updateCameraPosition(x, z) {
	camera.position.x = x;
	camera.position.z = z + 8;
	camera.lookAt(x, 0, z);
}

// NOUVEAU: Fonction unifiée pour créer le HUD
function createPlayerHUD(name, level, factionColor) {
	const hudGroup = new THREE.Group();
	const barWidth = 1.2;
	const healthBarHeight = 0.3;
	const manaBarHeight = 0.2;

	// --- Nom ---
	const nameCanvas = document.createElement("canvas");
	nameCanvas.width = 256;
	nameCanvas.height = 64;
	const nameContext = nameCanvas.getContext("2d");
	nameContext.font = "bold 24px Arial";
	nameContext.fillStyle = "white";
	nameContext.textAlign = "center";
	nameContext.fillText(name, 128, 30);
	const nameTexture = new THREE.CanvasTexture(nameCanvas);
	const nameMaterial = new THREE.SpriteMaterial({
		map: nameTexture,
		depthTest: false,
	});
	const nameSprite = new THREE.Sprite(nameMaterial);
	nameSprite.scale.set(2, 0.5, 1);
	nameSprite.position.y = 0.45;
	hudGroup.add(nameSprite);

	// --- Niveau ---
	const levelCanvas = document.createElement("canvas");
	levelCanvas.width = 64;
	levelCanvas.height = 64;
	const levelContext = levelCanvas.getContext("2d");
	const drawLevel = (lvl) => {
		levelContext.clearRect(0, 0, 64, 64);
		levelContext.fillStyle = "black";
		levelContext.fillRect(0, 0, 64, 64);
		levelContext.strokeStyle = "gold";
		levelContext.lineWidth = 4;
		levelContext.strokeRect(2, 2, 60, 60);
		levelContext.font = "bold 32px Arial";
		levelContext.fillStyle = "white";
		levelContext.textAlign = "center";
		levelContext.textBaseline = "middle";
		levelContext.fillText(lvl, 32, 32);
	};
	drawLevel(level);
	const levelTexture = new THREE.CanvasTexture(levelCanvas);
	const levelMaterial = new THREE.SpriteMaterial({
		map: levelTexture,
		depthTest: false,
	});
	const levelSprite = new THREE.Sprite(levelMaterial);
	levelSprite.scale.set(0.3, 0.3, 1);
	levelSprite.position.x = -barWidth / 2 - 0.25;
	hudGroup.add(levelSprite);

	// --- Barre de vie ---
	const healthBarGroup = new THREE.Group();
	const healthBgGeom = new THREE.PlaneGeometry(barWidth, healthBarHeight);
	const healthBgMat = new THREE.MeshBasicMaterial({
		color: 0x111111,
		depthTest: false,
	});
	const healthBg = new THREE.Mesh(healthBgGeom, healthBgMat);
	healthBarGroup.add(healthBg);

	const healthFgGeom = new THREE.PlaneGeometry(barWidth, healthBarHeight);
	const healthFgMat = new THREE.MeshBasicMaterial({
		color: factionColor,
		depthTest: false,
	});
	const healthFg = new THREE.Mesh(healthFgGeom, healthFgMat);
	healthFg.position.z = 0.001;
	healthBarGroup.add(healthFg);
	hudGroup.add(healthBarGroup);

	// --- Barre de mana ---
	const manaBarGroup = new THREE.Group();
	const manaBgGeom = new THREE.PlaneGeometry(barWidth, manaBarHeight);
	const manaBgMat = new THREE.MeshBasicMaterial({
		color: 0x111111,
		depthTest: false,
	});
	const manaBg = new THREE.Mesh(manaBgGeom, manaBgMat);
	manaBarGroup.add(manaBg);

	const manaFgGeom = new THREE.PlaneGeometry(barWidth, manaBarHeight);
	const manaFgMat = new THREE.MeshBasicMaterial({
		color: 0x3498db,
		depthTest: false,
	});
	const manaFg = new THREE.Mesh(manaFgGeom, manaFgMat);
	manaFg.position.z = 0.001;
	manaBarGroup.add(manaFg);
	manaBarGroup.position.y = -(healthBarHeight / 2) - manaBarHeight / 2 + 0.03;
	hudGroup.add(manaBarGroup);

	// Stocker les références pour les mises à jour
	hudGroup.userData = {
		healthBar: healthFg,
		manaBar: manaFg,
		levelContext: levelContext,
		levelTexture: levelTexture,
		drawLevel: drawLevel,
		barWidth: barWidth,
		nameContext: nameContext,
		nameTexture: nameTexture,
	};

	hudGroup.position.y = 1.7; // Positionner au-dessus de la tête du joueur

	return hudGroup;
}

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

	const hud = playerMesh.userData.hud;
	const {
		healthBar,
		manaBar,
		levelContext,
		levelTexture,
		drawLevel,
		barWidth,
	} = hud.userData;

	// Mettre à jour la vie
	const healthPercent = Math.max(0, Math.min(1, health / maxHealth));
	healthBar.scale.x = healthPercent;
	healthBar.position.x = -barWidth / 2 + (barWidth * healthPercent) / 2;

	// Mettre à jour le mana
	const manaPercent = Math.max(0, Math.min(1, mana / maxMana));
	manaBar.scale.x = manaPercent;
	manaBar.position.x = -barWidth / 2 + (barWidth * manaPercent) / 2;

	// Mettre à jour le niveau
	if (playerMesh.userData.level !== level) {
		playerMesh.userData.level = level;
		drawLevel(level);
		levelTexture.needsUpdate = true;
	}
}

// REFACTORISÉ: makePlayerMesh
export function makePlayerMesh(name, level, hexColor) {
	const g = new THREE.Group();
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
	const hud = createPlayerHUD(name, level, new THREE.Color(hexColor));
	g.add(hud);
	g.userData.hud = hud;
	g.userData.level = level;

	return g;
}

export function render() {
	renderer.render(scene, camera);
}

export function getGroundIntersection(clientX, clientY) {
	if (!planeMesh) return null;
	mouse.x = (clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(clientY / window.innerHeight) * 2 + 1;
	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObject(planeMesh);
	if (intersects.length > 0) {
		return intersects[0].point;
	}
	return null;
}

export function getPlayerIntersection(clientX, clientY, playersMap) {
	mouse.x = (clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(clientY / window.innerHeight) * 2 + 1;
	raycaster.setFromCamera(mouse, camera);

	const meshes = Array.from(playersMap.values());
	// Raycast récursif car les joueurs sont des groupes
	const intersects = raycaster.intersectObjects(meshes, true);

	if (intersects.length > 0) {
		// Trouver à quel groupe de joueur ce maillage appartient
		let obj = intersects[0].object;
		while (obj.parent && obj.parent !== world) {
			obj = obj.parent;
		}
		// Trouver l'ID associé à ce maillage
		for (const [id, mesh] of playersMap.entries()) {
			if (mesh === obj) {
				return { id, point: intersects[0].point };
			}
		}
	}
	return null;
}

export function clearPlayers(meshes) {
	meshes.forEach((mesh) => {
		world.remove(mesh);
	});
}

export function removePlayerMesh(object) {
	if (!object) return;

	// Traverse the object and its descendants
	object.traverse((child) => {
		if (child instanceof THREE.Mesh) {
			// Dispose of geometry and material
			if (child.geometry) {
				child.geometry.dispose();
			}
			if (child.material) {
				// If the material is an array, dispose of each material
				if (Array.isArray(child.material)) {
					child.material.forEach((material) => {
						if (material.map) {
							material.map.dispose();
						}
						material.dispose();
					});
				} else {
					// Single material
					if (child.material.map) {
						child.material.map.dispose();
					}
					child.material.dispose();
				}
			}
		} else if (child instanceof THREE.Sprite) {
			// Dispose of sprite material and its texture
			if (child.material) {
				if (child.material.map) {
					child.material.map.dispose();
				}
				child.material.dispose();
			}
		}
	});

	// Remove the object from its parent
	if (object.parent) {
		object.parent.remove(object);
	}
}
