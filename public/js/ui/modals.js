
import { OPTIONS_MODAL_HTML } from "./templates/options.js";
import { generateVictoryModalHtml } from "./templates/victory.js";

export class Modals {
    constructor(onOptionChange) {
        this.onOptionChange = onOptionChange;
        this.modal = null;
        this.initOptionsModal();
    }

    initOptionsModal() {
        // Inject In-Game Options Modal
        this.modal = document.createElement("div");
        this.modal.id = "options-modal";
        this.modal.hidden = true;
        this.modal.innerHTML = OPTIONS_MODAL_HTML;
        document.body.appendChild(this.modal);

        const modalMoveModeSelect = document.getElementById("modalMoveMode");
        const closeOptionsBtn = document.getElementById("closeOptions");
        const quitBtn = document.getElementById("quitGameBtn");
        const smartTargetingCheckbox = document.getElementById("smartTargeting");
        const smartTargetingKeyInput = document.getElementById("smartTargetingKey");

        if (quitBtn) {
            quitBtn.onclick = async () => {
                const urlParams = new URLSearchParams(window.location.search);
                const roomId = urlParams.get("roomId");
                if (roomId) {
                    try {
                        await fetch(`/api/rooms/${roomId}/leave`, { method: "POST" });
                    } catch (e) {
                        console.error("Error leaving room:", e);
                    }
                }
                window.location.href = "lobby.html";
            };
        }

        // Load initial profile
        const currentProfile = this.loadProfile() || {};
        modalMoveModeSelect.value = currentProfile.mode || "keyboard";
        smartTargetingCheckbox.checked = currentProfile.smartTargeting ?? true;
        smartTargetingKeyInput.value = currentProfile.smartTargetingKey || "Shift";
        smartTargetingKeyInput.disabled = !smartTargetingCheckbox.checked;

        // Notify main immediately about the stored profile
        if (this.onOptionChange) {
            this.onOptionChange(this.loadProfile() || {});
        }

        // Event Listeners
        addEventListener("keydown", (e) => {
            if (e.key.toLowerCase() === "h" || e.key === "Escape") {
                this.toggle();
            }
        });

        closeOptionsBtn.addEventListener("click", () => {
            this.modal.hidden = true;
        });

        this.modal.addEventListener("click", (e) => {
            if (e.target === this.modal) {
                this.modal.hidden = true;
            }
        });

        const updateProfile = (key, value) => {
            const current = this.loadProfile() || {};
            current[key] = value;
            this.saveProfile(current);
            if (this.onOptionChange) {
                this.onOptionChange(current);
            }
        };

        modalMoveModeSelect.addEventListener("change", () => {
            updateProfile("mode", modalMoveModeSelect.value);
        });

        smartTargetingCheckbox.addEventListener("change", () => {
            const isEnabled = smartTargetingCheckbox.checked;
            smartTargetingKeyInput.disabled = !isEnabled;
            updateProfile("smartTargeting", isEnabled);
        });

        smartTargetingKeyInput.addEventListener("input", () => {
            updateProfile("smartTargetingKey", smartTargetingKeyInput.value);
        });
    }

    toggle() {
        this.modal.hidden = !this.modal.hidden;
    }

    loadProfile() {
        try {
            return JSON.parse(localStorage.getItem("topdown_profile") || "null");
        } catch {
            return null;
        }
    }

    saveProfile(p) {
        localStorage.setItem("topdown_profile", JSON.stringify(p));
    }

    showVictoryModal(winningTeam, players) {
        // Create victory modal
        let victoryModal = document.getElementById("victory-modal");
        if (!victoryModal) {
            victoryModal = document.createElement("div");
            victoryModal.id = "victory-modal";
            victoryModal.style.cssText =
                "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); display:flex; align-items:center; justify-content:center; z-index:10000;";
            document.body.appendChild(victoryModal);
        }

        victoryModal.innerHTML = generateVictoryModalHtml(winningTeam, players);

        // Auto-redirect timer
        let countdown = 60;
        const countdownEl = document.getElementById("countdown");
        const returnBtn = document.getElementById("return-lobby-btn");

        const timer = setInterval(() => {
            countdown--;
            if (countdownEl) countdownEl.textContent = countdown;

            if (countdown <= 0) {
                clearInterval(timer);
                this.redirectToLobby();
            }
        }, 1000);

        // Manual redirect on button click
        if (returnBtn) {
            returnBtn.onclick = () => {
                clearInterval(timer);
                this.redirectToLobby();
            };
        }
    }

    async redirectToLobby() {
        const urlParams = new URLSearchParams(window.location.search);
        const roomId = urlParams.get("roomId");
        if (roomId) {
            try {
                await fetch(`/api/rooms/${roomId}/leave`, { method: "POST" });
            } catch (e) {
                console.error("Error leaving room:", e);
            }
        }
        window.location.href = "lobby.html";
    }
}
