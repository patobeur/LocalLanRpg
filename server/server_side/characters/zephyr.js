module.exports = {
    name: "Zephyr",
    type: "speedster",
    description_rapide: "Un speedster agile qui frappe vite et fort.",
    commentaire:
        "Zephyr est tout en vitesse. Sa grande mobilité lui permet de harceler ses ennemis et de se déplacer rapidement sur la carte. Il est parfait pour des attaques éclairs et pour poursuivre des cibles. Sa faiblesse est sa faible résistance.",
    speed: [
        3.5, 3.6, 3.7, 3.8, 3.9, 4, 4.1, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2,
    ], // [skill lv1, lv2, ..., lv18 ]

    hitDistance: [5, 6, 7, 8, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
    autoAttackDamage: [
        45, 52, 59, 66, 73, 76, 79, 82, 85, 88, 91, 94, 97, 100, 103, 106,
        109, 112,
    ],
    autoAttackCd: [
        1.7, 1.6, 1.5, 1.4, 1.3, 1.25, 1.2, 1.15, 1.1, 1.05, 1, 0.95, 0.9,
        0.85, 0.8, 0.75, 0.7, 0.65,
    ],

    skill1Id: 0,
    skill2Id: 1,
    skill3Id: 2,
    ultimatId: 3,

    health: [
        130, 170, 210, 250, 290, 310, 330, 350, 370, 390, 410, 430, 450,
        470, 490, 510, 530, 550,
    ],
    mana: [
        70, 90, 110, 130, 150, 155, 160, 165, 170, 175, 180, 185, 190, 195,
        200, 205, 210, 215,
    ],
    HealthRegeneration: [
        1.3, 1.6, 1.9, 2.2, 2.5, 2.7, 2.9, 3.1, 3.3, 3.5, 3.7, 3.9, 4.1,
        4.3, 4.5, 4.7, 4.9, 5.1,
    ],
    manaRegeneration: [
        1.1, 1.6, 2.1, 2.6, 3.1, 3.3, 3.5, 3.7, 3.9, 4.1, 4.3, 4.5, 4.7,
        4.9, 5.1, 5.3, 5.5, 5.7,
    ],
    physiqueArmor: [
        12, 15, 18, 21, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48,
        50,
    ],
    magicArmor: [
        12, 15, 18, 21, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48,
        50,
    ],

    scale: 1,
    svg: "zephyr.svg",
    png: "Zephyr.png",
    glb: "Zephyr.gltf",
};
