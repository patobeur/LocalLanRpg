export function initUI(onConnect) {
    const hud = document.getElementById("hud");
    const ui = document.getElementById("ui");
    const nameInput = document.getElementById("name");
    const colorInput = document.getElementById("color");
    const saveBtn = document.getElementById("save");
    const hint = document.getElementById("hint");

    // Inject Options UI (Login Card)
    const card = document.getElementById("card");
    const optionsDiv = document.createElement("div");
    optionsDiv.style.marginTop = "15px";
    optionsDiv.style.borderTop = "1px solid #26324a";
    optionsDiv.style.paddingTop = "10px";
    optionsDiv.innerHTML = `
		<label>Mode de déplacement</label>
		<select id="moveMode" style="width:100%; padding:8px; background:#0e1523; color:#eaeefb; border:1px solid #26324a; border-radius:4px;">
			<option value="keyboard">Clavier (ZQSD / Flèches)</option>
			<option value="mouse">Souris (Cliquer pour bouger)</option>
		</select>
	`;
    card.insertBefore(optionsDiv, hint);

    // Inject Character Selection Modal
    const charModal = document.createElement("div");
    charModal.id = "char-modal";
    charModal.style.position = "fixed";
    charModal.style.inset = "0";
    charModal.style.background = "#121a2a";
    charModal.style.display = "none"; // Hidden by default
    charModal.style.flexDirection = "column";
    charModal.style.alignItems = "center";
    charModal.style.justifyContent = "center";
    charModal.style.zIndex = "2000";
    charModal.innerHTML = `
		<h2 style="color:#eaeefb; margin-bottom:20px;">Choisis ton personnage</h2>
		<div id="char-grid" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:20px; max-width:800px;"></div>
	`;
    document.body.appendChild(charModal);

    const charGrid = document.getElementById("char-grid");

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

    const moveModeSelect = document.getElementById("moveMode");
    const modalMoveModeSelect = document.getElementById("modalMoveMode");
    const closeOptionsBtn = document.getElementById("closeOptions");

    // Sync selects
    moveModeSelect.addEventListener("change", () => {
        modalMoveModeSelect.value = moveModeSelect.value;
    });
    modalMoveModeSelect.addEventListener("change", () => {
        moveModeSelect.value = modalMoveModeSelect.value;
    });

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

    // Load session and prefill username from account
    fetch('/api/auth/session')
        .then(res => res.json())
        .then(sessionData => {
            const currentProfile = loadProfile();
            if (currentProfile) {
                // Use account username if available, otherwise use stored name
                nameInput.value = sessionData.authenticated ? sessionData.user.username : currentProfile.name;
                colorInput.value = currentProfile.color;
                if (currentProfile.mode) {
                    moveModeSelect.value = currentProfile.mode;
                    modalMoveModeSelect.value = currentProfile.mode;
                }
            } else if (sessionData.authenticated) {
                // Prefill with username from account
                nameInput.value = sessionData.user.username;
                ui.hidden = false;
            } else {
                ui.hidden = false;
            }
        })
        .catch(err => {
            console.error('Session fetch error:', err);
            // Fallback to local profile
            const currentProfile = loadProfile();
            if (currentProfile) {
                nameInput.value = currentProfile.name;
                colorInput.value = currentProfile.color;
                if (currentProfile.mode) {
                    moveModeSelect.value = currentProfile.mode;
                    modalMoveModeSelect.value = currentProfile.mode;
                }
            } else {
                ui.hidden = false;
            }
        });

    async function showCharacterSelection(profile) {
        try {
            charModal.style.display = "flex";
            charGrid.innerHTML = "<div style='color:white'>Chargement...</div>";

            const res = await fetch("/api/characters");
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            charGrid.innerHTML = "";

            if (!data || !data.chars) {
                console.error("No chars property in data:", data);
                onConnect(profile);
                return;
            }

            const chars = Object.values(data.chars);
            if (chars.length === 0) {
                console.error("Character list is empty");
                onConnect(profile);
                return;
            }

            chars.forEach((char) => {
                const card = document.createElement("div");
                card.style.background = "#0e1523";
                card.style.border = "1px solid #26324a";
                card.style.borderRadius = "8px";
                card.style.padding = "15px";
                card.style.cursor = "pointer";
                card.style.textAlign = "center";
                card.style.transition = "transform 0.2s";

                card.innerHTML = `
					<h3 style="color:${profile.color}; margin:0 0 10px 0;">${char.name}</h3>
					<div style="font-size:12px; color:#8b9bb4; margin-bottom:10px;">${char.type.toUpperCase()}</div>
					<div style="font-size:14px; color:#eaeefb;">
						HP: ${char.health}<br>
						Mana: ${char.mana}<br>
						Speed: ${char.speed}
					</div>
				`;

                card.onmouseenter = () => (card.style.transform = "scale(1.05)");
                card.onmouseleave = () => (card.style.transform = "scale(1)");

                card.onclick = () => {
                    charModal.style.display = "none";
                    profile.character = char.name;
                    onConnect(profile);
                };

                charGrid.appendChild(card);
            });
        } catch (e) {
            console.error("Failed to load characters", e);
            // Fallback if API fails
            onConnect(profile);
        }
    }

    saveBtn.addEventListener("click", () => {
        saveBtn.disabled = true;
        const name = nameInput.value.trim() || "Joueur";
        const color = colorInput.value || "#4caf50";
        const mode = moveModeSelect.value;
        const profile = { name, color, mode };
        saveProfile(profile);
        ui.hidden = true;
        showCharacterSelection(profile);
    });

    // Modal Logic
    function toggleModal() {
        modal.hidden = !modal.hidden;
    }

    addEventListener("keydown", (e) => {
        if (e.key.toLowerCase() === "h" || e.key === "Escape") {
            if (!ui.hidden && charModal.style.display === "none") return; // Don't open if on login or char select
            if (charModal.style.display !== "none") return; // Don't open if on char select
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
        window.dispatchEvent(
            new CustomEvent("mode-change", { detail: current.mode })
        );
    });

    return {
        updateHUD: (text) => (hud.textContent = text),
        appendHint: (html) => (hint.innerHTML += html),
        resetUI: () => {
            saveBtn.disabled = false;
            ui.hidden = false;
            charModal.style.display = "none";
        },
    };
}