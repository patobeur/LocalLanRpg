module.exports = {
	name: "Torp",
	type: "tank",
	description_rapide: "Un tank effrayant qui fonce dans le tas.",
	commentaire:
		"Torp est un mur de pierre. Sa force réside dans sa capacité à survivre longtemps grâce à son armure et sa régénération.",
	speed: [
		3.5, 3.6, 3.7, 3.8, 3.9, 4, 4.1, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2,
		4.2, 4.2, 4.2,
	], // [skill lv1, lv2, ..., lv18 ]

	hitDistance: [5, 6, 7, 8, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
	autoAttackDamage: [
		35, 42, 49, 56, 63, 66, 69, 72, 75, 78, 81, 84, 87, 90, 93, 96, 99, 102,
	],
	autoAttackCd: [
		2.1, 2, 1.9, 1.8, 1.7, 1.7, 1.7, 1.7, 1.7, 1.7, 1.7, 1.7, 1.7, 1.7, 1.7,
		1.7, 1.7, 1.7,
	],

	skill1Id: 0,
	skill2Id: 1,
	skill3Id: 2,
	ultimatId: 3,

	health: [
		220, 300, 380, 460, 540, 580, 620, 660, 700, 740, 780, 820, 860, 900, 940,
		980, 1020, 1060,
	],
	mana: [
		60, 80, 100, 120, 140, 140, 140, 140, 140, 140, 140, 140, 140, 140, 140,
		140, 140, 140,
	],
	HealthRegeneration: [
		2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11,
	],
	manaRegeneration: [
		0.8, 1.2, 1.6, 2, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3, 3.1, 3.2, 3.3, 3.4,
		3.5, 3.6, 3.7,
	],
	physiqueArmor: [
		25, 30, 35, 40, 45, 48, 51, 54, 57, 60, 63, 66, 69, 72, 75, 78, 81, 84,
	],
	magicArmor: [
		25, 30, 35, 40, 45, 48, 51, 54, 57, 60, 63, 66, 69, 72, 75, 78, 81, 84,
	],

	scale: 1.5,
	svg: "Torp.svg",
	png: "Torp.png",
	glb: "Torp.fbx",
	animations: {
		walk_path: "glb/animations/Torp_Walk.fbx",
		autoattack_path: "glb/animations/Torp_AutoAttack.fbx",
		dying_path: "glb/animations/Torp_Dying.fbx",
	},
};
