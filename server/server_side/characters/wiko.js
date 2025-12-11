module.exports = {
    name: "Wiko",
    type: "dps",
    description_rapide: "Un dps à distance qui inflige de lourds dégâts.",
    commentaire:
        "Wiko est un 'glass cannon'. Il peut infliger d'énormes dégâts à distance, mais il est très fragile. Un bon positionnement est essentiel pour survivre et maximiser son potentiel de dégâts.",
    speed: [
        3.5, 3.6, 3.7, 3.8, 3.9, 4, 4.1, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2,
    ], // [skill lv1, lv2, ..., lv18 ]

    hitDistance: [5, 6, 7, 8, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
    autoAttackDamage: [
        55, 65, 75, 85, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140,
        145, 150, 155, 160,
    ],
    autoAttackCd: [
        1.8, 1.7, 1.6, 1.5, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4,
        1.4, 1.4, 1.4, 1.4, 1.4,
    ],

    skill1Id: 0,
    skill2Id: 1,
    skill3Id: 2,
    ultimatId: 3,

    health: [
        120, 160, 200, 240, 280, 300, 320, 340, 360, 380, 400, 420, 440,
        460, 480, 500, 520, 540,
    ],
    mana: [
        90, 110, 130, 150, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260,
        270, 280, 290, 300,
    ],
    HealthRegeneration: [
        1, 1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.4, 2.6, 2.8, 3, 3.2, 3.4, 3.6, 3.8,
        4, 4.2, 4.4,
    ],
    manaRegeneration: [
        1.2, 1.7, 2.2, 2.7, 3.2, 3.4, 3.6, 3.8, 4, 4.2, 4.4, 4.6, 4.8, 5,
        5.2, 5.4, 5.6, 5.8,
    ],
    physiqueArmor: [
        15, 18, 21, 24, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47, 49, 51,
        53,
    ],
    magicArmor: [
        15, 18, 21, 24, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47, 49, 51,
        53,
    ],

    scale: 1,
    svg: "wiko.svg",
    png: "Wiko.png",
    glb: "Wiko.gltf",
};
