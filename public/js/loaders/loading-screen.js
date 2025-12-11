/**
 * Loading Screen Manager
 * Controls the loading screen UI and updates progress
 */
export class LoadingScreenManager {
    constructor() {
        this.loadingScreen = null;
        this.progressFill = null;
        this.progressText = null;
        this.loadingStatus = null;
        this.readyPlayers = null;

        this.isReady = false;
        this.allPlayersReady = false;
    }

    /**
     * Initialize loading screen (inject HTML into jouer.html)
     */
    init() {
        // Create loading screen HTML
        const loadingHTML = `
            <div id="loading-screen" class="loading-screen">
                <div class="loading-container">
                    <h1 class="loading-title">🎮 Chargement...</h1>
                    
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div id="progress-fill" class="progress-fill"></div>
                        </div>
                        <div id="progress-text" class="progress-text">0 / 0 assets</div>
                    </div>

                    <div class="ready-section">
                        <h2 class="ready-title">Joueurs prêts:</h2>
                        <div id="ready-players" class="ready-players">
                            <div class="waiting-message">En attente des autres joueurs...</div>
                        </div>
                    </div>

                    <div id="loading-status" class="loading-status">
                        Chargement des assets...
                    </div>
                </div>
            </div>
        `;

        // Inject into body
        document.body.insertAdjacentHTML('beforeend', loadingHTML);

        // Get elements
        this.loadingScreen = document.getElementById('loading-screen');
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        this.loadingStatus = document.getElementById('loading-status');
        this.readyPlayers = document.getElementById('ready-players');
    }

    /**
     * Update progress
     */
    updateProgress({ loaded, total, progress }) {
        if (this.progressFill) {
            this.progressFill.style.width = `${progress * 100}%`;
        }
        if (this.progressText) {
            this.progressText.textContent = `${loaded} / ${total} assets`;
        }
    }

    /**
     * Set status message
     */
    setStatus(message) {
        if (this.loadingStatus) {
            this.loadingStatus.textContent = message;
        }
    }

    /**
     * Update ready players list
     */
    updateReadyPlayers(players) {
        if (!this.readyPlayers) return;

        if (players.length === 0) {
            this.readyPlayers.innerHTML = '<div class="waiting-message">En attente des autres joueurs...</div>';
            return;
        }

        this.readyPlayers.innerHTML = players
            .map(player => `<div class="player-ready">${player}</div>`)
            .join('');
    }

    /**
     * Mark local player as ready
     */
    markReady() {
        this.isReady = true;
        this.setStatus('En attente des autres joueurs...');
    }

    /**
     * Hide loading screen and start game
     */
    hide() {
        if (this.loadingScreen) {
            this.loadingScreen.style.opacity = '0';
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
            }, 300);
        }
    }

    /**
     * Show loading screen
     */
    show() {
        if (this.loadingScreen) {
            this.loadingScreen.style.display = 'flex';
            this.loadingScreen.style.opacity = '1';
        }
    }
}

export const loadingScreen = new LoadingScreenManager();
