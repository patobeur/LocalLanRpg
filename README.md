# Local LAN RPG

A mini MOBA-style game designed to be played over a local network. Players can create accounts, join rooms, select characters, and engage in real-time multiplayer battles.

## Table of Contents

-  [Project Overview](#project-overview)
-  [Technology Stack](#technology-stack)
-  [Getting Started](#getting-started)
   -  [Prerequisites](#prerequisites)
   -  [Installation](#installation)
   -  [Running the Application](#running-the-application)
-  [Project Structure](#project-structure)
-  [How to Play](#how-to-play)

## Project Overview

This project is a real-time multiplayer game where players can battle each other in rooms. It features a Node.js backend with an Express server for handling HTTP requests and a WebSocket server for real-time communication. The frontend is built with vanilla JavaScript and uses the three.js library for 3D rendering of the game world. User data is stored in a SQLite database.

## Technology Stack

### Backend

-  **[Node.js](https://nodejs.org/)**: JavaScript runtime environment.
-  **[Express.js](https://expressjs.com/)**: Web framework for Node.js, used for the HTTP server and API.
-  **[ws](https://github.com/websockets/ws)**: WebSocket library for real-time communication.
-  **[SQLite3](https://www.sqlite.org/index.html)**: For the user database.
-  **[bcrypt](https://www.npmjs.com/package/bcrypt)**: For hashing passwords.
-  **[express-session](https://www.npmjs.com/package/express-session)**: For managing user sessions.

### Frontend

-  **HTML5, CSS3, JavaScript (ESM)**
-  **[three.js](https://threejs.org/)**: 3D graphics library for rendering the game.

## Getting Started

### Prerequisites

-  [Node.js](https://nodejs.org/en/download/) (v14 or later recommended)
-  [npm](https://www.npmjs.com/get-npm) (comes with Node.js)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/patobeur/LocalLanRpg.git
   cd LocalLanRpg
   ```

2. **Install dependencies:**
   Run the following command in the root directory of the project to install all the necessary packages defined in `package.json`.
   ```bash
   npm install
   ```

### Running the Application

Once the dependencies are installed, you can start the server with the following command:

```bash
npm start
```

The server will start on port 8080 by default. You can access the application by opening your browser and navigating to `http://localhost:8080`.

The console will display messages indicating that the HTTP and WebSocket servers are running:

```
[HTTP] Serveur démarré sur http://0.0.0.0:8080
[WS] Serveur WebSocket prêt
Système de rooms activé
Connected to SQLite database.
Users table created or already exists.
```

## Project Structure

```
.
├── js/                # Frontend JavaScript modules
│   ├── auth.js        # Handles login/registration forms
│   ├── input.js       # Manages player input (keyboard/mouse)
│   ├── lobby.js       # Logic for the lobby screen
│   ├── main.js        # Main game client logic
│   ├── room.js        # Logic for the room screen
│   └── scene.js       # Three.js scene setup and rendering
├── server_side/       # Backend logic modules
│   ├── characters.js  # Character stats and definitions
│   ├── game.js        # Core game state logic for a single room
│   └── rooms.js       # Room management system
├── .gitignore
├── authRoutes.js      # Express routes for authentication
├── database.js        # SQLite database connection and user functions
├── *.html             # HTML files for different pages (login, lobby, room, game)
├── *.css              # CSS files for styling
├── package.json       # Project dependencies and scripts
├── package-lock.json
├── README.md
└── server.js          # Main server entry point (Express and WebSocket setup)
```

## How to Play

1. **Start the server:** Run `npm start`.
2. **Open the game:** Navigate to `http://localhost:8080` in your web browser.
3. **Create an account:** Register a new user.
4. **Lobby:** After logging in, you'll be taken to the lobby where you can see a list of available rooms.
5. **Create or Join a Room:** You can create your own room or join an existing one.
6. **Room:** Inside the room, choose your faction (Blue or Red) and then select a character.
7. **Start Game:** The room creator can start the game once at least two players have chosen a character.
8. **Play:** You will be redirected to the game page to play.
