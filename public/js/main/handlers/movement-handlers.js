import { me, others } from "../game-state.js";
import { updatePlayerHUD } from "../../scene.js";

export function handlePlayerState(msg) {
    const msgId = String(msg.id);
    if (msgId === me.id) return;
    let m = others.get(msgId);
    if (!m) return;

    // Check movement
    const oldX = m.position.x;
    const oldZ = m.position.z;

    const dx = msg.x - oldX;
    const dz = msg.z - oldZ;
    const dist = Math.hypot(dx, dz);

    if (dist > 0.01) {
        m.userData.lastMoveTime = performance.now();
    }

    m.position.set(msg.x, msg.y, msg.z);
    m.rotation.y = msg.rotY;

    // Also update the level in the HUD if it's different
    if (msg.level !== undefined && m.userData.level !== msg.level) {
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
