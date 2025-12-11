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
		Moonba: {
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
		},
		Wiko: {
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
		},
		Squazzzza: {
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
		},
		Gromp: {
			name: "Gromp",
			type: "tank",
			description_rapide: "Un tank effrayant qui fonce dans le tas.",
			commentaire:
				"Gromp est un mur de points de vie. Sa force réside dans sa capacité à survivre longtemps grâce à sa santé massive et sa régénération. Il est idéal pour absorber les dégâts et perturber les lignes ennemies. Ses dégâts sont faibles, mais sa présence est intimidante.",
			speed: [
				3.5, 3.6, 3.7, 3.8, 3.9, 4, 4.1, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2,
			], // [skill lv1, lv2, ..., lv18 ]

			hitDistance: [5, 6, 7, 8, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
			autoAttackDamage: [
				35, 42, 49, 56, 63, 66, 69, 72, 75, 78, 81, 84, 87, 90, 93, 96, 99,
				102,
			],
			autoAttackCd: [
				2.1, 2, 1.9, 1.8, 1.7, 1.7, 1.7, 1.7, 1.7, 1.7, 1.7, 1.7, 1.7, 1.7,
				1.7, 1.7, 1.7, 1.7,
			],

			skill1Id: 0,
			skill2Id: 1,
			skill3Id: 2,
			ultimatId: 3,

			health: [
				220, 300, 380, 460, 540, 580, 620, 660, 700, 740, 780, 820, 860,
				900, 940, 980, 1020, 1060,
			],
			mana: [
				60, 80, 100, 120, 140, 140, 140, 140, 140, 140, 140, 140, 140, 140,
				140, 140, 140, 140,
			],
			HealthRegeneration: [
				2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10,
				10.5, 11,
			],
			manaRegeneration: [
				0.8, 1.2, 1.6, 2, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3, 3.1, 3.2, 3.3,
				3.4, 3.5, 3.6, 3.7,
			],
			physiqueArmor: [
				25, 30, 35, 40, 45, 48, 51, 54, 57, 60, 63, 66, 69, 72, 75, 78, 81,
				84,
			],
			magicArmor: [
				25, 30, 35, 40, 45, 48, 51, 54, 57, 60, 63, 66, 69, 72, 75, 78, 81,
				84,
			],

			scale: 1,
			svg: "gromp.svg",
			png: "Gromp.png",
			gltf: "Gromp.gltf",
		},
		Zephyr: {
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
		},
		Flora: {
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
		},
		Shadow: {
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
		},
	},
};

module.exports = characters;
