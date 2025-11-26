
const characters = {
    names: ["Moumba", "Wiko", "Squazzzza", "Gromp", "Zephyr", "Ignis", "Flora", "Shadow"],
    types: ["tank", "dps", "support", "tank", "speedster", "mage", "healer", "assassin"],
    chars: {
        Moumba: {
            name: "Moumba",
            type: "tank",
            speed: 1,
            hitDistance: 5,
            autoAttackDamage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            autoAttackCd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill1Damage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill1Cd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill2Damage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill2Cd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill3Damage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill3Cd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            ultimatDamage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            ultimatCd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            health: 150,
            mana: 80,
            HealthRegeneration: 1.5,
            manaRegeneration: 1,
            physiqueArmor: 2,
            magicArmor: 1.5,
            svg: "moumba.svg",
        },
        Wiko: {
            name: "Wiko",
            type: "dps",
            speed: 1.1,
            hitDistance: 10,
            autoAttackDamage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            autoAttackCd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill1Damage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill1Cd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill2Damage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill2Cd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill3Damage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill3Cd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            ultimatDamage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            ultimatCd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            health: 90,
            mana: 110,
            HealthRegeneration: 1.1,
            manaRegeneration: 1,
            physiqueArmor: 1.2,
            magicArmor: 1.2,
            svg: "wiko.svg",
        },
        Squazzzza: {
            name: "Squazzzza",
            type: "support",
            speed: 1,
            hitDistance: 10,
            autoAttackDamage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            autoAttackCd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill1Damage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill1Cd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill2Damage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill2Cd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill3Damage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill3Cd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            ultimatDamage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            ultimatCd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            health: 110,
            mana: 130,
            HealthRegeneration: 1.1,
            manaRegeneration: 1,
            physiqueArmor: 1.5,
            magicAttack: 2,
            svg: "squazzzza.svg",
        },
        Gromp: {
            name: "Gromp",
            type: "tank",
            speed: 0.8,
            hitDistance: 6,
            autoAttackDamage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            autoAttackCd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill1Damage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill1Cd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill2Damage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill2Cd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill3Damage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill3Cd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            ultimatDamage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            ultimatCd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            health: 200,
            mana: 50,
            HealthRegeneration: 2.0,
            manaRegeneration: 0.5,
            physiqueArmor: 3,
            magicArmor: 1,
            svg: "gromp.svg",
        },
        Zephyr: {
            name: "Zephyr",
            type: "speedster",
            speed: 1.5,
            hitDistance: 10,
            autoAttackDamage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            autoAttackCd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill1Damage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill1Cd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill2Damage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill2Cd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill3Damage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill3Cd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            ultimatDamage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            ultimatCd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            health: 80,
            mana: 100,
            HealthRegeneration: 1.0,
            manaRegeneration: 1.5,
            physiqueArmor: 0.8,
            magicArmor: 0.8,
            svg: "zephyr.svg",
        },
        Ignis: {
            name: "Ignis",
            type: "mage",
            speed: 1.0,
            hitDistance: 10,
            autoAttackDamage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            autoAttackCd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill1Damage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill1Cd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill2Damage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill2Cd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill3Damage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill3Cd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            ultimatDamage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            ultimatCd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            health: 90,
            mana: 200,
            HealthRegeneration: 0.8,
            manaRegeneration: 2.5,
            physiqueArmor: 0.5,
            magicArmor: 2,
            svg: "ignis.svg",
        },
        Flora: {
            name: "Flora",
            type: "healer",
            speed: 1.1,
            hitDistance: 8,
            autoAttackDamage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            autoAttackCd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill1Damage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill1Cd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill2Damage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill2Cd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill3Damage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill3Cd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            ultimatDamage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            ultimatCd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            health: 100,
            mana: 150,
            HealthRegeneration: 1.2,
            manaRegeneration: 2.0,
            physiqueArmor: 1,
            magicArmor: 1.5,
            svg: "flora.svg",
        },
        Shadow: {
            name: "Shadow",
            type: "assassin",
            speed: 1.3,
            hitDistance: 6,
            autoAttackDamage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            autoAttackCd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill1Damage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill1Cd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill2Damage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill2Cd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill3Damage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            skill3Cd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            ultimatDamage: [40, 50, 70, 80, 90], // [skill lv1, lv2, lv3, lv4, lv5 ]
            ultimatCd: [2, 1.8, 1.6, 1.4, 1.3], // [skill lv1, lv2, lv3, lv4, lv5 ]
            health: 85,
            mana: 90,
            HealthRegeneration: 1.0,
            manaRegeneration: 1.0,
            physiqueArmor: 1,
            magicArmor: 1,
            svg: "shadow.svg",
        },
    },
};

module.exports = characters;