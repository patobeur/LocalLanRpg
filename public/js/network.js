export function connect(url, handlers) {
    const ws = new WebSocket(url);
    ws.onopen = handlers.onOpen;
    ws.onmessage = (ev) => {
        const msg = JSON.parse(ev.data);
        handlers.onMessage(msg);
    };
    ws.onclose = handlers.onClose;
    return ws;
}
