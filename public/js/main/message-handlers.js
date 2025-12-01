// Message Handlers Module
// Processes all WebSocket messages from the server

import {
    me,
    others,
    playerTransform,
    setGameState,
    charactersData,
} from "./game-state.js";
import { shootProjectile, projectiles, removeProjectile } from "./projectiles.js";
import { clearAttackTarget, getAttackTarget } from "../input.js";
import {
    makePlayerMesh,
    removePlayerMesh,
    updatePlayerHUD,
    world,
    createMapObjects,
} from "../scene.js";

let gameUI = null;
let playerColor = null;

/**
 * Set the game UI instance for updates
 */
export function setGameUI(ui) {
    gameUI = ui;
}

/**
 * Set the player color for this session
 */
export function setPlayerColor(color) {
    playerColor = color;
}

/**
 * Main message dispatcher
 * @param {object} msg - Parsed WebSocket message
 */
export function handleMessage(msg) {
    switch (msg.type) {
        case "server-shutdown":
            handleServerShutdown();
            break;
        case "hello":
            handleHello(msg);
            break;
        case "player-join":
            handlePlayerJoin(msg);
            break;
        case "player-state":
            handlePlayerState(msg);
            break;
        case "player-left":
            handlePlayerLeft(msg);
            break;
        case "shoot":
            handleShoot(msg);
            break;
        case "player-health":
            handlePlayerHealth(msg);
            break;
        case "projectile-hit":
            handleProjectileHit(msg);
            break;
        case "player-death":
            handlePlayerDeath(msg);
            break;
        case "player-respawn":
            handlePlayerRespawn(msg);
            break;
        case "player-xp":
            handlePlayerXp(msg);
            break;
        case "level-up":
            handleLevelUp(msg);
            break;
        default:
            // Unknown message type
            break;
    }
}

function handleLevelUp(msg) {
    const msgId = String(msg.id);

    if (msgId === me.id) {
        // This is a level-up for our own player.
        // The 'player-xp' message already handles the main HUD update.
        // This handler just makes sure our local state and 3D HUD are correct.
        me.level = msg.level;
        if (me.mesh) {
            updatePlayerHUD(
                me.mesh,
                me.health,
                me.maxHealth,
                me.mana,
                me.maxMana,
                me.level
            );
        }
    } else {
        // This is a level-up for another player.
        const m = others.get(msgId);
        if (m) {
            // updatePlayerHUD will update userData.level internally
            updatePlayerHUD(
                m,
                m.userData.health,
                m.userData.maxHealth,
                m.userData.mana,
                m.userData.maxMana,
                msg.level // Pass the new level from the message
            );
            console.log(`[Game] Le joueur '${m.userData.name}' a atteint le niveau ${msg.level} !`);
        }
    }
}

function handleServerShutdown() {
    alert("Le serveur a été arrêté. Retour à l'accueil.");
    window.location.href = "/";
}

function handleHello(msg) {
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
        playerTransform.x = myData.x || 0;
        playerTransform.y = myData.y || 0.5;
        playerTransform.z = myData.z || 0;
        playerTransform.rotY = myData.rotY || 0;
        me.mesh.position.set(playerTransform.x, playerTransform.y, playerTransform.z);
        me.mesh.rotation.y = playerTransform.rotY;
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

    // Add other players
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

    setGameState("playing");

    if (gameUI) {
        gameUI.updatePlayerInfo(
            me.username,
            me.level,
            me.health,
            me.maxHealth,
            me.mana,
            me.maxMana,
            0,
            100
        );
    }
}

function handlePlayerJoin(msg) {
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

function handlePlayerState(msg) {
    const msgId = String(msg.id);
    if (msgId === me.id) return;
    let m = others.get(msgId);
    if (!m) return;
    m.position.set(msg.x, msg.y, msg.z);
    m.rotation.y = msg.rotY;
}

function handlePlayerLeft(msg) {
    const msgId = String(msg.id);
    const m = others.get(msgId);
    if (m) {
        removePlayerMesh(m);
        others.delete(msgId);
    }
}

function handleShoot(msg) {
    shootProjectile(msg.x, msg.y, msg.z, msg.angle, String(msg.shooterId));
}

function handlePlayerHealth(msg) {
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

        if (gameUI) {
            gameUI.updatePlayerInfo(
                charactersData[me.character]?.name || "Player",
                me.level,
                me.health,
                me.maxHealth,
                me.mana,
                me.maxMana,
                0,
                100
            );
        }
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

function handleProjectileHit(msg) {
    const targetId = String(msg.targetId);
    const shooterId = String(msg.shooterId);
    const target = others.get(targetId) || (targetId === me.id ? me.mesh : null);
    if (target) {
        let closest = null;
        let minDst = Infinity;
        for (const p of projectiles) {
            if (p.shooterId === shooterId) {
                const d = Math.hypot(p.x - target.position.x, p.z - target.position.z);
                if (d < minDst) {
                    minDst = d;
                    closest = p;
                }
            }
        }
        if (closest && minDst < 5) {
            removeProjectile(closest);
        }
    }
}

function handlePlayerDeath(msg) {
    const msgId = String(msg.id);
    const mesh = msgId === me.id ? me.mesh : others.get(msgId);
    if (mesh) {
        mesh.visible = false;
    }

    // Clear attack target if we died
    if (msgId === me.id) {
        me.respawnTime = msg.respawnTime;
        clearAttackTarget(); // We died, lose focus on our target
        console.log(
            `[Game] You died! Respawning in ${(msg.respawnTime - Date.now()) / 1000}s`
        );
    } else {
        // If our current target died, clear the attack target
        const currentTarget = getAttackTarget();
        if (currentTarget && String(currentTarget) === msgId) {
            clearAttackTarget();
            console.log(`[Game] Target died, clearing attack focus`);
        }
    }
}

function handlePlayerRespawn(msg) {
    const msgId = String(msg.id);
    if (msgId === me.id) {
        playerTransform.x = msg.x;
        playerTransform.y = msg.y;
        playerTransform.z = msg.z;
        me.health = msg.health;
        me.maxHealth = msg.maxHealth;
        me.mana = msg.mana;
        me.maxMana = msg.maxMana;
        me.respawnTime = null;
        if (me.mesh) {
            me.mesh.position.set(playerTransform.x, playerTransform.y, playerTransform.z);
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
        if (gameUI) {
            gameUI.updatePlayerInfo(
                charactersData[me.character]?.name || "Player",
                me.level,
                me.health,
                me.maxHealth,
                me.mana,
                me.maxMana,
                0,
                100
            );
        }
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

function handlePlayerXp(msg) {
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
        if (gameUI) {
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
        }
        console.log(`[Game] XP updated: ${me.xp}/${me.maxXp} (Level ${msg.level})`);
    } else {
        const m = others.get(msgId);
        if (m) {
            // updatePlayerHUD will update userData.level internally
            updatePlayerHUD(
                m,
                m.userData.health,
                m.userData.maxHealth,
                m.userData.mana,
                m.userData.maxMana,
                msg.level // Pass the new level from the message
            );
            console.log(`[Game] Player XP update: ${m.userData.name || msgId} is now level ${msg.level}`);
        }
    }
}
