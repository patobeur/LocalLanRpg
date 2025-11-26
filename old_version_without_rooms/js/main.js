import {
	initInput,
	getMoveDir,
	setInputMode,
	getMovementMode,
	getTarget,
	clearTarget,
	getAttackTarget,
	clearAttackTarget,
	setPlayersMap,
} from "./input.js";
import { initUI } from "./ui.js";
import {
	initScene,
	render,
	makePlayerMesh,
	updateCameraPosition,
	world,
	clearPlayers,
	scene,
	updateHealthBar,
} from "./scene.js";
import { connect } from "./network.js";
import * as THREE from "/node_modules/three/build/three.module.js";

const qs = new URLSearchParams(location.search);
const WS_URL = qs.get("server") || "ws://192.168.1.127:8080";

let ws = null;
let lastBroadcast = 0;
const me = { id: null, mesh: null, character: null, health: 100, maxHealth: 100 };
const others = new Map();
setPlayersMap(others);

let charactersData = {};
fetch("/api/characters")
	.then((res) => res.json())
	.then((data) => {
		charactersData = data.chars;
	});

// Projectiles
const projectiles = [];
const PROJECTILE_SPEED = 10;
const PROJECTILE_RANGE = 30;

// Init Subsystems
initInput();
initScene();

const ui = initUI((profile) => {
	setInputMode(profile.mode || "keyboard");
	connectToServer(profile);
});

window.addEventListener("mode-change", (e) => {
	setInputMode(e.detail);
});

function connectToServer(profile) {
	ui.updateHUD(`Connexion à ${WS_URL}…`);

	// Cleanup previous state
	if (me.mesh) world.remove(me.mesh);
	clearPlayers(others.values());
	others.clear();
	me.id = null;
	me.mesh = null;

	ws = connect(WS_URL, {
		onOpen: () => {
			ui.updateHUD(`${profile.name} connecté à ${WS_URL}`);
			me.character = profile.character || "Moumba";
			ws.send(
				JSON.stringify({
					type: "join",
					name: profile.name,
					color: profile.color,
					character: me.character,
				})
			);
		},
		onMessage: (msg) => {
			if (msg.type === "server-ip" && msg.ips) {
				ui.appendHint(`<br>Adresse LAN : ${msg.ips.join(", ")}`);
			}
			if (msg.type === "hello") {
				me.id = msg.id;
				me.mesh = makePlayerMesh(profile.color);
				world.add(me.mesh);
				// Find our player data to get health
				const myData = msg.players[me.id];
				if (myData) {
					me.health = myData.health || 100;
					me.maxHealth = myData.maxHealth || 100;
					updateHealthBar(me.mesh, me.health, me.maxHealth);
				}
				for (const [id, p] of Object.entries(msg.players || {})) {
					if (id === me.id) continue;
					const m = makePlayerMesh(p.color);
					m.position.set(p.x, p.y, p.z);
					m.rotation.y = p.rotY;
					// Store health data
					m.userData.health = p.health || 100;
					m.userData.maxHealth = p.maxHealth || 100;
					updateHealthBar(m, m.userData.health, m.userData.maxHealth);
					others.set(id, m);
					world.add(m);
				}
			}
			if (msg.type === "player-join") {
				const p = msg.player;
				if (!others.has(p.id) && p.id !== me.id) {
					const m = makePlayerMesh(p.color);
					m.position.set(p.x, p.y, p.z);
					m.rotation.y = p.rotY;
					// Store health data
					m.userData.health = p.health || 100;
					m.userData.maxHealth = p.maxHealth || 100;
					updateHealthBar(m, m.userData.health, m.userData.maxHealth);
					others.set(p.id, m);
					world.add(m);
				}
			}
			if (msg.type === "player-state") {
				if (msg.id === me.id) return;
				let m = others.get(msg.id);
				if (!m) {
					m = makePlayerMesh("#ccc");
					others.set(msg.id, m);
					world.add(m);
				}
				m.position.set(msg.x, msg.y, msg.z);
				m.rotation.y = msg.rotY;
			}
			if (msg.type === "player-leave") {
				const m = others.get(msg.id);
				if (m) {
					world.remove(m);
					others.delete(msg.id);
				}
			}
			if (msg.type === "shoot") {
				// Spawn projectile from other player
				shootProjectile(msg.x, msg.y, msg.z, msg.angle, msg.shooterId);
			}
			if (msg.type === "player-health") {
				console.log(
					`Player ${msg.id} health update. HP: ${msg.health}/${msg.maxHealth}`
				);
				// Update health for the affected player
				if (msg.id === me.id) {
					me.health = msg.health;
					me.maxHealth = msg.maxHealth;
					updateHealthBar(me.mesh, me.health, me.maxHealth);
				} else {
					const m = others.get(msg.id);
					if (m) {
						m.userData.health = msg.health;
						m.userData.maxHealth = msg.maxHealth;
						updateHealthBar(m, m.userData.health, m.userData.maxHealth);
					}
				}
			}
			if (msg.type === "projectile-hit") {
				// Remove projectile from shooter hitting target
				const target =
					others.get(msg.targetId) ||
					(msg.targetId === me.id ? me.mesh : null);
				if (target) {
					// Find closest projectile from shooter to target
					let closest = null;
					let minDst = Infinity;

					for (const p of projectiles) {
						if (p.shooterId === msg.shooterId) {
							const d = Math.hypot(
								p.x - target.position.x,
								p.z - target.position.z
							);
							if (d < minDst) {
								minDst = d;
								closest = p;
							}
						}
					}

					if (closest && minDst < 5) {
						// Threshold to avoid removing unrelated projectiles
						scene.remove(closest.mesh);
						const idx = projectiles.indexOf(closest);
						if (idx > -1) projectiles.splice(idx, 1);
					}
				}
			}
		},
		onClose: () => {
			ui.updateHUD("Déconnecté. Vérifie le serveur.");
			ui.resetUI();
		},
	});
}

let px = 0,
	py = 0.5,
	pz = 0,
	rotY = 0;
const speed = 3.5;
const gridSize = 40;

function shootProjectile(x, y, z, angle, shooterId) {
	const mesh = new THREE.Mesh(
		new THREE.SphereGeometry(0.2, 8, 8),
		new THREE.MeshStandardMaterial({ color: 0xffff00 })
	);
	mesh.position.set(x, y + 0.5, z);
	scene.add(mesh);

	projectiles.push({
		mesh,
		x,
		z,
		vx: Math.sin(angle),
		vz: Math.cos(angle),
		distTraveled: 0,
		shooterId,
	});

	if (shooterId === me.id && ws && ws.readyState === WebSocket.OPEN) {
		ws.send(JSON.stringify({ type: "shoot", x, y, z, angle }));
	}
}

function tick(t) {
	requestAnimationFrame(tick);
	const dt = Math.min(0.033, tick.prevT ? (t - tick.prevT) / 1000 : 0.016);
	tick.prevT = t;

	let vx = 0,
		vz = 0;

	// Auto Attack Logic
	const attackId = getAttackTarget();
	let attacking = false;

	if (attackId && others.has(attackId)) {
		const targetMesh = others.get(attackId);
		const dx = targetMesh.position.x - px;
		const dz = targetMesh.position.z - pz;
		const dist = Math.hypot(dx, dz);

		const myChar = charactersData[me.character] || charactersData["Moumba"];
		// Default to 5 if data not loaded yet
		const range = myChar ? myChar.hitDistance : 5;
		// Default to 1s if data not loaded yet
		const cdSeconds =
			myChar && myChar.autoAttackCd ? myChar.autoAttackCd[0] : 1;
		const cdMs = cdSeconds * 1000;

		if (dist > range) {
			// Move towards target
			vx = dx / dist;
			vz = dz / dist;
		} else {
			// In range, stop and shoot
			attacking = true;
			vx = 0;
			vz = 0;
			// Face target
			rotY = Math.atan2(dx, dz);

			// Shoot if cooldown ready
			const now = performance.now();
			if (me.lastAttack === undefined) me.lastAttack = -cdMs; // Allow first shot immediately

			if (now - me.lastAttack > cdMs) {
				me.lastAttack = now;
				shootProjectile(px, py, pz, rotY, me.id);
				console.log(`[AutoAttack] Fired! CD: ${cdSeconds}s`);
				// clearAttackTarget();
			}
		}
	}

	if (!attacking) {
		if (getMovementMode() === "keyboard") {
			const d = getMoveDir();
			if (d.up) vz -= 1;
			if (d.down) vz += 1;
			if (d.left) vx -= 1;
			if (d.right) vx += 1;
		} else {
			// Mouse mode
			const target = getTarget();
			if (target) {
				const dx = target.x - px;
				const dz = target.z - pz;
				const dist = Math.hypot(dx, dz);
				if (dist > 0.1) {
					vx = dx / dist;
					vz = dz / dist;
				} else {
					clearTarget();
				}
			}
		}
	}

	if (vx || vz) {
		const len = Math.hypot(vx, vz) || 1;
		vx /= len;
		vz /= len;
		px += vx * speed * dt;
		pz += vz * speed * dt;
		rotY = Math.atan2(vx, vz);
	}

	const half = gridSize * 0.5 - 0.6;
	px = Math.max(-half, Math.min(half, px));
	pz = Math.max(-half, Math.min(half, pz));

	if (me.mesh) {
		me.mesh.position.set(px, py, pz);
		me.mesh.rotation.y = rotY;
	}

	// Update Projectiles
	for (let i = projectiles.length - 1; i >= 0; i--) {
		const p = projectiles[i];
		const move = PROJECTILE_SPEED * dt;
		p.x += p.vx * move;
		p.z += p.vz * move;
		p.distTraveled += move;

		p.mesh.position.x = p.x;
		p.mesh.position.z = p.z;

		// Collision Detection Removed (Server Side Authority)

		// Check range (if not already removed)
		if (projectiles[i] === p && p.distTraveled >= PROJECTILE_RANGE) {
			scene.remove(p.mesh);
			projectiles.splice(i, 1);
		}
	}

	updateCameraPosition(px, pz);
	render();

	const now = performance.now();
	if (ws && ws.readyState === WebSocket.OPEN && now - lastBroadcast > 33) {
		lastBroadcast = now;
		ws.send(JSON.stringify({ type: "state", x: px, y: py, z: pz, rotY }));
	}
}
requestAnimationFrame(tick);
