import {
    me,
    others,
    playerTransform,
    setGameState,
    gameUI,
    playerColor,
    charactersData
} from "../game-state.js";
import { makePlayerMesh, removePlayerMesh, updatePlayerHUD, world, createMapObjects } from "../../scene.js";
import { initSkillManager } from "../../skills/skill-manager.js";
import { handleMinionSpawn } from "./minion-handlers.js";

export function handleServerShutdown() {
    alert("Le serveur a été arrêté. Retour à l'accueil.");
    window.location.href = "/";
}

export function handleHello(msg) {
    me.id = String(msg.id);
    console.log(`[Game] My player ID is ${me.id}`);

    // Initialize Skills UI
    initSkillManager();

    if (!me.mesh) {
        me.mesh = makePlayerMesh(me.username, me.level, playerColor);
        world.add(me.mesh);
    }

    const myData = msg.players[me.id];
    if (myData) {
        me.faction = myData.faction; // Store my faction
        me.character = myData.character; // Store character for skills
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

    // Spawn existing minions
    if (msg.minions) {
        for (const minion of msg.minions) {
            handleMinionSpawn({ minion: minion });
        }
    }

    // Add other players
    for (const [id, p] of Object.entries(msg.players || {})) {
        if (id === me.id) continue;
        if (others.has(id)) continue;
        const m = makePlayerMesh(p.name, p.level || 1, p.color);
        m.position.set(p.x, p.y, p.z);
        m.rotation.y = p.rotY;
        m.userData.faction = p.faction; // Store faction
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
            100,
            charactersData[me.character]
        );
    }
}

export function handlePlayerJoin(msg) {
    const p = msg.player;
    const pId = String(p.id);
    if (pId !== me.id && !others.has(pId)) {
        const m = makePlayerMesh(p.name, p.level || 1, p.color);
        m.position.set(p.x, p.y, p.z);
        m.rotation.y = p.rotY;
        m.userData.faction = p.faction; // Store faction
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

export function handlePlayerLeft(msg) {
    const msgId = String(msg.id);
    const m = others.get(msgId);
    if (m) {
        removePlayerMesh(m);
        others.delete(msgId);
    }
}
