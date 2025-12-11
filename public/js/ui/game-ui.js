
import { Modals } from "./modals.js";
import { PlayerInfo } from "./player-info.js";

export function initGameUI(onModeChange) {
    const modals = new Modals(onModeChange);
    const playerInfo = new PlayerInfo();

    return {
        toggle: () => modals.toggle(),
        updatePlayerInfo: (...args) => playerInfo.update(...args),
        showRespawnTimer: (seconds) => playerInfo.showRespawnTimer(seconds),
        hideRespawnTimer: () => playerInfo.hideRespawnTimer(),
        showVictoryModal: (winningTeam, players) => modals.showVictoryModal(winningTeam, players)
    };
}
