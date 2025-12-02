import { me, charactersData } from "../main/game-state.js";
import { initSkillUI, updateSkillVisual, skillZones } from "./skill-ui.js";

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
