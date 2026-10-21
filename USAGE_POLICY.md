# Usage Policy

## In one line

ZERO-X automates the offensive half of a penetration test. **It must only ever
run against systems you own or are explicitly authorized in writing to test.**

## Before you run anything

You must have all of the following:

1. **Written authorization** from the asset owner, naming the exact targets
   (CIDR ranges, domains, package names).
2. **A time window** for testing, with a start and end.
3. **Rules of engagement** — what is out of scope (production data, third-party
   services, destructive actions).
4. **An emergency contact** who can authorize stopping.
5. **A safe target** for first runs: a lab device, an emulator, or a deliberately
   vulnerable VM. Never a stranger's phone on a shared Wi-Fi.

## Allowed

| Use | |
|---|---|
| Authorized penetration tests and red-team engagements | ✅ |
| CTFs and lab ranges you control | ✅ |
| Security research on your own devices | ✅ |
| Teaching, with instructor-provided targets | ✅ |

## Prohibited

| Use | |
|---|---|
| Scanning or exploiting third-party networks or devices | ❌ |
| Using the ADB module against devices on a public/shared network | ❌ |
| Any use for extortion, harassment, or data theft | ❌ |
| Deploying the platform as a public multi-tenant service without a security review | ❌ |
| Removing the legal-acknowledgement gate or the audit logging | ❌ |

## About the ADB module

`lib/exploits/adbHijacker/adb_tls_auth_bypass.py` targets **CVE-2026-0073**.
Its preconditions are strict: the target must have **wireless debugging
enabled** *and* have been **paired with a host at least once**. Running it
against a device without both is both ineffective and unlawful.

The scanner (`scanner.py`) is strictly read-only discovery; keep it that way.

## Responsible disclosure

If you discover a new vulnerability while using this tool, report it to the
vendor first (Google's Android Security Program for Android issues), not here.

## Disclaimer

Provided "as is" under the MIT License, without warranty of any kind. The author
accepts **no liability** for unauthorized or unlawful use. **Legal compliance is
the sole responsibility of the operator.**
