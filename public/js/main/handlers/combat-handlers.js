import {
    me,
    others,
    playerTransform,
    gameUI,
    structures,
    charactersData
} from "../game-state.js";
import { shootProjectile, projectiles, removeProjectile } from "../projectiles.js";
import { clearAttackTarget, getAttackTarget } from "../../input.js";
import { updatePlayerHUD } from "../../scene.js";
import { GAME_CONSTANTS } from "../../client-config.js";
import { getMinionMesh } from "./minion-handlers.js";

let respawnInterval = null;

export function handleShoot(msg) {
    shootProjectile(msg.x, msg.y, msg.z, msg.angle, String(msg.shooterId));
}

export function handleProjectileHit(msg) {
    const targetId = String(msg.targetId);
    const shooterId = String(msg.shooterId);

    // Find target - could be a player, minion, or structure
    let target = others.get(targetId) || (targetId === me.id ? me.mesh : null);

    // If not a player, check if it's a minion
    if (!target) {
        target = getMinionMesh(targetId);
    }

    // If not a minion, check if it's a structure
    if (!target) {
        target = structures.get(targetId);
    }

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
        if (closest && minDst < GAME_CONSTANTS.COLLISION.PROJECTILE_HIT_RANGE_STRUCTURE) {
            removeProjectile(closest);
        }
    }
}

export function handlePlayerHealth(msg) {
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
                100,
                charactersData[me.character]
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

export function handlePlayerDeath(msg) {
    const msgId = String(msg.id);
    const mesh = msgId === me.id ? me.mesh : others.get(msgId);
    if (mesh) {
        mesh.visible = false;
    }

    // Clear attack target if we died
    if (msgId === me.id) {
        me.respawnTime = msg.respawnTime;
        clearAttackTarget(); // We died, lose focus on our target

        // Start countdown
        if (respawnInterval) clearInterval(respawnInterval);
        const statusEl = document.getElementById("status");

        const updateTimer = () => {
            const remaining = Math.ceil((me.respawnTime - Date.now()) / 1000);
            if (remaining > 0) {
                if (statusEl) statusEl.textContent = `Respawn dans ${remaining}s...`;
            } else {
                if (statusEl) statusEl.textContent = "Respawn...";
                clearInterval(respawnInterval);
            }
        };

        updateTimer();
        respawnInterval = setInterval(updateTimer, 1000);

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

export function handlePlayerRespawn(msg) {
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

        // Clear countdown and reset status
        if (respawnInterval) {
            clearInterval(respawnInterval);
            respawnInterval = null;
        }
        const statusEl = document.getElementById("status");
        if (statusEl) statusEl.textContent = "En jeu...";

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
                100,
                charactersData[me.character]
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
