// Room Management System

class Room {
    constructor(id, name, creatorId, creatorUsername) {
        this.id = id;
        this.name = name;
        this.creatorId = creatorId;
        this.creatorUsername = creatorUsername;
        this.players = new Map(); // playerId -> { id, username, faction, character, ready }
        this.maxPlayers = 10;
        this.status = 'waiting'; // 'waiting' | 'playing'
        this.created = new Date();
        this.game = null; // Will be created when game starts
    }

    addPlayer(playerId, username) {
        if (this.players.size >= this.maxPlayers) {
            throw new Error('Room is full');
        }
        if (this.status === 'playing') {
            throw new Error('Game already started');
        }

        this.players.set(playerId, {
            id: playerId,
            username,
            faction: null, // 'blue' | 'red'
            character: null,
            ready: false
        });
    }

    removePlayer(playerId) {
        return this.players.delete(playerId);
    }

    setPlayerFaction(playerId, faction) {
        const player = this.players.get(playerId);
        if (!player) throw new Error('Player not in room');
        if (faction !== 'blue' && faction !== 'red') {
            throw new Error('Invalid faction');
        }
        player.faction = faction;
        player.character = null; // Reset character when changing faction
        player.ready = false;
    }

    setPlayerCharacter(playerId, character) {
        const player = this.players.get(playerId);
        if (!player) throw new Error('Player not in room');
        if (!player.faction) throw new Error('Must choose faction first');
        player.character = character;
        player.ready = true;
    }

    canStart() {
        // At least 2 players and all have chosen character
        if (this.players.size < 2) return false;
        for (const player of this.players.values()) {
            if (!player.character) return false;
        }
        return true;
    }

    getPlayersList() {
        return Array.from(this.players.values()).map(p => ({
            id: p.id,
            username: p.username,
            faction: p.faction,
            character: p.character,
            ready: p.ready
        }));
    }

    isEmpty() {
        return this.players.size === 0;
    }
}

class RoomManager {
    constructor() {
        this.rooms = new Map();
        this.nextRoomId = 1;
    }

    createRoom(name, creatorId, creatorUsername) {
        const id = String(this.nextRoomId++);
        const room = new Room(id, name, creatorId, creatorUsername);
        this.rooms.set(id, room);

        // Add creator to room
        room.addPlayer(creatorId, creatorUsername);

        return room;
    }

    getRoom(roomId) {
        return this.rooms.get(roomId);
    }

    getRoomsList() {
        return Array.from(this.rooms.values()).map(room => ({
            id: room.id,
            name: room.name,
            creatorUsername: room.creatorUsername,
            playerCount: room.players.size,
            maxPlayers: room.maxPlayers,
            status: room.status,
            created: room.created
        }));
    }

    joinRoom(roomId, playerId, username) {
        const room = this.rooms.get(roomId);
        if (!room) throw new Error('Room not found');
        room.addPlayer(playerId, username);
        return room;
    }

    leaveRoom(roomId, playerId) {
        const room = this.rooms.get(roomId);
        if (!room) return { removed: false };

        const removed = room.removePlayer(playerId);
        let leftGame = false;

        // Remove from game instance if playing
        if (room.status === 'playing' && room.game) {
            if (room.game.removePlayer(playerId)) {
                leftGame = true;
                console.log(`[Rooms] Player ${playerId} removed from game in room ${roomId}`);
            }
        }

        // Delete room if empty
        if (room.isEmpty()) {
            this.rooms.delete(roomId);
            console.log(`[Rooms] Room ${roomId} deleted (empty)`);
        } else {
            // If creator left, assign new creator
            if (room.creatorId === playerId) {
                const remainingPlayers = Array.from(room.players.values());
                if (remainingPlayers.length > 0) {
                    // Pick random player
                    const newCreator = remainingPlayers[Math.floor(Math.random() * remainingPlayers.length)];
                    room.creatorId = newCreator.id;
                    room.creatorUsername = newCreator.username;
                    console.log(`[Rooms] Room ${roomId} ownership transferred to ${newCreator.username}`);
                }
            }
        }

        return { removed, leftGame };
    }

    setPlayerFaction(roomId, playerId, faction) {
        const room = this.rooms.get(roomId);
        if (!room) throw new Error('Room not found');
        room.setPlayerFaction(playerId, faction);
        return room;
    }

    setPlayerCharacter(roomId, playerId, character) {
        const room = this.rooms.get(roomId);
        if (!room) throw new Error('Room not found');
        room.setPlayerCharacter(playerId, character);
        return room;
    }

    startGame(roomId, requesterId) {
        const room = this.rooms.get(roomId);
        if (!room) throw new Error('Room not found');
        if (room.creatorId !== requesterId) {
            throw new Error('Only creator can start the game');
        }
        if (!room.canStart()) {
            throw new Error('Not all players are ready');
        }

        room.status = 'playing';

        // Create game instance for this room
        const Game = require('./game.js');
        room.game = new Game();

        // Start the game (initializes minion spawning, etc.)
        room.game.startGame();

        // DON'T pre-add players here - they will be added via WebSocket "join" message
        // This prevents duplicate players

        return room;
    }

    cleanupEmptyRooms() {
        for (const [id, room] of this.rooms) {
            if (room.isEmpty()) {
                this.rooms.delete(id);
                console.log(`[Rooms] Room ${id} cleaned up`);
            }
        }
    }
}

module.exports = new RoomManager();
