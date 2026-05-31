import { VizCertChain } from "./cert/viz-cert-chain.js";
import { VizCertSingle } from "./cert/viz-cert-single.js";
import { VizHudActorLabel } from "./hud/viz-hud-actor-label.js";
import { VizHudBeatCaption } from "./hud/viz-hud-beat-caption.js";
import { VizHudFrameCounter } from "./hud/viz-hud-frame-counter.js";
import { VizHudPacketId } from "./hud/viz-hud-packet-id.js";
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

export const CERT_MODULE_IDS = ["viz-cert-single", "viz-cert-chain"] as const;

export const HUD_MODULE_IDS = [
  "viz-hud-actor-label",
  "viz-hud-beat-caption",
  "viz-hud-packet-id",
  "viz-hud-frame-counter"
] as const;

export const PHASE_17_MODULE_IDS = [...PACKET_MODULE_IDS, ...TUNNEL_MODULE_IDS] as const;

export const PHASE_18_MODULE_IDS = [
  ...PHASE_17_MODULE_IDS,
  ...CERT_MODULE_IDS,
  ...HUD_MODULE_IDS
] as const;

export const CATALOG_VIZ_MODULE_IDS = PHASE_18_MODULE_IDS;

export type Phase17ModuleId = (typeof PHASE_17_MODULE_IDS)[number];
export type Phase18ModuleId = (typeof PHASE_18_MODULE_IDS)[number];

export const VIZ_REGISTRY = {
  "viz-packet-flow": VizPacketFlow,
  "viz-packet-encrypted": VizPacketEncrypted,
  "viz-packet-threat": VizPacketThreat,
  "viz-tunnel-secure": VizTunnelSecure,
  "viz-tunnel-handshake": VizTunnelHandshake,
  "viz-cert-single": VizCertSingle,
  "viz-cert-chain": VizCertChain,
  "viz-hud-actor-label": VizHudActorLabel,
  "viz-hud-beat-caption": VizHudBeatCaption,
  "viz-hud-packet-id": VizHudPacketId,
  "viz-hud-frame-counter": VizHudFrameCounter
} as const;
