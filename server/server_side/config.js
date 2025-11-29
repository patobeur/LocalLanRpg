const config = {
    locations: {
        spawnTeamA: { x: -22, y: -22, z: 0.12, w: 5, h: .25, d: 5, type: "CylinderGeometry" },
        spawnTeamB: { x: 22, y: 22, z: 0.12, w: 5, h: .25, d: 5, type: "CylinderGeometry" },
        spawnMinionsA: { x: -18, y: -18, z: 0.12, w: 2, h: .25, d: 2, type: "CylinderGeometry" },
        spawnMinionsB: { x: 18, y: 18, z: 0.12, w: 2, h: .25, d: 2, type: "CylinderGeometry" },
    },
    structures: {
        BaseTeamA: { x: -25, y: -25, z: 0, hp: 1000, type: "GLB", filepath: "./media/structures/glb/house.glb", rotation: { x: 0, y: 45, z: 0 }, scale: { x: 5, y: 5, z: 5 } },
        BaseTeamB: { x: 25, y: 25, z: 0, hp: 1000, type: "GLB", filepath: "./media/structures/glb/house.glb", rotation: { x: 0, y: -135, z: 0 }, scale: { x: 5, y: 5, z: 5 } },
    },
};

module.exports = config;