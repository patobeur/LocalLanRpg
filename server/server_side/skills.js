const skills = {
	0: {
		name: "Fire Ball",
		type: ["dot", "hit"],
		projectile_speed: 1.1,
		hitDistance: 10,
		damage: [1, 50, 70, 80, 90],
		manaCost: [10, 15, 30, 45, 60],
		cd: [2, 1.8, 1.6, 1.4, 1.3],
		target: "enemy",
		areaOfEffect: 1,
	},
	1: {
		name: "Fire Zone",
		type: ["area", "hit"],
		projectile_speed: 1.1,
		hitDistance: 5,
		damage: [1, 50, 70, 80, 90],
		manaCost: [10, 15, 30, 45, 60],
		cd: [2, 1.8, 1.6, 1.4, 1.3],
		target: "floor",
		areaOfEffect: 5,
	},
	2: {
		name: "Self Heal",
		type: ["hot", "heal"],
		projectile_speed: null,
		hitDistance: null,
		damage: [1, 50, 70, 80, 90],
		manaCost: [10, 15, 30, 45, 60],
		cd: [2, 1.8, 1.6, 1.4, 1.3],
		target: "self",
		areaOfEffect: null,
	},
	3: {
		name: "Self Heal Area",
		type: ["hot", "heal", "area"],
		projectile_speed: null,
		hitDistance: null,
		damage: [1, 50, 70, 80, 90], // consider it as heal
		manaCost: [10, 15, 30, 45, 60],
		cd: [2, 1.8, 1.6, 1.4, 1.3],
		target: "self",
		areaOfEffect: null,
	},
	4: {
		name: "Groupe Heal on Target",
		type: ["hot", "heal"],
		projectile_speed: 1,
		hitDistance: 10,
		damage: [1, 50, 70, 80, 90], // consider it as heal
		manaCost: [10, 15, 30, 45, 60],
		cd: [2, 1.8, 1.6, 1.4, 1.3],
		target: "target",
		areaOfEffect: 10,
	},
	5: {
		name: "Groupe Heal on Floor",
		type: ["heal"],
		projectile_speed: 0.8,
		hitDistance: 15,
		damage: [1, 50, 70, 80, 90], // consider it as heal
		manaCost: [10, 15, 30, 45, 60],
		cd: [2, 1.8, 1.6, 1.4, 1.3],
		target: "floor",
		areaOfEffect: 15,
	},

};

module.exports = skills;
