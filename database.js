const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const DB_PATH = "./users.db";
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
            password TEXT NOT NULL
        )`,
			(err) => {
				if (err) {
					console.error("Could not create table", err);
				} else {
					console.log("Users table created or already exists.");
				}
			}
		);
	}
});

async function createUser(username, email, password) {
	const hashedPassword = await bcrypt.hash(password, saltRounds);
	return new Promise((resolve, reject) => {
		db.run(
			`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
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
};
