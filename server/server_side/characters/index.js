const characters = {
    names: [
        "Moonba",
        "Wiko",
        "Squazzzza",
        "Gromp",
        "Zephyr",
        // "wizard",
        "Flora",
        "Shadow",
        // "ChefRipley",
    ],
    types: [
        "tank",
        "dps",
        "support",
        "tank",
        "speedster",
        "mage",
        "healer",
        "assassin",
    ],
    xpNeededPerLv: [
        0, 1000, 3000, 6000, 10000, 15000, 21000, 28000, 36000, 45000, 55000,
        66000, 78000, 91000, 105000, 120000, 136000, 153000,
    ],
    xpRewardedPerLv: [
        100, 400, 900, 1600, 2500, 3600, 4900, 6400, 8100, 10000, 12100, 14400,
        16900, 19600, 22500, 25600, 28900, 32400,
    ],
    chars: {
        Moonba: require("./moonba"),
        Wiko: require("./wiko"),
        Squazzzza: require("./squazzzza"),
        Gromp: require("./gromp"),
        Zephyr: require("./zephyr"),
        Flora: require("./flora"),
        Shadow: require("./shadow"),
    },
};

module.exports = characters;
