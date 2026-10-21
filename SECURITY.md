# Security Policy

## Supported versions

| Version | Supported |
|---|---|
| 0.1.x (prototype) | ⚠️ best effort |

> **Status:** ZERO-X is a **prototype / reference implementation**. It is not a
> hardened multi-tenant service and must not be exposed to the public internet.

## Reporting a vulnerability

Email **moh123mon456@gmail.com** with the details. Do not open a public issue for
security problems. Acknowledgement within 72 hours.

## ⚠️ This repository contains exploit code

`lib/exploits/adbHijacker/` contains a proof-of-concept for **CVE-2026-0073**
(Android wireless-ADB authentication bypass, CVSS 8.8). Read
[`lib/exploits/adbHijacker/README.md`](lib/exploits/adbHijacker/README.md) and
[`USAGE_POLICY.md`](USAGE_POLICY.md) before touching it.

**Permitted:** running it against devices **you own** or are contracted to test,
in an isolated lab network.

**Prohibited:** using it against any device without documented authorization.
Doing so is a criminal offence in most jurisdictions.

## Secrets and keys

| Secret | Handling |
|---|---|
| `E2B_API_KEY` | Server-side only. Never expose via `NEXT_PUBLIC_*`. |
| `OPENAI_API_KEY` | Server-side only. |
| `CONVEX_*` | Deployment-scoped; local dev uses `npx convex dev`. |

The app degrades to **demo/simulated mode** when keys are absent — this is by
design, not a bypass.

## By-design behaviour (not vulnerabilities)

| Behaviour | Why |
|---|---|
| Demo mode without E2B/OpenAI keys | The UI must be explorable without paid keys |
| Legal acknowledgement gate before a run | Deliberate friction: an operator must confirm scope |
| Sandbox isolation via E2B (Firecracker microVMs) | Tool execution never touches the host |
