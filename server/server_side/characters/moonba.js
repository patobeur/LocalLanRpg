module.exports = {
    name: "Moonba",
    type: "tank",
    description_rapide: "Un tank robuste qui protège ses alliés.",
    commentaire:
        "Moonba est un tank traditionnel. Il excelle à encaisser les dégâts pour son équipe grâce à ses points de vie et armures élevés. Son rôle est d'être en première ligne pour protéger les alliés plus fragiles. En contrepartie, ses dégâts sont faibles et il est assez lent.",
    speed: [
        3.5, 3.6, 3.7, 3.8, 3.9, 4, 4.1, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2,
    ], // [skill lv1, lv2, ..., lv18 ]

    hitDistance: [5, 6, 7, 8, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
    autoAttackDamage: [
        30, 40, 50, 60, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70,
        70,
    ],
    autoAttackCd: [
        2, 1.8, 1.6, 1.4, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3,
        1.3, 1.3, 1.3, 1.3,
    ],

    skill1Id: 0,
    skill2Id: 1,
    skill3Id: 2,
    ultimatId: 3,

    health: [
        200, 280, 360, 440, 520, 550, 580, 610, 640, 670, 700, 730, 760,
        790, 820, 850, 880, 910,
    ],
    mana: [
        80, 100, 120, 140, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160,
        160, 160, 160, 160,
    ],
    HealthRegeneration: [
        2, 2.5, 3, 3.5, 4, 4.2, 4.4, 4.6, 4.8, 5, 5.2, 5.4, 5.6, 5.8, 6,
        6.2, 6.4, 6.6,
    ],
    manaRegeneration: [
        1, 1.5, 2, 2.5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
    ],
    physiqueArmor: [
        30, 35, 40, 45, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74,
        76,
    ],
    magicArmor: [
        30, 35, 40, 45, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74,
        76,
    ],

    scale: 1,
    svg: "Moonba.svg",
    png: "Moonba.png",
    glb: "Moonba.gltf",
};
