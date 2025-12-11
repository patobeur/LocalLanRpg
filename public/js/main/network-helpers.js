/**
 * Send assets-loaded message to server
 */
export function sendAssetsLoaded() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "assets-loaded" }));
        console.log("[Network] Sent assets-loaded to server");
    }
}
