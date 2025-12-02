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
    // Assuming level 1 for now if me.level is not fully synced or using array index 0
    // Arrays in characters.js are [lv1, lv2, ...]
    // me.level is 1-based, so index is me.level - 1
    const levelIndex = Math.max(0, (me.level || 1) - 1);

    let cdDuration = 0;

    switch (key) {
        case "A": // Skill 1
            cdDuration = charData.skill1Cd[Math.min(levelIndex, charData.skill1Cd.length - 1)];
            break;
        case "Z": // Skill 2
            cdDuration = charData.skill2Cd[Math.min(levelIndex, charData.skill2Cd.length - 1)];
            break;
        case "E": // Skill 3
            cdDuration = charData.skill3Cd[Math.min(levelIndex, charData.skill3Cd.length - 1)];
            break;
        case "R": // Ultimate
            // Note: characters.js has a typo 'ultimatCd'
            cdDuration = charData.ultimatCd[Math.min(levelIndex, charData.ultimatCd.length - 1)];
            break;
    }

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
