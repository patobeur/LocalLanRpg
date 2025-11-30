# Local LAN RPG

[FR](https://github.com/patobeur/LocalLanRpg/blob/main/README_FR.md) [US](https://github.com/patobeur/LocalLanRpg/blob/main/README.md)

Un mini-jeu de style MOBA conçu pour être joué sur un réseau local. Les joueurs peuvent créer des comptes, rejoindre des salles, sélectionner des personnages et participer à des batailles multijoueurs en temps réel.

## Table des matières

-  [Aperçu du projet](#aperçu-du-projet)
-  [Pile technologique](#pile-technologique)
-  [Démarrage](#démarrage)
   -  [Prérequis](#prérequis)
   -  [Installation](#installation)
   -  [Lancement de l'application](#lancement-de-lapplication)
-  [Structure du projet](#structure-du-projet)
-  [Comment jouer](#comment-jouer)

## Aperçu du projet

Ce projet est un jeu multijoueur en temps réel où les joueurs peuvent s'affronter dans des salles. Il dispose d'un backend Node.js avec un serveur Express pour gérer les requêtes HTTP et d'un serveur WebSocket pour la communication en temps réel. Le frontend est construit en JavaScript vanilla et utilise la bibliothèque three.js pour le rendu 3D du monde du jeu. Les données des utilisateurs sont stockées dans une base de données SQLite.

## Pile technologique

### Backend

-  **[Node.js](https://nodejs.org/)**: Environnement d'exécution JavaScript.
-  **[Express.js](https://expressjs.com/)**: Framework web pour Node.js, utilisé pour le serveur HTTP et l'API.
-  **[ws](https://github.com/websockets/ws)**: Bibliothèque WebSocket pour la communication en temps réel.
-  **[SQLite3](https://www.sqlite.org/index.html)**: Pour la base de données des utilisateurs.
-  **[bcrypt](https://www.npmjs.com/package/bcrypt)**: Pour le hachage des mots de passe.
-  **[express-session](https://www.npmjs.com/package/express-session)**: Pour la gestion des sessions utilisateur.

### Frontend

-  **HTML5, CSS3, JavaScript (ESM)**
-  **[three.js](https://threejs.org/)**: Bibliothèque graphique 3D pour le rendu du jeu.

## Démarrage

### Prérequis

-  [Node.js](https://nodejs.org/en/download/) (v14 ou ultérieure recommandée)
-  [npm](https://www.npmjs.com/get-npm) (fourni avec Node.js)

### Installation

1. **Clonez le dépôt :**

   ```bash
   git clone https://github.com/patobeur/LocalLanRpg.git
   cd LocalLanRpg
   ```

2. **Installez les dépendances :**
   Exécutez la commande suivante à la racine du projet pour installer tous les paquets nécessaires définis dans `package.json`.
   ```bash
   npm install
   ```

### Lancement de l'application

Une fois les dépendances installées, vous pouvez démarrer le serveur avec la commande suivante :

```bash
npm start
```

Le serveur démarrera sur le port 8080 par défaut. Vous pouvez accéder à l'application en ouvrant votre navigateur et en naviguant vers `http://localhost:8080`.

La console affichera des messages indiquant que les serveurs HTTP et WebSocket sont en cours d'exécution :

```
[HTTP] Serveur démarré sur http://0.0.0.0:8080
[WS] Serveur WebSocket prêt
Système de rooms activé
Connected to SQLite database.
Users table created or already exists.
```

## Structure du projet

```
.
├── public/              # Tous les actifs statiques du frontend
│   ├── js/              # Modules JavaScript du frontend
│   ├── media/           # Actifs du jeu (modèles, textures)
│   └── *.html, *.css    # Pages HTML et feuilles de style
├── server/              # Fichiers du serveur backend
│   ├── server/          # Modules principaux du serveur (config, routes, websocket)
│   ├── server_side/     # Logique spécifique au jeu (jeu, salles, personnages)
│   ├── data/            # Le fichier de la base de données SQLite est stocké ici
│   ├── authRoutes.js    # Routes Express pour l'authentification
│   ├── database.js      # Connexion à la base de données et configuration du modèle utilisateur
│   └── server.js        # Point d'entrée principal du serveur
├── .gitignore
├── package.json         # Dépendances et scripts du projet
└── README.md
```

## Comment jouer

1. **Démarrez le serveur :** Exécutez `npm start`.
2. **Ouvrez le jeu :** Accédez à `http://localhost:8080` dans votre navigateur web.
3. **Créez un compte :** Enregistrez un nouvel utilisateur.
4. **Lobby :** Après vous être connecté, vous serez redirigé vers le lobby où vous pourrez voir la liste des salles disponibles.
5. **Créez ou rejoignez une salle :** Vous pouvez créer votre propre salle ou en rejoindre une existante.
6. **Salle :** À l'intérieur de la salle, choisissez votre faction (Bleu ou Rouge), puis sélectionnez un personnage.
7. **Démarrer le jeu :** Le créateur de la salle peut démarrer le jeu une fois qu'au moins deux joueurs ont choisi un personnage.
8. **Jouer :** Vous serez redirigé vers la page du jeu pour jouer.

Sources des modèles Glb : https://poly.pizza/m/UyH95ZAeJ2
