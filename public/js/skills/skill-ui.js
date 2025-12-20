import { me, charactersData } from "../main/game-state.js";

export const skillZones = {};

export function initSkillUI() {
    // Create container
    const container = document.createElement("div");
    container.id = "skill-bar-container";
    Object.assign(container.style, {
        position: "absolute",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: "10px",
        zIndex: "1000",
        pointerEvents: "auto" // Ensure clicks are registered
    });

    // Prevent click propagation to game world
    ['mousedown', 'mouseup', 'click', 'touchstart', 'touchend'].forEach(eventType => {
        container.addEventListener(eventType, (e) => {
            e.stopPropagation();
        });
    });

    // Define skills
    const skills = [
        { key: "A", id: "skill1" },
        { key: "Z", id: "skill2" },
        { key: "E", id: "skill3" },
        { key: "R", id: "ultimate" }
    ];

    skills.forEach(skill => {
        const zone = document.createElement("div");
        zone.id = `skill-zone-${skill.key}`;
        Object.assign(zone.style, {
            width: "60px",
            height: "60px",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            border: "2px solid #444",
            borderRadius: "8px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontSize: "24px",
            fontWeight: "bold",
            cursor: "pointer",
            position: "relative",
            transition: "background-color 0.1s",
            backgroundSize: "cover", // Ensure image covers the zone
            backgroundPosition: "center"
        });
        zone.textContent = skill.key;

        // Overlay for cooldown
        const overlay = document.createElement("div");
        Object.assign(overlay.style, {
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 0, 0, 0.5)",
            height: "0%", // Start empty
            transition: "height linear",
            borderRadius: "6px",
            pointerEvents: "none"
        });
        zone.appendChild(overlay);

        container.appendChild(zone);
        skillZones[skill.key] = { element: zone, overlay: overlay };
    });

    document.body.appendChild(container);

    // Try to update icons immediately if data is available
    updateSkillIcons();
}

export function updateSkillIcons() {
    if (!me.character || !charactersData[me.character]) return;

    const char = charactersData[me.character];
    const mapping = {
        "A": char.skill1Id,
        "Z": char.skill2Id,
        "E": char.skill3Id,
        "R": char.ultimatId
    };

    Object.keys(skillZones).forEach(key => {
        const skillId = mapping[key];
        if (skillId !== undefined) {
            skillZones[key].element.style.backgroundImage = `url('/media/skills/${skillId}.png')`;
            // Make text semi-transparent or remove it if icon is loaded? 
            // Better to keep text as overlay or move it to corner?
            // For now, let's keep text but maybe add text-shadow for visibility
            skillZones[key].element.style.textShadow = "0px 0px 4px #000";
        }
    });
}

export function updateSkillVisual(key, isOnCooldown, duration) {
    const zone = skillZones[key];
    if (!zone) return;

    if (isOnCooldown) {
        zone.element.style.borderColor = "red";
        zone.overlay.style.transition = "none";
        zone.overlay.style.height = "100%";

        // Force reflow
        zone.overlay.offsetHeight;

        zone.overlay.style.transition = `height ${duration}s linear`;
        zone.overlay.style.height = "0%";
    } else {
        zone.element.style.borderColor = "#444";
        zone.overlay.style.height = "0%";
    }
}
