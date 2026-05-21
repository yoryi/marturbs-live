/**
 * PeerJS solo acepta IDs que cumplan:
 * /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/
 * (sin guiones seguidos ni segmentos vacíos)
 */
export function buildPeerId(
  role: "client" | "model",
  userId: string,
  roomId: string,
): string {
  const prefix = role === "client" ? "c" : "m";
  const user = (userId || "anon").replace(/[^a-zA-Z0-9]/g, "") || "anon";
  const room = roomId.replace(/[^a-zA-Z0-9]/g, "") || "room";
  return `${prefix}${user}${room}`.slice(0, 64);
}
