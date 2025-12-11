import { me, others } from "../game-state.js";
import { updatePlayerHUD } from "../../scene.js";

export function handlePlayerState(msg) {
    const msgId = String(msg.id);
    if (msgId === me.id) return;
    let m = others.get(msgId);
    if (!m) return;
    m.position.set(msg.x, msg.y, msg.z);
    m.rotation.y = msg.rotY;

    // Also update the level in the HUD if it's different
    if (msg.level !== undefined && m.userData.level !== msg.level) {
        // updatePlayerHUD will update userData.level internally
        updatePlayerHUD(
            m,
            m.userData.health,
            m.userData.maxHealth,
            m.userData.mana,
            m.userData.maxMana,
            msg.level
        );
    }
}
