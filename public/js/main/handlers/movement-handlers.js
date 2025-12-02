import { me, others } from "../game-state.js";

export function handlePlayerState(msg) {
    const msgId = String(msg.id);
    if (msgId === me.id) return;
    let m = others.get(msgId);
    if (!m) return;
    m.position.set(msg.x, msg.y, msg.z);
    m.rotation.y = msg.rotY;
}
