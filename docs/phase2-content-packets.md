# Phase 2 Content Packets

## Purpose
Standardize script and storyboard inputs for `TLS Handshake`, `SSH Authentication`, and `DNS Explained` so templates can be implemented with deterministic timeline beats.

## Scene Brief Schema
- `topic`: tls | ssh | dns
- `hook`: problem statement in one sentence
- `storyboardBeats`: ordered beat list
- `durationBudget`: target range for short format
- `cta`: final audience action

## TLS Handshake Packet
- **Hook:** Public networks are unsafe for credentials without encryption.
- **Duration Budget:** 45-60 seconds.
- **CTA:** Explain why HTTPS trust indicators matter.
- **Storyboard Beats:**
  - `tls-hook` (0-30): show attacker visibility risk.
  - `tls-client-hello-beat` (12-48): client proposes crypto options.
  - `tls-server-hello-beat` (54-98): server proves identity with certificate.
  - `tls-finished-beat` (110-168): key exchange finalizes secure channel.
  - `tls-app-data-beat` (170-236): encrypted app traffic flows.

## SSH Authentication Packet
- **Hook:** Remote shell needs both confidentiality and server authenticity.
- **Duration Budget:** 40-55 seconds.
- **CTA:** Recommend host key verification and key-based auth.
- **Storyboard Beats:**
  - `ssh-hook` (0-28): remote admin risk context.
  - `ssh-kexinit-beat` (14-50): negotiate key exchange and algorithms.
  - `ssh-kex-reply-beat` (52-104): host key proof and exchange reply.
  - `ssh-userauth-beat` (108-164): authenticate user over encrypted channel.
  - `ssh-session-beat` (166-216): open secure command session.

## DNS Explained Packet
- **Hook:** Browsers need IP addresses, not domain names.
- **Duration Budget:** 45-60 seconds.
- **CTA:** Encourage understanding of resolver caching and latency.
- **Storyboard Beats:**
  - `dns-hook` (0-24): why DNS translation exists.
  - `dns-query-beat` (16-56): client queries recursive resolver.
  - `dns-recursive-beat` (58-118): resolver traverses root/TLD hierarchy.
  - `dns-authoritative-beat` (120-172): authoritative answer returned.
  - `dns-response-beat` (174-226): resolver responds to client and caches.

## Long-Form Assembly Map
- Sequence: TLS -> SSH -> DNS.
- Transition beats:
  - TLS end to SSH hook: encrypted transport as foundation for remote admin.
  - SSH end to DNS hook: secure sessions still depend on reliable name resolution.
- Target envelope: 4-6 minutes total with short recap bridge between sections.
