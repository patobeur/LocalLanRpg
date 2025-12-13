const express = require("express");
const router = express.Router();
const { createUser, findUserByUsername, bcrypt } = require("./database");

// --- Simple Rate Limiter ---
const requestCounts = new Map();
const LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute per IP

function rateLimit(req, res, next) {
	const ip = req.ip;
	const now = Date.now();

	let client = requestCounts.get(ip);

	// Reset if window expired
	if (!client || now - client.startTime > LIMIT_WINDOW) {
		client = { count: 0, startTime: now };
	}

	client.count++;
	requestCounts.set(ip, client);

	if (client.count > MAX_REQUESTS) {
		return res.status(429).json({ error: "Trop de tentatives. Veuillez patienter 1 minute." });
	}

	next();
}

// Route d'enregistrement
router.post("/register", rateLimit, async (req, res) => {
	const { username, email, password } = req.body;

	// Validation
	if (!username || !email || !password) {
		return res.status(400).json({ error: "Tous les champs sont requis." });
	}

	if (password.length < 6) {
		return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères." });
	}

	try {
		const user = await createUser(username, email, password);
		// Create session
		req.session.userId = user.id;
		req.session.username = user.username;
		res.status(201).json({
			success: true,
			message: "Utilisateur enregistré avec succès.",
			user: { id: user.id, username: user.username, email: user.email }
		});
	} catch (err) {
		console.error("Registration error:", err);
		res.status(400).json({ error: err.message });
	}
});

// Route de connexion
router.post("/login", rateLimit, async (req, res) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res.status(400).json({ error: "Tous les champs sont requis." });
	}

	try {
		const user = await findUserByUsername(username);
		if (!user) {
			return res.status(400).json({ error: "Nom d'utilisateur ou mot de passe incorrect." });
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ error: "Nom d'utilisateur ou mot de passe incorrect." });
		}

		// Create session
		req.session.userId = user.id;
		req.session.username = user.username;
		req.session.level = user.level;

		res.status(200).json({
			success: true,
			message: "Connexion réussie.",
			user: { id: user.id, username: user.username, email: user.email, level: user.level }
		});
	} catch (err) {
		console.error("Login error:", err);
		res.status(500).json({ error: "Erreur serveur lors de la connexion." });
	}
});

// Route de déconnexion
router.post("/logout", (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			return res.status(500).json({ error: "Erreur lors de la déconnexion." });
		}
		res.json({ success: true, message: "Déconnexion réussie." });
	});
});

// Route pour vérifier la session
router.get("/session", (req, res) => {
	if (req.session.userId) {
		res.json({
			authenticated: true,
			user: {
				id: req.session.userId,
				username: req.session.username,
				level: req.session.level
			}
		});
	} else {
		res.json({ authenticated: false });
	}
});

module.exports = router;
