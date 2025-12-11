const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const path = require("path");

const DB_PATH = path.join(__dirname, "data/users.db");
const saltRounds = 10;

let db = new sqlite3.Database(DB_PATH, (err) => {
	if (err) {
		console.error("Could not connect to database", err);
	} else {
		console.log("Connected to SQLite database.");
		db.run(
			`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            level INTEGER DEFAULT 1
        )`,
			(err) => {
				if (err) {
					console.error("Could not create table", err);
				} else {
					console.log("Users table created or already exists.");

					const checkCols = [
						"games_played",
						"games_won",
						"games_lost",
						"games_unfinished",
						"total_xp",
						"total_kills",
						"total_assists",
						"total_damage_players",
						"total_damage_base",
						"total_damage_minions",
						"total_minions_killed"
					];

					checkCols.forEach(col => {
						db.run(`ALTER TABLE users ADD COLUMN ${col} INTEGER DEFAULT 0`, (err) => {
							// Ignore error if column exists
						});
					});

					const os = require("os");
					const interfaces = os.networkInterfaces();
					const port = process.env.PORT || 8080;
					let serverUrl = `http://localhost:${port}`;
					let addresses = [];

					for (const name of Object.keys(interfaces)) {
						for (const iface of interfaces[name]) {
							if (iface.family === "IPv4" && !iface.internal) {
								addresses.push(iface.address);
							}
						}
					}

					if (addresses.length > 0) {
						serverUrl = `http://${addresses[0]}:${port}`;
						console.log(`Server is online at: ${serverUrl}`);
						if (addresses.length > 1) {
							console.log(
								`Other available IPs: ${addresses.slice(1).join(", ")}`
							);
						}
					} else {
						console.log(`Server is online at: ${serverUrl}`);
					}
				}
			}
		);
	}
});

async function createUser(username, email, password) {
	const hashedPassword = await bcrypt.hash(password, saltRounds);
	return new Promise((resolve, reject) => {
		db.run(
			`INSERT INTO users (username, email, password, games_played, games_won, games_lost, games_unfinished, total_xp, total_kills, total_assists, total_damage_players, total_damage_base, total_damage_minions, total_minions_killed) VALUES (?, ?, ?, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)`,
			[username, email, hashedPassword],
			function (err) {
				if (err) {
					if (err.message.includes("UNIQUE constraint failed")) {
						reject(new Error("Username or email already exists."));
					} else {
						reject(err);
					}
				} else {
					resolve({ id: this.lastID, username, email });
				}
			}
		);
	});
}

function findUserByUsername(username) {
	return new Promise((resolve, reject) => {
		db.get(
			`SELECT * FROM users WHERE username = ?`,
			[username],
			(err, row) => {
				if (err) {
					reject(err);
				} else {
					resolve(row);
				}
			}
		);
	});
}

module.exports = {
	db,
	createUser,
	findUserByUsername,
	bcrypt,
	updateUserLevel,
	updateUserStats,
	getAllUsersStats
};

function updateUserLevel(userId, newLevel) {
	return new Promise((resolve, reject) => {
		db.run(
			`UPDATE users SET level = ? WHERE id = ?`,
			[newLevel, userId],
			function (err) {
				if (err) {
					reject(err);
				} else if (this.changes === 0) {
					reject(new Error("User not found."));
				} else {
					resolve({ id: userId, level: newLevel });
				}
			}
		);
	});
}

function updateUserStats(userId, stats) {
	return new Promise((resolve, reject) => {
		const {
			played, won, lost, unfinished, xp,
			kills, assists, damagePlayers, damageBase, damageMinions, minionsKilled
		} = stats;

		let query = "UPDATE users SET ";
		let params = [];
		let updates = [];

		if (played) {
			updates.push("games_played = games_played + ?");
			params.push(played);
		}
		if (won) {
			updates.push("games_won = games_won + ?");
			params.push(won);
		}
		if (lost) {
			updates.push("games_lost = games_lost + ?");
			params.push(lost);
		}
		if (unfinished) {
			updates.push("games_unfinished = games_unfinished + ?");
			params.push(unfinished);
		}
		if (xp) {
			updates.push("total_xp = total_xp + ?");
			params.push(xp);
		}
		// New stats
		if (kills) {
			updates.push("total_kills = total_kills + ?");
			params.push(kills);
		}
		if (assists) {
			updates.push("total_assists = total_assists + ?");
			params.push(assists);
		}
		if (damagePlayers) {
			updates.push("total_damage_players = total_damage_players + ?");
			params.push(damagePlayers);
		}
		if (damageBase) {
			updates.push("total_damage_base = total_damage_base + ?");
			params.push(damageBase);
		}
		if (damageMinions) {
			updates.push("total_damage_minions = total_damage_minions + ?");
			params.push(damageMinions);
		}
		if (minionsKilled) {
			updates.push("total_minions_killed = total_minions_killed + ?");
			params.push(minionsKilled);
		}

		if (updates.length === 0) {
			return resolve({ id: userId, message: "No updates" });
		}

		query += updates.join(", ") + " WHERE id = ?";
		params.push(userId);

		db.run(query, params, function (err) {
			if (err) {
				reject(err);
			} else if (this.changes === 0) {
				reject(new Error("User not found or no changes made."));
			} else {
				resolve({ id: userId, statsUpdated: true });
			}
		});
	});
}

function getAllUsersStats() {
	return new Promise((resolve, reject) => {
		db.all(
			`SELECT 
				id,
				username,
				level,
				games_played,
				games_won,
				games_lost,
				games_unfinished,
				total_xp,
				total_kills,
				total_assists,
				total_damage_players,
				total_damage_base,
				total_damage_minions,
				total_minions_killed
			FROM users
			ORDER BY total_xp DESC`,
			[],
			(err, rows) => {
				if (err) {
					reject(err);
				} else {
					resolve(rows || []);
				}
			}
		);
	});
}
