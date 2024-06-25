import genText from "./util/gemini";
import synthesizeSpeech from "./util/speech";

Bun.serve({
  fetch(req, server) {
    // upgrade the request to a WebSocket
    if (server.upgrade(req)) {
      return; // do not return a Response
    }
    return new Response("Upgrade failed", { status: 500 });
  },
  websocket: {
    async message(ws, message) {
      const text = await genText(message);
      synthesizeSpeech(text, ws);
    },
  },
});
