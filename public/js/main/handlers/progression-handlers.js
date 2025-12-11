import { me, others, gameUI, charactersData } from "../game-state.js";
import { updatePlayerHUD } from "../../scene.js";
import { getAttackTarget } from "../../input.js";

export function handlePlayerXp(msg) {
    console.log("[Client Debug] RECEIVED PLAYER-XP EVENT:", msg);
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
                me.maxXp,
                charactersData[me.character]
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

export function handleLevelUp(msg) {
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
            // IMPORTANT: Update the level in the player's userData first
            m.userData.level = msg.level;

            // Now, update the 3D HUD. It will use the new level from userData.
            updatePlayerHUD(
                m,
                m.userData.health,
                m.userData.maxHealth,
                m.userData.mana,
                m.userData.maxMana,
                m.userData.level // Now passing the updated level
            );
            console.log(`[Game] Le joueur '${m.userData.name}' a atteint le niveau ${msg.level} !`);

            // If the player who leveled up is our current attack target, update the target HUD
            if (gameUI && getAttackTarget() === msgId) {
                const charData = charactersData[m.userData.character] || {};
                gameUI.updatePlayerInfo(
                    m.userData.name,
                    msg.level, // Use the new level from the message
                    m.userData.health,
                    m.userData.maxHealth,
                    m.userData.mana,
                    m.userData.maxMana,
                    0, // XP and MaxXP are not known for others, can be set to 0
                    100,
                    charData
                );
                console.log(`[Game] Target HUD updated for ${m.userData.name}`);
            }
        }
    }
}
