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
import { initGameUI } from "./game-ui.js";
import {
	initScene,
	render,
	makePlayerMesh,
	removePlayerMesh,
	updateCameraPosition,
	world,
	scene,
	updatePlayerHUD,
	createMapObjects,
} from "./scene.js";
import * as THREE from "/node_modules/three/build/three.module.js";

const qs = new URLSearchParams(location.search);
const roomId = qs.get("roomId");

if (!roomId) {
	alert("Vous devez rejoindre une salle pour jouer");
	window.location.href = "/lobby.html";
}

let ws = null;
let lastBroadcast = 0;
const me = {
	id: null,
	mesh: null,
	character: null,
	health: 100,
	maxHealth: 100,
	level: 1,
};
const others = new Map();
setPlayersMap(others);

// Game State
let gameState = "connecting"; // 'connecting', 'playing'

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

// Init UI
const gameUI = initGameUI((mode) => {
	setInputMode(mode);
	console.log(`[Game] Movement mode set to: ${mode}`);
});

// Game variables
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

// Auto-connect to room game
connectToRoomGame();

async function connectToRoomGame() {
	try {
		const roomRes = await fetch(`/api/rooms/${roomId}`);
		const roomData = await roomRes.json();

		if (!roomData.success) {
			alert("Salle introuvable");
			window.location.href = "/lobby.html";
			return;
		}

		const sessionRes = await fetch("/api/auth/session");
		const sessionData = await sessionRes.json();
		const myUserId = sessionData.user.id;

		// Find my player in room
		const myPlayer = roomData.room.players.find((p) => p.id === myUserId);
		if (!myPlayer || !myPlayer.character) {
			alert("Vous devez choisir un personnage dans la salle");
			window.location.href = `/room.html?roomId=${roomId}`;
			return;
		}

		me.character = myPlayer.character;
		me.username = myPlayer.username;
		const playerColor = myPlayer.faction === "blue" ? "#4A90E2" : "#E74C3C";

		// Connect to WebSocket
		const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
		const wsUrl = `${protocol}//${window.location.host}`;

		ws = new WebSocket(wsUrl);

		ws.onopen = () => {
			console.log("[WS] Connected to game");

			// Join game with room context
			ws.send(
				JSON.stringify({
					type: "join-game",
					roomId: roomId,
					playerId: myUserId,
				})
			);
		};

		ws.onmessage = (event) => {
			const msg = JSON.parse(event.data);

			if (msg.type === "server-shutdown") {
				alert("Le serveur a été arrêté. Retour à l'accueil.");
				window.location.href = "/";
				return;
			}

			if (msg.type === "hello") {
				me.id = String(msg.id);
				console.log(`[Game] My player ID is ${me.id}`);

				if (!me.mesh) {
					me.mesh = makePlayerMesh(me.username, me.level, playerColor);
					world.add(me.mesh);
				}

				const myData = msg.players[me.id];
				if (myData) {
					me.health = myData.health || 100;
					me.maxHealth = myData.maxHealth || 100;
					me.mana = myData.mana || 100;
					me.maxMana = myData.maxMana || 100;
					px = myData.x || 0;
					py = myData.y || 0.5;
					pz = myData.z || 0;
					rotY = myData.rotY || 0;
					me.mesh.position.set(px, py, pz);
					me.mesh.rotation.y = rotY;
					updatePlayerHUD(
						me.mesh,
						me.health,
						me.maxHealth,
						me.mana,
						me.maxMana,
						me.level
					);
				}

				if (msg.config) {
					createMapObjects(msg.config);
				}

				for (const [id, p] of Object.entries(msg.players || {})) {
					if (id === me.id) continue;
					if (others.has(id)) continue;
					const m = makePlayerMesh(p.name, p.level || 1, p.color);
					m.position.set(p.x, p.y, p.z);
					m.rotation.y = p.rotY;
					m.userData.health = p.health || 100;
					m.userData.maxHealth = p.maxHealth || 100;
					m.userData.mana = p.mana || 100;
					m.userData.maxMana = p.maxMana || 100;
					m.userData.level = p.level || 1;
					updatePlayerHUD(
						m,
						m.userData.health,
						m.userData.maxHealth,
						m.userData.mana,
						m.userData.maxMana,
						m.userData.level
					);
					others.set(id, m);
					world.add(m);
				}

				ws.send(
					JSON.stringify({
						type: "join",
						name: myPlayer.username,
						color: playerColor,
						character: me.character,
					})
				);
				gameState = "playing";
				console.log('[Game] State changed to "playing"');

				gameUI.updatePlayerInfo(
					myPlayer.username,
					1,
					me.health,
					me.maxHealth,
					me.mana,
					me.maxMana,
					0,
					100
				);
			}

			if (msg.type === "player-join") {
				const p = msg.player;
				const pId = String(p.id);
				if (pId !== me.id && !others.has(pId)) {
					const m = makePlayerMesh(p.name, p.level || 1, p.color);
					m.position.set(p.x, p.y, p.z);
					m.rotation.y = p.rotY;
					m.userData.health = p.health || 100;
					m.userData.maxHealth = p.maxHealth || 100;
					m.userData.mana = p.mana || 100;
					m.userData.maxMana = p.maxMana || 100;
					m.userData.level = p.level || 1;
					updatePlayerHUD(
						m,
						m.userData.health,
						m.userData.maxHealth,
						m.userData.mana,
						m.userData.maxMana,
						m.userData.level
					);
					others.set(pId, m);
					world.add(m);
				}
			}

			if (msg.type === "player-state") {
				const msgId = String(msg.id);
				if (msgId === me.id) return;
				let m = others.get(msgId);
				if (!m) return;
				m.position.set(msg.x, msg.y, msg.z);
				m.rotation.y = msg.rotY;
			}

			if (msg.type === "player-leave") {
				const msgId = String(msg.id);
				const m = others.get(msgId);
				if (m) {
					removePlayerMesh(m);
					others.delete(msgId);
				}
			}

			if (msg.type === "shoot") {
				shootProjectile(
					msg.x,
					msg.y,
					msg.z,
					msg.angle,
					String(msg.shooterId)
				);
			}

			if (msg.type === "player-health") {
				const msgId = String(msg.id);
				if (msgId === me.id) {
					me.health = msg.health;
					me.maxHealth = msg.maxHealth;
					if (msg.mana !== undefined) {
						me.mana = msg.mana;
						me.maxMana = msg.maxMana;
					}
					updatePlayerHUD(
						me.mesh,
						me.health,
						me.maxHealth,
						me.mana,
						me.maxMana,
						me.level
					);

					gameUI.updatePlayerInfo(
						charactersData[me.character]?.name || "Player",
						1,
						me.health,
						me.maxHealth,
						me.mana,
						me.maxMana,
						0,
						100
					);
				} else {
					const m = others.get(msgId);
					if (m) {
						m.userData.health = msg.health;
						m.userData.maxHealth = msg.maxHealth;
						if (msg.mana !== undefined) {
							m.userData.mana = msg.mana;
							m.userData.maxMana = msg.maxMana;
						}
						updatePlayerHUD(
							m,
							m.userData.health,
							m.userData.maxHealth,
							m.userData.mana,
							m.userData.maxMana,
							m.userData.level
						);
					}
				}
			}

			if (msg.type === "projectile-hit") {
				const targetId = String(msg.targetId);
				const shooterId = String(msg.shooterId);
				const target =
					others.get(targetId) || (targetId === me.id ? me.mesh : null);
				if (target) {
					let closest = null;
					let minDst = Infinity;
					for (const p of projectiles) {
						if (p.shooterId === shooterId) {
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
						scene.remove(closest.mesh);
						const idx = projectiles.indexOf(closest);
						if (idx > -1) projectiles.splice(idx, 1);
					}
				}
			}

			if (msg.type === "player-death") {
				const msgId = String(msg.id);
				const mesh = msgId === me.id ? me.mesh : others.get(msgId);
				if (mesh) {
					mesh.visible = false;
				}
				if (msgId === me.id) {
					me.respawnTime = msg.respawnTime;
					console.log(
						`[Game] You died! Respawning in ${
							(msg.respawnTime - Date.now()) / 1000
						}s`
					);
				}
			}

			if (msg.type === "player-respawn") {
				const msgId = String(msg.id);
				if (msgId === me.id) {
					px = msg.x;
					py = msg.y;
					pz = msg.z;
					me.health = msg.health;
					me.maxHealth = msg.maxHealth;
					me.mana = msg.mana;
					me.maxMana = msg.maxMana;
					me.respawnTime = null;
					if (me.mesh) {
						me.mesh.position.set(px, py, pz);
						me.mesh.visible = true;
						updatePlayerHUD(
							me.mesh,
							me.health,
							me.maxHealth,
							me.mana,
							me.maxMana,
							me.level
						);
					}
					gameUI.updatePlayerInfo(
						charactersData[me.character]?.name || "Player",
						1,
						me.health,
						me.maxHealth,
						me.mana,
						me.maxMana,
						0,
						100
					);
					console.log(`[Game] You respawned!`);
				} else {
					const m = others.get(msgId);
					if (m) {
						m.position.set(msg.x, msg.y, msg.z);
						m.visible = true;
						m.userData.health = msg.health;
						m.userData.maxHealth = msg.maxHealth;
						m.userData.mana = msg.mana;
						m.userData.maxMana = msg.maxMana;
						updatePlayerHUD(
							m,
							m.userData.health,
							m.userData.maxHealth,
							m.userData.mana,
							m.userData.maxMana,
							m.userData.level
						);
					}
				}
			}

			if (msg.type === "player-xp") {
				const msgId = String(msg.id);
				if (msgId === me.id) {
					me.xp = msg.xp;
					me.maxXp = msg.maxXp;
					me.level = msg.level;
					updatePlayerHUD(
						me.mesh,
						me.health,
						me.maxHealth,
						me.mana,
						me.maxMana,
						me.level
					);
					gameUI.updatePlayerInfo(
						charactersData[me.character]?.name || "Player",
						msg.level,
						me.health,
						me.maxHealth,
						me.mana,
						me.maxMana,
						me.xp,
						me.maxXp
					);
					console.log(
						`[Game] XP updated: ${me.xp}/${me.maxXp} (Level ${msg.level})`
					);
				} else {
					const m = others.get(msgId);
					if (m) {
						m.userData.level = msg.level;
						updatePlayerHUD(
							m,
							m.userData.health,
							m.userData.maxHealth,
							m.userData.mana,
							m.userData.maxMana,
							m.userData.level
						);
					}
				}
			}
		};

		ws.onclose = () => {
			console.log("[WS] Disconnected from game");
			gameState = "connecting";
		};

		ws.onerror = (error) => {
			console.error("[WS] Error:", error);
		};
	} catch (error) {
		console.error("Connect to room game error:", error);
		alert("Erreur de connexion au jeu");
		window.location.href = "/lobby.html";
	}
}

function tick(t) {
	requestAnimationFrame(tick);
	const dt = Math.min(0.033, tick.prevT ? (t - tick.prevT) / 1000 : 0.016);
	tick.prevT = t;

	// --- CHANGE: Only run game logic if in 'playing' state
	if (gameState !== "playing") {
		render(); // Still render the scene
		return;
	}
	let vx = 0,
		vz = 0;

	// Auto Attack Logic
	const attackId = String(getAttackTarget());
	let attacking = false;

	if (attackId && others.has(attackId)) {
		// Check if we should break attack due to keyboard movement
		if (getMovementMode() === "keyboard") {
			const d = getMoveDir();
			if (d.up || d.down || d.left || d.right) {
				clearAttackTarget();
				attacking = false;
			}
		}
	}

	// Re-check attackId after potential clear
	const currentAttackId = String(getAttackTarget());
	if (currentAttackId && others.has(currentAttackId) && !attacking) {
		const targetMesh = others.get(currentAttackId);
		const dx = targetMesh.position.x - px;
		const dz = targetMesh.position.z - pz;
		const dist = Math.hypot(dx, dz);

		const myChar = charactersData[me.character] || charactersData["Moumba"];
		const range = myChar ? myChar.hitDistance : 5;
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
			if (me.lastAttack === undefined) me.lastAttack = -cdMs;

			if (now - me.lastAttack > cdMs) {
				me.lastAttack = now;
				shootProjectile(px, py, pz, rotY, me.id);
				console.log(`[AutoAttack] Fired! CD: ${cdSeconds}s`);
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

	const half = gridSize; // * 0.5;// - 0.6;
	px = Math.max(-half, Math.min(half, px));
	pz = Math.max(-half, Math.min(half, pz));

	if (me.mesh) {
		me.mesh.position.set(px, py, pz);
		me.mesh.rotation.y = rotY;
		if (me.mesh.userData.hud) {
			me.mesh.userData.hud.rotation.y = -rotY;
		}
	}

	for (const playerMesh of others.values()) {
		if (playerMesh.userData.hud) {
			playerMesh.userData.hud.rotation.y = -playerMesh.rotation.y;
		}
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

		// Check range
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
