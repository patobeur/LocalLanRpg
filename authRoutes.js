const express = require("express");
const router = express.Router();
const userModel = require("./userModel");
const bcrypt = require("bcryptjs");

// Route d'enregistrement
router.post("/register", async (req, res) => {
	const { email, name, color, password } = req.body;

	if (userModel.findUserByEmail(email)) {
		return res.status(400).send("Cet email est déjà enregistré.");
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	const newUser = userModel.createUser({
		email,
		name,
		color,
		password: hashedPassword,
	});

	res.status(201).send("Utilisateur enregistré avec succès.");
});

// Route de connexion
router.post("/login", async (req, res) => {
	const { email, password } = req.body;

	const user = userModel.findUserByEmail(email);
	if (!user) {
		return res.status(400).send("Email ou mot de passe incorrect.");
	}

	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		return res.status(400).send("Email ou mot de passe incorrect.");
	}

	res.status(200).send("Connexion réussie.");
});

module.exports = router;
