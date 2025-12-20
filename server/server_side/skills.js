const skills = {
	0: {
		name: "Blood Ball",
		type: ["hit", "dot"],
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
		visual_planning:
			"3D Object: SphereGeometry(0.2) + MeshStandardMaterial(emissive: red, intensity: 2). Scene: Projectile moves linear. Impact: Spawn ParticleSystem(20 red particles, explosion). Spawn Sphere(radius 0.8, opacity 0.4) that scales 0.8->1.0->0.8 loop for 2s then fades.",
	},
	1: {
		name: "Fire Zone",
		type: ["area", "dot"],
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
			"Un cercle rituel rougeoyant (r=[areaOfEffect/2]) se dessine au sol avec des runes lumineuses. Des flammes stylisées (cônes orangés/rouges) s'élèvent périodiquement du cercle. L'intensité lumineuse fluctue comme une respiration ardente.",
		visual_planning:
			"3D Object: CircleGeometry(radius 2.5) flat on ground, Texture(Runes, Red). 5-10 ConeGeometries (Orange/Red) scattered. Scene: Circle fades in (0.5s). Cones scaleY 0->1 randomly loop. Circle opacity oscillates. End: Cones scaleY->0, Circle fadeOut.",
	},
	2: {
		name: "Self Heal",
		type: ["heal", "buff"],
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
			"Une aura sphérique émeraude (r=1) enveloppe le joueur. Des croix de vie flottantes et des particules lumineuses montent en spirale autour de lui. L'aura brille intensément lors du soin initial puis s'estompe.",
		visual_planning:
			"3D Object: SphereGeometry(1) attached to player, Material(Green, Transparent, Opacity 0.3, Side: Double). Particles: 'Plus' shape sprites moving Up+RotateY. Scene: Sphere scale 0->1 elastic. Opacity pulse 0.3->0.6->0. Particles emit for 1s. Fade out.",
	},
	3: {
		name: "Self Heal Area",
		type: ["heal", "hot", "area"],
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
			"Un petit nuage éthéré se forme au-dessus du joueur. Une pluie fine de sphères lumineuses (r=0.05) tombe en cascade dorée/verte, créant de petites ondulations au sol à l'impact.",
		visual_planning:
			"3D Object: InstancedMesh of tiny Spheres(0.05). Emitter box 2m above player. Scene: 'Rain' animation (Y position decrease). When Y < 0, reset top. Add RingGeometry(0.1) on ground at impact point expanding/fading. Duration 1s.",
	},
	4: {
		name: "Groupe Heal on Target",
		type: ["heal", "hot", "area"],
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
			"Un halo angélique (anneau doré flottant) suit la cible. Des rayons de lumière douce descendent du halo, accompagnés de plumes ou particules blanches/vertes qui soignent les alliés touchés.",
		visual_planning:
			"3D Object: TorusGeometry(radius 0.5, tube 0.05, Gold) attached to Target.Head + y=0.5. Cylinder(height 3, radius 5, transparent, opacity 0.1) below. Scene: Halo spins slowly Y. Particles (feathers/leaves) fall inside cylinder volume. Beam alpha pulse.",
	},
	5: {
		name: "Groupe Heal on Floor",
		type: ["heal", "hot", "area"],
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
			"Un jardin spectral pousse instantanément au sol (cercle vert tendre r=[areaOfEffect/2]). Des fleurs de lumière s'ouvrent et libèrent du pollen curatif (particules brillantes) qui flotte dans la zone.",
		visual_planning:
			"3D Object: CircleGeometry(7.5, Green Texture). 10-20 PlaneGeometries (Flower sprites) billboarded. Scene: Circle expands 0->7.5. Flowers scale 0->1 with varying delay. Emitter: Sparkles floating up. End: Flowers scale -> 0, Circle fade.",
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
			"Le sol gèle (texture bleu givre) sous la cible. Soudain, une stalagmite de cristal bleu acéré (h=2) transperce le sol. Des éclats de glace volent à l'impact. La cible laisse des empreintes gelées.",
		visual_planning:
			"3D Object: ConeGeometry(radius 0.4, height 2, 4 segments) for Spike. Material(Ice/Blue, High Specular). Circle (Frost texture) on ground. Scene: Frost appears. Spike scales Y 0.1->2 in 0.08s (Snap). Particle burst (Triangles) at base. Spike melts (ScaleY -> 0) after 2s.",
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
			"Un éclair bleu électrique zigzague violemment depuis le lanceur vers la cible. De la cible, des arcs secondaires plus fins jaillissent pour frapper les ennemis proches, créant un réseau électrique crépitant.",
		visual_planning:
			"3D Object: Custom BufferGeometry (LineSegments). Logic: Calculate points between Source->Target with random offsets perpendicular to dir. Update vertices every frame (jitter). Scene: Render Main Bolt (thick). Render Bounce Bolts (thinner). Add PointLight(Blue, high intensity, decay 2) at hits.",
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
			"Une lame fantomatique violette/noire file dans l'air, laissant une traînée de fumée sombre. À l'impact, elle se plante dans la cible et se dissout en fumée toxique qui s'accroche à la victime.",
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
			"Une flèche suintant un liquide vert néon. Elle laisse une traînée de bulles toxiques en vol. À l'impact, une éclaboussure d'acide vert couvre la cible, avec un effet de vapeur corrosive s'élevant d'elle.",
		visual_planning:
			"3D Object: Cylinder (Thin, Green). Trail(Green bubbles). Scene: Linear shot. Hit: Splash Effect (Green droplets). Target Effect: Emitter attached to target chest releasing green semi-transparent clouds for 6s.",
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
			"Une tornade stylisée (translucide gris/blanc) se forme. Des lignes de vent tourbillonnent rapidement autour du centre. Des débris (feuilles, poussière) sont aspirés en spirale vers l'intérieur.",
		visual_planning:
			"3D Object: Cone(RadiusTop 2, RadiusBottom 0.5, Height 3, OpenEnded, Material: Grey Transparent, Side: Double). Scene: Rotate Y fast. Scale Y 0->1. Particles: Orbiting the cone axis with centripetal force. Duration 3s then scale down.",
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
			"Un champ de force géométrique (hexagones violets brillants) se matérialise sphériquement autour du joueur. Il pulse lentement et brille plus fort lorsqu'il absorbe des dégâts.",
		visual_planning:
			"3D Object: IcosahedronGeometry(radius 1, detail 1). Material(Wireframe or Hex Texture, Violet, AdditiveBlending). Scene: Parent to Player. Scale 0->1. Rotate slow X/Y. Pulse intensity 1->2->1. Duration 5s.",
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
			"Une énorme horloge dorée éthérée apparaît au sol. Ses aiguilles tournent follement puis se figent brusquement avec un son de cloche grave. Toute la zone passe en niveaux de gris/sépia pendant la durée.",
		visual_planning:
			"3D Object: Circle (Clock Face Texture Gold). Box (Hands). Scene: Face appears on ground. Hands rotate speed 10->0. When stop, create large Sphere(radius 2, Sepia color, Opacity 0.2, ReverseSide) to tint area. Flash white on stop.",
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
			"Le joueur s'enflamme et devient une comète humaine, laissant une traînée de feu et de fumée noire. L'atterrissage provoque un cratère visuel (fissures orange magma au sol) et une onde de choc explosive.",
		visual_planning:
			"3D Object: Fire Particles attached to Player. Scene: Player moves Parabolic to target (Jump). Land: Spawn Plane(Crater Texture, Magma). Spawn Torus(Shockwave) expanding radius 0->2 and MeshExplosion (Rock chunks).",
	},
	14: {
		name: "Soins Sacrés",
		type: ["heal", "hot", "area"],
		projectile_speed: 1.0,
		hitDistance: 15,
		damage: [120, 90, 120, 150, 190], // consider it as heal per tick
		manaCost: [16, 20, 28, 38, 50],
		cd: [11, 10, 9, 8, 8],
		target: "floor",
		areaOfEffect: 8,
		duration: 6,
		description:
			"une colonne de lumiere vient frapper le sol a l'endroit cliquer par le joueur soigne les alliés dans la zone chaque seconde pendant [duration] sec",
		visuellement:
			"Un pilier de lumière divine massive descend des cieux, illuminant la zone au sol. Des symboles sacrés tournent lentement à la base du pilier. L'ambiance lumineuse locale est augmentée.",
		visual_planning:
			"3D Object: Cylinder(Radius 4, Height 20, White/Yellow, Transparent, Opacity 0.3, NoCaps, Side:Double). Ring(Ground symbol) rotating. Scene: Alpha FadeIn 0.5s. Sparkles rising within cylinder. Duration 6s. FadeOut.",
	},
};

module.exports = skills;
