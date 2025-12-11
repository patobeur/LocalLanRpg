
export class PlayerInfo {
    constructor() {
        this.nameEl = document.getElementById("player-name");
        this.levelEl = document.getElementById("player-level");
        this.xpBar = document.getElementById("bar-xp");
        this.hpBar = document.getElementById("bar-hp");
        this.mpBar = document.getElementById("bar-mp");
    }

    update(name, level, health, maxHealth, mana, maxMana, xp, maxXp, charStats = null) {
        if (this.nameEl) this.nameEl.textContent = name;
        if (this.levelEl) this.levelEl.textContent = `Niveau ${level}`;

        if (this.xpBar)
            this.xpBar.style.width = `${Math.min(
                100,
                Math.max(0, (xp / maxXp) * 100)
            )}%`;
        if (this.hpBar)
            this.hpBar.style.width = `${Math.min(
                100,
                Math.max(0, (health / maxHealth) * 100)
            )}%`;
        if (this.mpBar)
            this.mpBar.style.width = `${Math.min(
                100,
                Math.max(0, (mana / maxMana) * 100)
            )}%`;

        if (charStats) {
            this.updateStats(charStats, level);
        }
    }

    updateStats(charStats, level) {
        const statType = document.getElementById("stat-type");
        const statSpeed = document.getElementById("stat-speed");
        const statRange = document.getElementById("stat-range");
        const statAtk = document.getElementById("stat-atk");
        const statAtkCd = document.getElementById("stat-atkcd");
        const statHpRegen = document.getElementById("stat-hpregen");
        const statMpRegen = document.getElementById("stat-mpregen");
        const statPhysArmor = document.getElementById("stat-physarmor");
        const statMagArmor = document.getElementById("stat-magarmor");

        const levelIndex = Math.max(0, level - 1);
        const getVal = (val) => Array.isArray(val) ? val[Math.min(levelIndex, val.length - 1)] : val;

        if (statType) statType.textContent = charStats.type || "-";
        if (statSpeed) statSpeed.textContent = getVal(charStats.speed) || "-";
        if (statRange) statRange.textContent = getVal(charStats.hitDistance) || "-";
        if (statAtk) statAtk.textContent = getVal(charStats.autoAttackDamage) || "-";
        if (statAtkCd) statAtkCd.textContent = getVal(charStats.autoAttackCd) || "-";
        if (statHpRegen) statHpRegen.textContent = getVal(charStats.HealthRegeneration) || "-";
        if (statMpRegen) statMpRegen.textContent = getVal(charStats.manaRegeneration) || "-";
        if (statPhysArmor) statPhysArmor.textContent = getVal(charStats.physiqueArmor) || "-";
        if (statMagArmor) statMagArmor.textContent = getVal(charStats.magicArmor) || "-";
    }

    showRespawnTimer(seconds) {
        let timerEl = document.getElementById("respawn-timer");
        if (!timerEl) {
            timerEl = document.createElement("div");
            timerEl.id = "respawn-timer";
            timerEl.style.cssText =
                "position:fixed; bottom:20px; right:20px; background:rgba(0,0,0,0.8); color:#ff4444; padding:15px 25px; border-radius:8px; font-size:24px; font-weight:bold; border:2px solid #ff4444;";
            document.body.appendChild(timerEl);
        }
        timerEl.textContent = `Respawn dans ${seconds}s`;
        timerEl.hidden = false;
    }

    hideRespawnTimer() {
        const timerEl = document.getElementById("respawn-timer");
        if (timerEl) {
            timerEl.hidden = true;
        }
    }
}
