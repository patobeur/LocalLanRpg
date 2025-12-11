module.exports = {
    name: "Shadow",
    type: "assassin",
    description_rapide: "Un assassin furtif qui frappe depuis l'ombre.",
    commentaire:
        "Shadow est un assassin spécialisé dans l'élimination de cibles uniques. Ses dégâts élevés et sa cadence de tir rapide lui permettent de tuer rapidement, mais il est extrêmement fragile. Il doit choisir ses combats avec soin et frapper au bon moment.",
    speed: [
        3.5, 3.6, 3.7, 3.8, 3.9, 4, 4.1, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2,
    ], // [skill lv1, lv2, ..., lv18 ]

    hitDistance: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    autoAttackDamage: [
        60, 70, 80, 90, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145,
        150, 155, 160, 165,
    ],
    autoAttackCd: [
        1.6, 1.5, 1.4, 1.3, 1.2, 1.15, 1.1, 1.05, 1, 0.95, 0.9, 0.85, 0.8,
        0.75, 0.7, 0.65, 0.6, 0.55,
    ],

    skill1Id: 0,
    skill2Id: 1,
    skill3Id: 2,
    ultimatId: 3,

    health: [
        110, 145, 180, 215, 250, 270, 290, 310, 330, 350, 370, 390, 410,
        430, 450, 470, 490, 510,
    ],
    mana: [
        85, 105, 125, 145, 165, 175, 185, 195, 205, 215, 225, 235, 245, 255,
        265, 275, 285, 295,
    ],
    HealthRegeneration: [
        1, 1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.4, 2.6, 2.8, 3, 3.2, 3.4, 3.6, 3.8,
        4, 4.2, 4.4,
    ],
    manaRegeneration: [
        1.3, 1.8, 2.3, 2.8, 3.3, 3.5, 3.7, 3.9, 4.1, 4.3, 4.5, 4.7, 4.9,
        5.1, 5.3, 5.5, 5.7, 5.9,
    ],
    physiqueArmor: [
        8, 11, 14, 17, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44,
        46,
    ],
    magicArmor: [
        8, 11, 14, 17, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44,
        46,
    ],

    scale: 1,
    // svg: "shadow.svg",
    png: "Shadow.png",
    glb: "Shadow.gltf",
};
