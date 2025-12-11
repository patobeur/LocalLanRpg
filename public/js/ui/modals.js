
import { OPTIONS_MODAL_HTML } from "./templates/options.js";
import { generateVictoryModalHtml } from "./templates/victory.js";

export class Modals {
    constructor(onModeChange) {
        this.onModeChange = onModeChange;
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

        // Load initial mode
        const currentProfile = this.loadProfile();
        if (currentProfile && currentProfile.mode) {
            modalMoveModeSelect.value = currentProfile.mode;
            // Notify main immediately about the stored mode
            if (this.onModeChange) this.onModeChange(currentProfile.mode);
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

        // Update mode when changed in modal
        modalMoveModeSelect.addEventListener("change", () => {
            const current = this.loadProfile() || {};
            current.mode = modalMoveModeSelect.value;
            this.saveProfile(current);

            if (this.onModeChange) {
                this.onModeChange(current.mode);
            }
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
