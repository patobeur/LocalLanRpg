const CACHE_NAME = "LittleMoba-offline-v1";
const OFFLINE_URL = "/offline.html";

// Install event: Cache the offline page
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.add(OFFLINE_URL);
		})
	);
	// Force activation immediately
	self.skipWaiting();
});

// Activate event: Clean up old caches
self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					if (cacheName !== CACHE_NAME) {
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
	// Claim clients immediately
	self.clients.claim();
});

// Fetch event: Serve offline page on network failure
self.addEventListener("fetch", (event) => {
	// Only handle navigation requests (HTML pages)
	if (event.request.mode === "navigate") {
		event.respondWith(
			fetch(event.request).catch(() => {
				return caches.match(OFFLINE_URL);
			})
		);
	}
});
