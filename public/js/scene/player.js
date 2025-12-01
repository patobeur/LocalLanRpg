import * as THREE from "/node_modules/three/build/three.module.js";

// NOUVEAU: Fonction unifiée pour créer le HUD
function createPlayerHUD(name, level, factionColor) {
    const hudGroup = new THREE.Group();
    const barWidth = 1.2;
    const healthBarHeight = 0.3;
    const manaBarHeight = 0.2;

    // --- Nom ---
    const nameCanvas = document.createElement("canvas");
    nameCanvas.width = 256;
    nameCanvas.height = 64;
    const nameContext = nameCanvas.getContext("2d");
    nameContext.font = "bold 24px Arial";
    nameContext.fillStyle = "white";
    nameContext.textAlign = "center";
    nameContext.fillText(name, 128, 30);
    const nameTexture = new THREE.CanvasTexture(nameCanvas);
    const nameMaterial = new THREE.SpriteMaterial({
        map: nameTexture,
        depthTest: true,
    });
    const nameSprite = new THREE.Sprite(nameMaterial);
    nameSprite.scale.set(2, 0.5, 1);
    nameSprite.position.y = 0.45;
    hudGroup.add(nameSprite);

    // --- Niveau ---
    const levelCanvas = document.createElement("canvas");
    levelCanvas.width = 64;
    levelCanvas.height = 64;
    const levelContext = levelCanvas.getContext("2d");
    const drawLevel = (lvl) => {
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
    const levelTexture = new THREE.CanvasTexture(levelCanvas);
    const levelMaterial = new THREE.SpriteMaterial({
        map: levelTexture,
        depthTest: true,
    });
    const levelSprite = new THREE.Sprite(levelMaterial);
    levelSprite.scale.set(0.3, 0.3, 1);
    levelSprite.position.x = -barWidth / 2 - 0.25;
    hudGroup.add(levelSprite);

    // --- Barre de vie ---
    const healthBarGroup = new THREE.Group();
    const healthBgGeom = new THREE.PlaneGeometry(barWidth, healthBarHeight);
    const healthBgMat = new THREE.MeshBasicMaterial({
        color: 0x111111,
        depthTest: true,
    });
    const healthBg = new THREE.Mesh(healthBgGeom, healthBgMat);
    healthBarGroup.add(healthBg);

    const healthFgGeom = new THREE.PlaneGeometry(barWidth, healthBarHeight);
    const healthFgMat = new THREE.MeshBasicMaterial({
        color: factionColor,
        depthTest: true,
    });
    const healthFg = new THREE.Mesh(healthFgGeom, healthFgMat);
    healthFg.position.z = 0.001;
    healthBarGroup.add(healthFg);
    hudGroup.add(healthBarGroup);

    // --- Barre de mana ---
    const manaBarGroup = new THREE.Group();
    const manaBgGeom = new THREE.PlaneGeometry(barWidth, manaBarHeight);
    const manaBgMat = new THREE.MeshBasicMaterial({
        color: 0x111111,
        depthTest: true,
    });
    const manaBg = new THREE.Mesh(manaBgGeom, manaBgMat);
    manaBarGroup.add(manaBg);

    const manaFgGeom = new THREE.PlaneGeometry(barWidth, manaBarHeight);
    const manaFgMat = new THREE.MeshBasicMaterial({
        color: 0x3498db,
        depthTest: true,
    });
    const manaFg = new THREE.Mesh(manaFgGeom, manaFgMat);
    manaFg.position.z = 0.001;
    manaBarGroup.add(manaFg);
    // manaBarGroup.position.y = -(healthBarHeight / 2) - manaBarHeight / 2 + 0.03;
    const spacing = 0.03;
    manaBarGroup.position.y = - (healthBarHeight + manaBarHeight) / 2;
    hudGroup.add(manaBarGroup);

    // Stocker les références pour les mises à jour
    hudGroup.userData = {
        healthBar: healthFg,
        manaBar: manaFg,
        levelContext: levelContext,
        levelTexture: levelTexture,
        drawLevel: drawLevel,
        barWidth: barWidth,
        nameContext: nameContext,
        nameTexture: nameTexture,
    };

    hudGroup.position.x = 0; // Positionner au-dessus de la tête du joueur
    hudGroup.position.y = 2; // Positionner au-dessus de la tête du joueur
    hudGroup.position.z = 0; // Positionner au-dessus de la tête du joueur

    return hudGroup;
}

// NOUVEAU: Fonction unifiée de mise à jour du HUD
export function updatePlayerHUD(
    playerMesh,
    health,
    maxHealth,
    mana,
    maxMana,
    level
) {
    if (!playerMesh || !playerMesh.userData.hud) return;

    const hud = playerMesh.userData.hud;
    const {
        healthBar,
        manaBar,
        levelContext,
        levelTexture,
        drawLevel,
        barWidth,
    } = hud.userData;

    // Mettre à jour la vie
    const healthPercent = Math.max(0, Math.min(1, health / maxHealth));
    healthBar.scale.x = healthPercent;
    healthBar.position.x = -barWidth / 2 + (barWidth * healthPercent) / 2;

    // Mettre à jour le mana
    const manaPercent = Math.max(0, Math.min(1, mana / maxMana));
    manaBar.scale.x = manaPercent;
    manaBar.position.x = -barWidth / 2 + (barWidth * manaPercent) / 2;

    // Mettre à jour le niveau
    const oldLevel = playerMesh.userData.level;
    if (oldLevel !== level) {
        playerMesh.userData.level = level;
        drawLevel(level);
        levelTexture.needsUpdate = true;
    }
}

// REFACTORISÉ: makePlayerMesh
export function makePlayerMesh(name, level, hexColor) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.9, 12),
        new THREE.MeshStandardMaterial({
            color: new THREE.Color(hexColor),
        })
    );
    body.position.y = 0.45;
    g.add(body);
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 16, 12),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    head.position.y = 1.1;
    g.add(head);
    const dir = new THREE.Mesh(
        new THREE.ConeGeometry(0.15, 0.3, 10),
        new THREE.MeshStandardMaterial({ color: 0xeeeeee })
    );
    dir.rotation.x = Math.PI;
    dir.position.set(0, 1.1, 0.35);
    g.add(dir);

    // Ajouter le HUD unifié
    const hud = createPlayerHUD(name, level, new THREE.Color(hexColor));
    g.add(hud);
    g.userData.hud = hud;
    g.userData.level = level;
    g.userData.name = name;

    return g;
}
