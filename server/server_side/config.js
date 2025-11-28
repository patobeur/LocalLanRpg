const config = {
    locations: {
        spawnTeamA: { x: -22, y: -22, z: 0.12, w: 5, h: .25, d: 5, type: "CylinderGeometry" },
        spawnTeamB: { x: 22, y: 22, z: 0.12, w: 5, h: .25, d: 5, type: "CylinderGeometry" },
        spawnMinionsA: { x: -18, y: -18, z: 0.12, w: 2, h: .25, d: 2, type: "CylinderGeometry" },
        spawnMinionsB: { x: 18, y: 18, z: 0.12, w: 2, h: .25, d: 2, type: "CylinderGeometry" },
    },
    structures: {
        BaseTeamA: { x: -25, y: -25, hp: 1000, z: 0, w: 5, h: 5, d: 5, type: "sphereGeometry" },
        BaseTeamB: { x: 25, y: 25, hp: 1000, z: 0, w: 5, h: 5, d: 5, type: "sphereGeometry" },
    },
    meshes: {
        BaseTeamA: { x: -25, y: -25, hp: 1000, z: 0, w: 5, h: 5, d: 5, type: "GLB", filepath: "./media/structures/glb/baseTeamA.glb" },
        BaseTeamB: { x: 25, y: 25, hp: 1000, z: 0, w: 5, h: 5, d: 5, type: "GLB", filepath: "./media/structures/glb/baseTeamB.glb" },
    },
};

module.exports = config;