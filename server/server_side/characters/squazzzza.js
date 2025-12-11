module.exports = {
    name: "Squazzzza",
    type: "support",
    description_rapide:
        "Un support qui entrave les ennemis et aide ses alliés.",
    commentaire:
        "Squazzzza est un support polyvalent qui peut contrôler les ennemis et aider ses alliés avec des buffs. Il n'est pas fait pour le combat direct, mais sa grande réserve de mana lui permet d'utiliser ses compétences fréquemment.",
    speed: [
        3.5, 3.6, 3.7, 3.8, 3.9, 4, 4.1, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2,
    ], // [skill lv1, lv2, ..., lv18 ]

    hitDistance: [5, 6, 7, 8, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
    autoAttackDamage: [
        25, 30, 35, 40, 45, 48, 51, 54, 57, 60, 63, 66, 69, 72, 75, 78, 81,
        84,
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
        140, 180, 220, 260, 300, 320, 340, 360, 380, 400, 420, 440, 460,
        480, 500, 520, 540, 560,
    ],
    mana: [
        100, 130, 160, 190, 220, 240, 260, 280, 300, 320, 340, 360, 380,
        400, 420, 440, 460, 480,
    ],
    HealthRegeneration: [
        1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.4, 2.6, 2.8, 3, 3.2, 3.4, 3.6, 3.8, 4,
        4.2, 4.4, 4.6,
    ],
    manaRegeneration: [
        1.5, 2, 2.5, 3, 3.5, 3.8, 4.1, 4.4, 4.7, 5, 5.3, 5.6, 5.9, 6.2, 6.5,
        6.8, 7.1, 7.4,
    ],
    physiqueArmor: [
        18, 21, 24, 27, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54,
        56,
    ],
    magicArmor: [
        22, 25, 28, 31, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58,
        60,
    ],

    scale: 1,
    svg: "squazzzza.svg",
    png: "Squazzzza.png",
    gltf: "Squazzzza.gltf",
};
