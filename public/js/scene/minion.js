import * as THREE from "/node_modules/three/build/three.module.js";

/**
 * Create a 3D mesh for a minion
 * @param {string} name - Minion type name
 * @param {string} faction - "blue" or "red"
 * @returns {THREE.Group} Minion mesh group
 */
export function makeMinionMesh(name, faction) {
    const g = new THREE.Group();

    // Determine color based on faction
    const bodyColor = faction === "blue" ? 0x4169E1 : 0xDC143C;
    const accentColor = faction === "blue" ? 0x1E90FF : 0xFF6347;

    // Body - smaller cylinder than player
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 0.6, 8),
        new THREE.MeshStandardMaterial({ color: bodyColor })
    );
    body.position.y = 0.3;
    g.add(body);

    // Head - smaller sphere
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 12, 10),
        new THREE.MeshStandardMaterial({ color: accentColor })
    );
    head.position.y = 0.75;
    g.add(head);

    // Direction indicator
    const dir = new THREE.Mesh(
        new THREE.ConeGeometry(0.1, 0.2, 8),
        new THREE.MeshStandardMaterial({ color: 0xeeeeee })
    );
    dir.rotation.x = Math.PI;
    dir.position.set(0, 0.75, 0.25);
    g.add(dir);

    // Health bar
    const healthBarGroup = createMinionHealthBar(faction);
    g.add(healthBarGroup);
    g.userData.healthBarGroup = healthBarGroup;

    // Store faction and name
    g.userData.faction = faction;
    g.userData.name = name;

    return g;
}

/**
 * Create health bar for minion
 */
function createMinionHealthBar(faction) {
    const hudGroup = new THREE.Group();
    const barWidth = 0.8;
    const healthBarHeight = 0.15;

    const healthBarGroup = new THREE.Group();
    const healthBgGeom = new THREE.PlaneGeometry(barWidth, healthBarHeight);
    const healthBgMat = new THREE.MeshBasicMaterial({
        color: 0x111111,
        depthTest: true,
    });
    const healthBg = new THREE.Mesh(healthBgGeom, healthBgMat);
    healthBarGroup.add(healthBg);

    const factionColor = faction === "blue" ? 0x4169E1 : 0xDC143C;
    const healthFgGeom = new THREE.PlaneGeometry(barWidth, healthBarHeight);
    const healthFgMat = new THREE.MeshBasicMaterial({
        color: factionColor,
        depthTest: true,
    });
    const healthFg = new THREE.Mesh(healthFgGeom, healthFgMat);
    healthFg.position.z = 0.001;
    healthBarGroup.add(healthFg);
    hudGroup.add(healthBarGroup);

    // Store references
    hudGroup.userData = {
        healthBar: healthFg,
        barWidth: barWidth,
    };

    hudGroup.position.y = 1.2; // Above minion head

    return hudGroup;
}

/**
 * Update minion health bar
 * @param {THREE.Group} minionMesh - Minion mesh
 * @param {number} health - Current health
 * @param {number} maxHealth - Max health
 */
export function updateMinionHealth(minionMesh, health, maxHealth) {
    if (!minionMesh || !minionMesh.userData.healthBarGroup) return;

    const { healthBar, barWidth } = minionMesh.userData.healthBarGroup.userData;

    const healthPercent = Math.max(0, Math.min(1, health / maxHealth));
    healthBar.scale.x = healthPercent;
    healthBar.position.x = -barWidth / 2 + (barWidth * healthPercent) / 2;
}
