module.exports = {
    name: "Flora",
    type: "healer",
    description_rapide:
        "Une soigneuse qui utilise le pouvoir de la nature.",
    commentaire:
        "Flora est une soigneuse pure. Sa principale force est sa capacité à restaurer les points de vie de ses alliés. Elle possède une grande réserve de mana pour soutenir son équipe sur la durée. Elle est très faible en combat singulier et doit être protégée.",
    speed: [
        3.5, 3.6, 3.7, 3.8, 3.9, 4, 4.1, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2,
    ], // [skill lv1, lv2, ..., lv18 ]

    hitDistance: [
        5.5, 5.5, 5.5, 5.5, 5.5, 5.5, 5.5, 5.5, 5.5, 5.5, 5.5, 5.5, 5.5,
        5.5, 5.5, 5.5, 5.5, 5.5,
    ],
    autoAttackDamage: [
        30, 35, 40, 45, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74,
        76,
    ],
    autoAttackCd: [
        2.2, 2.1, 2, 1.9, 1.8, 1.8, 1.8, 1.8, 1.8, 1.8, 1.8, 1.8, 1.8, 1.8,
        1.8, 1.8, 1.8, 1.8,
    ],

    skill1Id: 0,
    skill2Id: 1,
    skill3Id: 2,
    ultimatId: 3,

    health: [
        145, 185, 225, 265, 305, 325, 345, 365, 385, 405, 425, 445, 465,
        485, 505, 525, 545, 565,
    ],
    mana: [
        120, 150, 180, 210, 240, 260, 280, 300, 320, 340, 360, 380, 400,
        420, 440, 460, 480, 500,
    ],
    HealthRegeneration: [
        1.4, 1.6, 1.8, 2, 2.2, 2.4, 2.6, 2.8, 3, 3.2, 3.4, 3.6, 3.8, 4, 4.2,
        4.4, 4.6, 4.8,
    ],
    manaRegeneration: [
        2, 2.5, 3, 3.5, 4, 4.3, 4.6, 4.9, 5.2, 5.5, 5.8, 6.1, 6.4, 6.7, 7,
        7.3, 7.6, 7.9,
    ],
    physiqueArmor: [
        16, 19, 22, 25, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52,
        54,
    ],
    magicArmor: [
        24, 27, 30, 33, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60,
        62,
    ],

    scale: 1,
    svg: "flora.svg",
    png: "Flora.png",
    glb: "Flora.gltf",
};
