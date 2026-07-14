# Security Policy

## Supported Versions

The following versions of RaceCtrl are currently supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| v0.4.x  | :white_check_mark: |
| < v0.4  | :x:                |

## Security Scope & Public Data Model

RaceCtrl is a client-side Progressive Web Application (PWA) displaying Formula 1 schedule and telemetry data. 

- **Public API Data**: RaceCtrl fetches public Formula 1 schedule and standings details from the public Ergast/Jolpica API (`https://api.jolpi.ca/`). No API secrets, subscription keys, or bearer tokens are required to access this endpoint. 
- **Local Storage**: User favorites and preferences (timezone mode, theme, time format) are persisted locally in the client's `localStorage`. No personal data, session tokens, or authentication credentials are stored.

## Reporting a Vulnerability

If you discover a potential security vulnerability in RaceCtrl, please report it responsibly by contacting the security maintainers.

Please do **NOT** open public GitHub issues for security vulnerabilities.

### What to Include in a Report

To help us investigate and patch the issue quickly, please include:
- A description of the vulnerability and its potential impact.
- Clear, step-by-step instructions or proof-of-concept scripts to reproduce the issue.
- Details of the environment (browser, OS, device configuration) in which it was observed.

### What NOT to Include

Please do **NOT** include:
- Exploit instructions intended for malicious distribution.
- Complete un-masked credentials (if found).
- Raw network captures containing unrelated third-party traffic.

## High-Level Security Architecture

1. **Strict Client-Server Boundaries**: Sensitive operational processes are restricted to Next.js route handlers and server environments.
2. **Strict HTTP Security Headers**: Configured in Next.js to enforce secure transport (HSTS), restrict frame embedding (clickjacking prevention), restrict permissions to unused browser hardware, and establish a strict same-origin Content Security Policy (CSP).
3. **Storage Sanitization**: Clean type-checking and structural sanitization helpers protect client state calculations from malicious or corrupted `localStorage` inputs.
4. **Input & API Type Guarding**: All dynamic API data payloads are validated and typed before being rendered on the client to avoid execution errors and structure exploitation.

## Known Security Limitations

- **Client-Side Storage**: Local preferences are stored in plaintext browser `localStorage`. Since no sensitive authentication tokens or credentials exist in RaceCtrl, this is accepted as standard for user preferences.
- **External API Reliability**: RaceCtrl relies on the public third-party `https://api.jolpi.ca/` endpoint. While defensive timeouts and mocks are implemented, the availability of F1 data remains dependent on the reliability of the external API.
