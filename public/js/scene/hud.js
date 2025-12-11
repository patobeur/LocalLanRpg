import * as THREE from "/node_modules/three/build/three.module.js";

/**
 * Creates a unified HUD for any entity.
 * @param {Object} config - Configuration object
 * @param {string} [config.name] - Name to display
 * @param {number} [config.level] - Level to display (optional)
 * @param {THREE.Color|number} config.teamColor - Color of the health bar/name
 * @param {number} [config.width=1.2] - Width of the bars
 * @param {number} [config.height=0.3] - Height of the health bar
 * @param {boolean} [config.showName=true] - Whether to show the name
 * @param {boolean} [config.showLevel=true] - Whether to show the level
 * @param {boolean} [config.showMana=true] - Whether to show the mana bar
 * @returns {THREE.Group} The HUD group
 */
export function createHUD(config) {
    const {
        name = "",
        level = 1,
        teamColor,
        width = 1.2,
        height = 0.3,
        showName = true,
        showLevel = true,
        showMana = true,
    } = config;

    const hudGroup = new THREE.Group();
    const manaHeight = 0.2;
    const spacing = 0.03;

    // --- Name ---
    let nameContext, nameTexture;
    if (showName) {
        const nameCanvas = document.createElement("canvas");
        nameCanvas.width = 256;
        nameCanvas.height = 64;
        nameContext = nameCanvas.getContext("2d");
        nameContext.font = "bold 24px Arial";
        nameContext.fillStyle = "white";
        nameContext.textAlign = "center";

        nameContext.fillText(name, 128, 30);

        nameTexture = new THREE.CanvasTexture(nameCanvas);
        // Using Sprite for Text is usually preferred for readability, but user said "exactly like player"
        // Player used Sprite for text in original code, so we keep Sprite for Text.
        // User specifically complained about "sprite story" regarding the bars rotation logic.
        const nameMaterial = new THREE.SpriteMaterial({
            map: nameTexture,
            depthTest: true,
        });
        const nameSprite = new THREE.Sprite(nameMaterial);
        nameSprite.scale.set(2, 0.5, 1);
        nameSprite.position.y = 0.45;
        hudGroup.add(nameSprite);
    }

    // --- Level ---
    let levelContext, levelTexture, drawLevel;
    if (showLevel) {
        const levelCanvas = document.createElement("canvas");
        levelCanvas.width = 64;
        levelCanvas.height = 64;
        levelContext = levelCanvas.getContext("2d");
        drawLevel = (lvl) => {
            levelContext.clearRect(0, 0, 64, 64);
            levelContext.fillStyle = "black";
            levelContext.fillRect(0, 0, 64, 64);
            levelContext.strokeStyle = "gold";
            levelContext.lineWidth = 4;
            levelContext.strokeRect(2, 2, 60, 60);
            levelContext.font = "bold 32px Arial";
            levelContext.fillStyle = "white";
            levelContext.textAlign = "center";
            levelContext.textBaseline = "middle";
            levelContext.fillText(lvl, 32, 32);
        };
        drawLevel(level);
        levelTexture = new THREE.CanvasTexture(levelCanvas);
        const levelMaterial = new THREE.SpriteMaterial({
            map: levelTexture,
            depthTest: true,
        });
        const levelSprite = new THREE.Sprite(levelMaterial);
        levelSprite.scale.set(0.3, 0.3, 1);
        levelSprite.position.x = -width / 2 - 0.25;
        hudGroup.add(levelSprite);
    }

    // --- Health Bar (Mesh/Plane) ---
    const healthBarGroup = new THREE.Group();
    const healthBgGeom = new THREE.PlaneGeometry(width, height);
    const healthBgMat = new THREE.MeshBasicMaterial({
        color: 0x111111,
        depthTest: true,
        side: THREE.DoubleSide // Visible from both sides
    });
    const healthBg = new THREE.Mesh(healthBgGeom, healthBgMat);
    healthBarGroup.add(healthBg);

    const healthFgGeom = new THREE.PlaneGeometry(width, height);
    const healthFgMat = new THREE.MeshBasicMaterial({
        color: teamColor,
        depthTest: true,
        side: THREE.DoubleSide
    });
    const healthFg = new THREE.Mesh(healthFgGeom, healthFgMat);
    healthFg.position.z = 0.001;
    healthBarGroup.add(healthFg);
    hudGroup.add(healthBarGroup);

    // --- Mana Bar (Mesh/Plane) ---
    let manaFg;
    if (showMana) {
        const manaBarGroup = new THREE.Group();
        const manaBgGeom = new THREE.PlaneGeometry(width, manaHeight);
        const manaBgMat = new THREE.MeshBasicMaterial({
            color: 0x111111,
            depthTest: true,
            side: THREE.DoubleSide
        });
        const manaBg = new THREE.Mesh(manaBgGeom, manaBgMat);
        manaBarGroup.add(manaBg);

        const manaFgGeom = new THREE.PlaneGeometry(width, manaHeight);
        const manaFgMat = new THREE.MeshBasicMaterial({
            color: 0x3498db, // Blue
            depthTest: true,
            side: THREE.DoubleSide
        });
        manaFg = new THREE.Mesh(manaFgGeom, manaFgMat);
        manaFg.position.z = 0.001;
        manaBarGroup.add(manaFg);

        // Position mana bar below health bar
        manaBarGroup.position.y = -(height + manaHeight) / 2 - spacing;
        hudGroup.add(manaBarGroup);
    }

    // Store references for updates
    hudGroup.userData = {
        name,
        healthBar: healthFg,
        manaBar: manaFg,
        levelContext,
        levelTexture,
        drawLevel,
        barWidth: width,
        ignoreRaycast: true,
        showName,
        showLevel,
        showMana
    };

    // Default HUD offset
    hudGroup.position.y = 2;

    return hudGroup;
}

/**
 * Updates an existing HUD configuration.
 */
export function updateHUD(hudGroup, data) {
    if (!hudGroup || !hudGroup.userData) return;

    const {
        healthBar,
        manaBar,
        levelTexture,
        drawLevel,
        barWidth,
        showLevel,
        showMana
    } = hudGroup.userData;

    // Update Health (Plane scaling)
    if (data.health !== undefined && data.maxHealth) {
        const healthPercent = Math.max(0, Math.min(1, data.health / data.maxHealth));
        healthBar.scale.x = healthPercent;
        // Shift position to align left edge
        // Center is 0. Scale S. New width S*W. 
        // We want left edge at -W/2.
        // Current center is 0. Current left edge is -(S*W)/2.
        // We want to move it by X.
        // -(S*W)/2 + X = -W/2
        // X = (S*W)/2 - W/2 = (W/2) * (S - 1)
        healthBar.position.x = (barWidth / 2) * (healthPercent - 1);
    }

    // Update Mana (Plane scaling)
    if (showMana && manaBar && data.mana !== undefined && data.maxMana) {
        const manaPercent = Math.max(0, Math.min(1, data.mana / data.maxMana));
        manaBar.scale.x = manaPercent;
        manaBar.position.x = (barWidth / 2) * (manaPercent - 1);
    }

    // Update Level
    if (showLevel && drawLevel && data.level !== undefined && hudGroup.userData.level !== data.level) {
        hudGroup.userData.level = data.level;
        drawLevel(data.level);
        if (levelTexture) levelTexture.needsUpdate = true;
    }
}
