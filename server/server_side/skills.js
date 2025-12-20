const skills = {
	0: {
		name: "Fire Ball",
		type: ["dot", "hit"],
		projectile_speed: 1.1,
		hitDistance: 10,
		damage: [1, 50, 70, 80, 90],
		manaCost: [10, 15, 30, 45, 60],
		cd: [11, 10, 9, 8, 8],
		target: "enemy",
		areaOfEffect: 1,
		duration: 0,
		description:
			"une bulle rouge est lancé sur l'enemie visé. la bulle grandit et inflige des dommages au contact et pendant 2sec les degats sont repété chaque seconde",
		visuellement:
			"une petite sphère rouge/orange de rayon 0.15 part du joueur vers la cible à vitesse [projectile_speed]. à l'impact, elle gonfle en 0.2 sec jusqu'à un rayon [areaOfEffect/2] puis pulse 2 fois (toutes les 1 sec) avec une lueur rouge avant de disparaître.",
	},
	1: {
		name: "Fire Zone",
		type: ["area", "hit"],
		projectile_speed: 1.1,
		hitDistance: 5,
		damage: [1, 50, 70, 80, 90],
		manaCost: [10, 15, 30, 45, 60],
		cd: [11, 10, 9, 8, 8],
		target: "floor",
		areaOfEffect: 5,
		duration: 5,
		description:
			"une zone rouge est lancé sur le sol. la zone dure [duration] sec et inflige des dommages au contact",
		visuellement:
			"un disque rouge incandescent apparait au sol au point cliqué, rayon [areaOfEffect/2], avec des flammes basses sur le bord. le disque 's'allume' en 0.15 sec, reste visible [duration] sec, puis s'éteint en 0.2 sec en laissant quelques braises pendant 1s.",
	},
	2: {
		name: "Self Heal",
		type: ["hot", "heal"],
		projectile_speed: null,
		hitDistance: null,
		damage: [100, 150, 200, 250, 300], // consider it as heal
		manaCost: [10, 14, 20, 28, 38],
		cd: [11, 10, 9, 8, 8],
		target: "self",
		areaOfEffect: null,
		duration: 0,
		description:
			"une bulle verte semi transparente apparait autour du joueur pendant 1sec et soigne le lanceur",
		visuellement:
			"une sphère verte semi-transparente (rayon 0.8) se forme autour du joueur en 0.1 sec, scintille avec des particules montantes, puis se dissipe en 0.25 sec après 1 sec.",
	},
	3: {
		name: "Self Heal Area",
		type: ["hot", "heal", "area"],
		projectile_speed: null,
		hitDistance: null,
		damage: [100, 150, 200, 250, 300], // consider it as heal
		manaCost: [10, 15, 30, 45, 60],
		cd: [11, 10, 9, 8, 8],
		target: "self",
		areaOfEffect: null,
		duration: 0,
		description:
			"des petites billes verte pleuvent sur le lanceur pendant 1sec et le soigne",
		visuellement:
			"au-dessus du joueur, des petites billes vertes lumineuses (rayon 0.06) tombent en pluie pendant 1 sec sur une zone de rayon 1.2 autour de lui, puis disparaissent au contact du sol avec un petit flash vert.",
	},
	4: {
		name: "Groupe Heal on Target",
		type: ["hot", "heal"],
		projectile_speed: 1,
		hitDistance: 10,
		damage: [100, 150, 200, 250, 300], // consider it as heal
		manaCost: [10, 15, 30, 45, 60],
		cd: [11, 10, 9, 8, 8],
		target: "target",
		areaOfEffect: 10,
		duration: 5,
		description:
			"des petites billes verte pleuvent sur le joueur ciblé pendant 2sec et soigne les joueurs de la meme faction dans la zone, la pluie de billes suis le joueur ciblé pendant [duration] sec",
		visuellement:
			"un nuage vert doux (hauteur 2) suit la cible pendant [duration] sec. une pluie de billes vertes tombe en continu sur un disque au sol de rayon [areaOfEffect/2]. à la fin, le nuage se dissout en 0.3 sec.",
	},
	5: {
		name: "Groupe Heal on Floor",
		type: ["heal"],
		projectile_speed: 0.8,
		hitDistance: 15,
		damage: [100, 150, 200, 250, 300], // consider it as heal
		manaCost: [10, 15, 30, 45, 60],
		cd: [11, 10, 9, 8, 8],
		target: "floor",
		areaOfEffect: 15,
		duration: 5,
		description:
			"une bulle verte semi transparente apparait au sol a l'endroit du joueur ciblé pendant [duration] sec et soigne les joueurs de la meme faction dans la zone",
		visuellement:
			"un dôme vert semi-transparent sort du sol en 0.2 sec au point ciblé, couvrant un rayon [areaOfEffect/2]. il ondule légèrement (effet 'respiration') pendant [duration] sec puis se rétracte en 0.25 sec.",
	},
	6: {
		name: "Pics de glace",
		type: ["hit", "cc"],
		projectile_speed: 1.2,
		hitDistance: 12,
		damage: [1, 40, 60, 75, 90],
		manaCost: [8, 12, 20, 30, 40],
		cd: [11, 10, 9, 8, 8],
		target: "enemy",
		areaOfEffect: 1,
		duration: 2,
		description:
			"un pic de glace jaillit sous l'ennemi. inflige des degats et ralentit la cible pendant [duration] sec",
		visuellement:
			"un pic de glace bleu clair semi transparant jaillit du sol sous la cible en 0.08 sec (hauteur 2). un anneau de givre se dessine au sol (rayon [areaOfEffect/2]) puis une fine brume froide entoure les pieds de la cible pendant [duration] sec.",
	},
	7: {
		name: "Chaine d'éclairs",
		type: ["hit", "area"],
		projectile_speed: 1.6,
		hitDistance: 14,
		damage: [1, 35, 55, 70, 85],
		manaCost: [12, 18, 28, 40, 52],
		cd: [11, 10, 9, 8, 8],
		target: "enemy",
		areaOfEffect: 4,
		duration: 0,
		description:
			"un eclair frappe l'ennemi visé puis rebondit sur d'autres ennemis proches dans un rayon de [areaOfEffect]",
		visuellement:
			"un éclair bleu frappe la cible (flash très bref), puis des arcs électriques sautent vers 2-4 ennemis proches dans le rayon [areaOfEffect]. chaque saut laisse une traînée lumineuse qui s'efface en 0.12 sec.",
	},
	8: {
		name: "Dague traitre",
		type: ["hit", "dot"],
		projectile_speed: 1.4,
		hitDistance: 10,
		damage: [1, 25, 40, 55, 70],
		manaCost: [6, 9, 14, 20, 28],
		cd: [11, 10, 9, 8, 8],
		target: "enemy",
		areaOfEffect: 1,
		duration: 4,
		description:
			"une dague d'ombre frappe la cible et applique un saignement d'ombre pendant [duration] sec (degats chaque seconde)",
		visuellement:
			"un projectile violet sombre apparait en 'slash' sur la cible (arc rapide) puis un symbole d'ombre flotte au-dessus de sa tête. toutes les 1 sec pendant [duration] sec, un petit pulse violet sort de la cible.",
	},
	9: {
		name: "Flêche Empoisonée",
		type: ["hit", "dot"],
		projectile_speed: 1.8,
		hitDistance: 16,
		damage: [1, 20, 32, 45, 60],
		manaCost: [7, 10, 16, 23, 32],
		cd: [11, 10, 9, 8, 8],
		target: "enemy",
		areaOfEffect: 1,
		duration: 6,
		description:
			"un trait empoisonné touche l'ennemi et inflige des degats sur la durée pendant [duration] sec",
		visuellement:
			"un projectile vert (type flèche/trait) traverse l'air avec une traînée toxique. à l'impact, une petite éclaboussure verte se répand. ensuite un nuage verdâtre léger sort de la cible en petites bouffées pendant [duration] sec.",
	},
	10: {
		name: "Vortex de vent",
		type: ["area", "dot", "cc"],
		projectile_speed: 1.0,
		hitDistance: 8,
		damage: [1, 10, 15, 20, 25],
		manaCost: [14, 20, 30, 42, 55],
		cd: [11, 10, 9, 8, 8],
		target: "floor",
		areaOfEffect: 6,
		duration: 3,
		description:
			"un vortex de vent apparait au sol, attire légèrement les ennemis vers le centre et inflige de petits degats chaque seconde pendant [duration] sec",
		visuellement:
			"un tourbillon de vent translucide (cône inversé) se forme au sol, rayon [areaOfEffect/2] et hauteur 3. des feuilles/poussières tournent autour. le vortex tourne pendant [duration] sec puis se 'dévisse' en 0.2 sec.",
	},
	11: {
		name: "Protection arcanique",
		type: ["shield", "buff"],
		projectile_speed: null,
		hitDistance: null,
		damage: [50, 80, 110, 140, 180], // consider it as shield amount
		manaCost: [12, 16, 22, 30, 40],
		cd: [11, 10, 9, 8, 8],
		target: "self",
		areaOfEffect: null,
		duration: 5,
		description:
			"un bouclier violet entoure le joueur et absorbe les prochains degats (valeur selon le niveau) pendant [duration] sec",
		visuellement:
			"un tourbillon de vent translucide (cône inversé) se forme au sol, rayon [areaOfEffect/2] et hauteur 3. des feuilles/poussières tournent autour. le vortex tourne pendant [duration] sec puis se 'dévisse' en 0.2 sec.",
	},
	12: {
		name: "Arret du temps",
		type: ["cc", "area"],
		projectile_speed: 0.9,
		hitDistance: 9,
		damage: [0, 0, 0, 0, 0], // no damage
		manaCost: [25, 30, 40, 55, 70],
		cd: [11, 10, 9, 8, 8],
		target: "floor",
		areaOfEffect: 4,
		duration: 1.5,
		description:
			"une onde temporelle fige les ennemis dans la zone pendant [duration] sec",
		visuellement:
			"au point ciblé, un cercle violet/bleu (rayon [areaOfEffect/2]) se déploie en 0.12 sec comme une vague. pendant [duration] sec, un effet 'cristallisé' léger recouvre les ennemis (teinte bleutée + particules suspendues), puis tout se relâche d'un coup (petit flash).",
	},
	13: {
		name: "Météorite",
		type: ["mobility", "hit", "area"],
		projectile_speed: 2.0,
		hitDistance: 7,
		damage: [1, 45, 65, 80, 95],
		manaCost: [18, 22, 30, 40, 55],
		cd: [11, 10, 9, 8, 8],
		target: "floor",
		areaOfEffect: 3,
		duration: 0,
		description:
			"le joueur fonce vers un point ciblé et impacte en zone à l'arrivée, infligeant des degats aux ennemis proches",
		visuellement:
			"le joueur laisse une traînée orange/rouge pendant le dash vers le point ciblé. à l'arrivée, un impact circulaire (rayon [areaOfEffect/2]) explose avec des fragments de roche incandescents et une onde de choc au sol qui s'efface en 0.2 sec.",
	},
	14: {
		name: "Soins Sacrés",
		type: ["heal", "hot", "area"],
		projectile_speed: 1.0,
		hitDistance: 15,
		damage: [60, 90, 120, 150, 190], // consider it as heal per tick
		manaCost: [16, 20, 28, 38, 50],
		cd: [11, 10, 9, 8, 8],
		target: "floor",
		areaOfEffect: 8,
		duration: 6,
		description:
			"une colonne de lumiere vient frapper le sol a l'endroit cliquer par le joueur soigne les alliés dans la zone chaque seconde pendant [duration] sec",
		visuellement:
			"un cylindre blanc de rayon [areaOfEffect/2], 2/3 transparent et assez grand descend du ciel et se pose au sol en 0.1 sec et disparait apres [duration -0.1]sec.",
	},
};

module.exports = skills;
