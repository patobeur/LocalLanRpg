export function initGameUI(onModeChange) {
    // Inject In-Game Options Modal
    const modal = document.createElement("div");
    modal.id = "options-modal";
    modal.hidden = true;
    modal.innerHTML = `
		<div id="options-content">
			<h2>Options</h2>
			<label>Mode de déplacement</label>
			<select id="modalMoveMode" style="width:100%; padding:8px; background:#0e1523; color:#eaeefb; border:1px solid #26324a; border-radius:4px;">
				<option value="keyboard">Clavier (ZQSD / Flèches)</option>
				<option value="mouse">Souris (Cliquer pour bouger)</option>
			</select>
			<button class="close-btn" id="closeOptions">Fermer</button>
		</div>
	`;
    document.body.appendChild(modal);

    const modalMoveModeSelect = document.getElementById("modalMoveMode");
    const closeOptionsBtn = document.getElementById("closeOptions");

    function loadProfile() {
        try {
            return JSON.parse(localStorage.getItem("topdown_profile") || "null");
        } catch {
            return null;
        }
    }

    function saveProfile(p) {
        localStorage.setItem("topdown_profile", JSON.stringify(p));
    }

    // Load initial mode
    const currentProfile = loadProfile();
    if (currentProfile && currentProfile.mode) {
        modalMoveModeSelect.value = currentProfile.mode;
        // Notify main immediately about the stored mode
        if (onModeChange) onModeChange(currentProfile.mode);
    }

    // Modal Logic
    function toggleModal() {
        modal.hidden = !modal.hidden;
    }

    addEventListener("keydown", (e) => {
        if (e.key.toLowerCase() === "h" || e.key === "Escape") {
            toggleModal();
        }
    });

    closeOptionsBtn.addEventListener("click", () => {
        modal.hidden = true;
    });

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.hidden = true;
        }
    });

    // Update mode when changed in modal
    modalMoveModeSelect.addEventListener("change", () => {
        const current = loadProfile() || {};
        current.mode = modalMoveModeSelect.value;
        saveProfile(current);

        if (onModeChange) {
            onModeChange(current.mode);
        }
    });

    return {
        toggle: toggleModal,
        updatePlayerInfo: (name, level, health, maxHealth, mana, maxMana, xp, maxXp) => {
            const nameEl = document.getElementById("player-name");
            const levelEl = document.getElementById("player-level");
            const xpBar = document.getElementById("bar-xp");
            const hpBar = document.getElementById("bar-hp");
            const mpBar = document.getElementById("bar-mp");

            if (nameEl) nameEl.textContent = name;
            if (levelEl) levelEl.textContent = `Niveau ${level}`;

            if (xpBar) xpBar.style.width = `${Math.min(100, Math.max(0, (xp / maxXp) * 100))}%`;
            if (hpBar) hpBar.style.width = `${Math.min(100, Math.max(0, (health / maxHealth) * 100))}%`;
            if (mpBar) mpBar.style.width = `${Math.min(100, Math.max(0, (mana / maxMana) * 100))}%`;
        }
    };
}
