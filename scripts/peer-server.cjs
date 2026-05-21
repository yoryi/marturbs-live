const { PeerServer } = require("peer");

const PORT = Number(process.env.PEER_PORT || 9000);
const PATH = process.env.PEER_PATH || "/marturbs";

const server = PeerServer({
  port: PORT,
  path: PATH,
  allow_discovery: true,
});

server.on("connection", (client) => {
  console.log(`[PeerJS] connected: ${client.getId()}`);
});

console.log(`[PeerJS] signaling server → http://0.0.0.0:${PORT}${PATH}`);
