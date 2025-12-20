import { me, charactersData } from "../main/game-state.js";
import { initSkillUI, updateSkillVisual, skillZones } from "./skill-ui.js";
import { sendSkillAction } from "../main/network.js";
import { getTarget, getAttackTarget } from "../input.js";
import { getGroundIntersection } from "../scene.js";

const cooldowns = {
    A: 0,
    Z: 0,
    E: 0,
    R: 0
};

export function initSkillManager() {
    initSkillUI();

    // Add click listeners to UI
    Object.keys(skillZones).forEach(key => {
        skillZones[key].element.addEventListener("click", () => {
            useSkill(key);
        });
    });

    // Add key listeners
    window.addEventListener("keydown", (e) => {
        const key = e.key.toUpperCase();
        if (["A", "Z", "E", "R"].includes(key)) {
            useSkill(key);
        }
    });

    // Track mouse position for skill aiming
    window.addEventListener("mousemove", (e) => {
        const point = getGroundIntersection(e.clientX, e.clientY);
        if (point) {
            window.mousePos = point;
        }
    });
}

function useSkill(key) {
    const now = Date.now();
    if (now < cooldowns[key]) {
        console.log(`Skill ${key} is on cooldown.`);
        return;
    }

    // Get character data
    const charData = charactersData[me.character];
    if (!charData) {
        console.error("Character data not found for", me.character);
        return;
    }

    // Determine cooldown duration based on key and level
    // charData.skills is now an array of skill objects populated by the API
    // [skill1, skill2, skill3, ultimate]

    // Map key to skill index
    const keyMap = {
        "A": 0,
        "Z": 1,
        "E": 2,
        "R": 3
    };

    const skillIndex = keyMap[key];
    if (skillIndex === undefined || !charData.skills || !charData.skills[skillIndex]) {
        console.error("Skill data not found for key", key);
        return;
    }

    const skill = charData.skills[skillIndex];

    // Gather target data
    const targetData = {};
    const mousePoint = getGroundIntersection(window.lastMouseX, window.lastMouseY); // Need to ensure lastMouseX/Y are tracked or use generic ground intersection usage

    // Better way: use the input module's current mouse state if available, or pass it in.
    // For now, let's rely on what input.js provides or just what we found in input.js analysis.
    // In input.js, we have getTarget() and getAttackTarget().

    const inputTarget = getTarget(); // {x, z}
    const inputAttackTarget = getAttackTarget(); // id

    if (inputAttackTarget) {
        targetData.targetId = inputAttackTarget;
    }

    // Always define a target location, either from target unit or ground
    // If we have an attack target, we don't have its position directly here without querying scene, 
    // but the server knows. However, for ground skills, we need coordinates.
    // Let's get current mouse position from a global tracker or added event listener if needed.
    // Actually, input.js tracks `target` as {x,z} for simple movement, but let's re-use the mouse tracking logic.
    // We will assume `getGroundIntersection` works with latest mouse event if we stored it, 
    // BUT we don't have access to the event object here in `useSkill` when triggered by keypress.
    // We should track mouse position in `input.js` or `skill-manager.js`.

    // For now, let's add a mouse tracker in this file or assume `input.js` could export it.
    // Let's add a simple global mouse tracker here since we are in `skill-manager` and it initializes.

    if (window.mousePos) {
        targetData.x = window.mousePos.x;
        targetData.z = window.mousePos.z;
    }

    // Send to server
    sendSkillAction(key, targetData);

    // Visual cooldown is now handled by server confirmation? 
    // Or instantaneous for responsiveness? 
    // Let's keep client-side prediction for cooldown visual

    // Assuming level 1 for now if me.level is not fully synced
    // Arrays in skills.js are [lv1, lv2, ...]
    // me.level is 1-based, so index is me.level - 1
    const levelIndex = Math.max(0, (me.level || 1) - 1);

    // Get cooldown from skill data
    const cdDuration = skill.cd[Math.min(levelIndex, skill.cd.length - 1)];

    if (cdDuration) {
        console.log(`Used skill ${key}, cooldown: ${cdDuration}s`);
        cooldowns[key] = now + (cdDuration * 1000);
        updateSkillVisual(key, true, cdDuration);

        // Reset visual after cooldown (optional, as CSS transition handles the bar, but we might want to reset border)
        setTimeout(() => {
            updateSkillVisual(key, false, 0);
        }, cdDuration * 1000);
    }
}
