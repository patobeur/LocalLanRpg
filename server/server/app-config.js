// App Configuration Module
// Sets up Express app with middleware and static files

const express = require("express");
const path = require("path");
const session = require("express-session");
const authRoutes = require("../authRoutes");

/**
 * Configure Express app with all middleware
 * @param {Express} app - Express application instance
 */
function setupApp(app) {
	// Body parsing middleware
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	// Session configuration
	app.use(
		session({
			secret: "local-lan-rpg-secret-key-change-in-production",
			resave: false,
			saveUninitialized: false,
			cookie: {
				maxAge: 24 * 60 * 60 * 1000, // 24 hours
				secure: false, // set to true if using HTTPS
			},
		})
	);

	// Auth routes
	app.use("/api/auth", authRoutes);

	// Serve static files (HTML, CSS, JS)
	app.use(express.static(path.join(__dirname, "../../public")));
	app.use(
		"/node_modules",
		express.static(path.join(__dirname, "../../node_modules"))
	);
	app.use(
		"/media",
		express.static(path.join(__dirname, "../../public/media"))
	);
}

/**
 * Authentication middleware
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Next middleware
 */
function requireAuth(req, res, next) {
	if (req.session && req.session.userId) {
		return next();
	}
	// For API routes, return JSON error instead of redirecting
	if (req.path.startsWith("/api/")) {
		return res.status(401).json({ error: "Unauthorized" });
	}
	res.redirect("/login.html");
}

module.exports = {
	setupApp,
	requireAuth,
};
