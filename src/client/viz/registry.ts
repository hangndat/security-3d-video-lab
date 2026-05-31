import { VizPacketEncrypted } from "./packet/viz-packet-encrypted.js";
import { VizPacketFlow } from "./packet/viz-packet-flow.js";
import { VizPacketThreat } from "./packet/viz-packet-threat.js";
import { VizTunnelHandshake } from "./tunnel/viz-tunnel-handshake.js";
import { VizTunnelSecure } from "./tunnel/viz-tunnel-secure.js";

export const PACKET_MODULE_IDS = [
  "viz-packet-flow",
  "viz-packet-encrypted",
  "viz-packet-threat"
] as const;

export const TUNNEL_MODULE_IDS = ["viz-tunnel-secure", "viz-tunnel-handshake"] as const;

export const PHASE_17_MODULE_IDS = [...PACKET_MODULE_IDS, ...TUNNEL_MODULE_IDS] as const;

export type Phase17ModuleId = (typeof PHASE_17_MODULE_IDS)[number];

export const VIZ_REGISTRY = {
  "viz-packet-flow": VizPacketFlow,
  "viz-packet-encrypted": VizPacketEncrypted,
  "viz-packet-threat": VizPacketThreat,
  "viz-tunnel-secure": VizTunnelSecure,
  "viz-tunnel-handshake": VizTunnelHandshake
} as const;
