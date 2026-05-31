# Phase 03 First Content Batch

## Deliverables

- `tls-short-v1` (45-60s)
- `ssh-short-v1` (45-60s)
- `dns-short-v1` (45-60s)
- `network-foundations-long-v1` (4-6m, TLS -> SSH -> DNS)

## Storyboard Beat Map

### TLS

- `tls-hook`
- `tls-client-hello-beat`
- `tls-server-hello-beat`
- `tls-finished-beat`
- `tls-app-data-beat`

### SSH

- `ssh-hook`
- `ssh-kexinit-beat`
- `ssh-kex-reply-beat`
- `ssh-userauth-beat`
- `ssh-session-beat`

### DNS

- `dns-hook`
- `dns-query-beat`
- `dns-recursive-beat`
- `dns-authoritative-beat`
- `dns-response-beat`

## KPI Schema Contract

- Retention checkpoints: `p25`, `p50`, `p75`, `completion`
- Feedback tags: string list
- Pacing verdict enum: `too_fast | balanced | too_slow`
- Notes: free-form qualitative context
