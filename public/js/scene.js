import * as THREE from "/node_modules/three/build/three.module.js";

export const scene = new THREE.Scene();
export const world = new THREE.Group();
export const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
export const renderer = new THREE.WebGLRenderer({
	canvas: document.getElementById("c"),
	antialias: true,
});

const gridSize = 60;
const camSize = 8;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let planeMesh = null;

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
}

export function createMapObjects(mapConfig) {
	if (!mapConfig) return;

	// Color mapping for different spawn types
	const colorMap = {
		spawnTeamA: 0x4A90E2,      // Blue
		spawnTeamB: 0xE74C3C,      // Red
		spawnMinionsA: 0x85C1E9,   // Light blue
		spawnMinionsB: 0xF1948A,   // Light red
		BaseTeamA: 0x2E86DE,       // Darker blue
		BaseTeamB: 0xC0392B        // Darker red
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
					opacity: 0.6
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
			}

			if (geometry) {
				const material = new THREE.MeshStandardMaterial({
					color: colorMap[key] || 0x666666,
					transparent: true,
					opacity: 0.7
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
	camera.left = -camSize * aspect;
	camera.right = camSize * aspect;
	camera.top = camSize;
	camera.bottom = -camSize;
	camera.updateProjectionMatrix();
}

export function updateCameraPosition(x, z) {
	camera.position.x = x;
	camera.position.z = z + 0.01;
	camera.lookAt(x, 0, z);
}

function createHealthBar() {
	const barGroup = new THREE.Group();

	// Background bar (black)
	const bgGeometry = new THREE.PlaneGeometry(0.8, 0.1);
	const bgMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
	const bgBar = new THREE.Mesh(bgGeometry, bgMaterial);
	barGroup.add(bgBar);

	// Health bar (green to red based on health)
	const healthGeometry = new THREE.PlaneGeometry(0.8, 0.1);
	const healthMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
	const healthBar = new THREE.Mesh(healthGeometry, healthMaterial);
	healthBar.position.z = 0.01; // Slightly in front of background
	barGroup.add(healthBar);

	// Store reference to health bar for updates
	barGroup.userData.healthBar = healthBar;
	barGroup.userData.maxWidth = 0.8;

	// Billboard effect (always face camera)
	barGroup.rotation.x = -Math.PI / 2;
	barGroup.position.y = 1.7; // Above the player's head

	return barGroup;
}

function createManaBar() {
	const barGroup = new THREE.Group();

	// Background bar (black)
	const bgGeometry = new THREE.PlaneGeometry(0.8, 0.1);
	const bgMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
	const bgBar = new THREE.Mesh(bgGeometry, bgMaterial);
	barGroup.add(bgBar);

	// Mana bar (blue)
	const manaGeometry = new THREE.PlaneGeometry(0.8, 0.1);
	const manaMaterial = new THREE.MeshBasicMaterial({ color: 0x3498db });
	const manaBar = new THREE.Mesh(manaGeometry, manaMaterial);
	manaBar.position.z = 0.01;
	barGroup.add(manaBar);

	barGroup.userData.manaBar = manaBar;
	barGroup.userData.maxWidth = 0.8;

	barGroup.rotation.x = -Math.PI / 2;
	barGroup.position.y = 1.55; // Below health bar (1.7)

	return barGroup;
}

export function updateHealthBar(playerMesh, health, maxHealth) {
	if (!playerMesh.userData.healthBarGroup) return;

	const barGroup = playerMesh.userData.healthBarGroup;
	const healthBar = barGroup.userData.healthBar;
	const maxWidth = barGroup.userData.maxWidth;

	// Calculate health percentage
	const healthPercent = Math.max(0, Math.min(1, health / maxHealth));

	// Update width
	healthBar.scale.x = healthPercent;
	healthBar.position.x = -maxWidth / 2 + (maxWidth * healthPercent) / 2;

	// Update color based on health percentage
	let color;
	if (healthPercent > 0.6) {
		color = 0x00ff00; // Green
	} else if (healthPercent > 0.3) {
		color = 0xffff00; // Yellow
	} else if (healthPercent > 0) {
		color = 0xff0000; // Red
	} else {
		color = 0x666666; // Gray for dead
	}
	healthBar.material.color.setHex(color);
}

export function updateManaBar(playerMesh, mana, maxMana) {
	if (!playerMesh.userData.manaBarGroup) return;

	const barGroup = playerMesh.userData.manaBarGroup;
	const manaBar = barGroup.userData.manaBar;
	const maxWidth = barGroup.userData.maxWidth;

	const percent = Math.max(0, Math.min(1, mana / maxMana));

	manaBar.scale.x = percent;
	manaBar.position.x = -maxWidth / 2 + (maxWidth * percent) / 2;
}

export function makePlayerMesh(hexColor) {
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

	// Add health bar
	const healthBarGroup = createHealthBar();
	g.add(healthBarGroup);
	g.userData.healthBarGroup = healthBarGroup;

	// Add mana bar
	const manaBarGroup = createManaBar();
	g.add(manaBarGroup);
	g.userData.manaBarGroup = manaBarGroup;

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
	// Raycast recursively because players are Groups
	const intersects = raycaster.intersectObjects(meshes, true);

	if (intersects.length > 0) {
		// Find which player group this mesh belongs to
		let obj = intersects[0].object;
		while (obj.parent && obj.parent !== world) {
			obj = obj.parent;
		}
		// Find the ID associated with this mesh
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
