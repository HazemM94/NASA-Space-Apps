# AstroHealth AI (V2.2) — Autonomous Space Health Monitoring Platform

> **CLINICAL DECISION-SUPPORT PROTOTYPE — SYNTHETIC DEMO DATA ONLY — NOT A CERTIFIED MEDICAL DEVICE.**

AstroHealth AI is an edge-first clinical decision-support prototype built for the **NASA Space Apps Challenge 2026 (Health-Monitoring Software for Astronauts on Space Missions)**. It addresses deep-space communication latencies of up to 20 minutes each way during Artemis lunar and Mars transit missions.

## Key Engineering Highlights
1. **Continuous 2-Second Telemetry & 3-of-5 Rolling Window Engine:** Evaluates wearable streams (Astroskin ECG/BP/SpO2, Actiwatch sleep score, fNIRS cognitive fatigue, and shielded habitat dosimetry) against personalized crew baselines with a 300-second cooldown and immediate `YELLOW -> RED` escalation bypass.
2. **Dual-Mode RAG Engine (`GeminiProvider` + `OfflineRulesProvider`):** Uses Google GenAI structured outputs when online and automatically falls back to deterministic local retrieval when offline, enforcing pre-boost similarity gating, citation verification, and allowlisted countermeasure materialization.
3. **Interactive 2D SVG Digital Twin:** Driven in real time by WebSocket `region_statuses` across 6 anatomical systems.
4. **Zero-Latency Trauma Override ("Red Button"):** Publicly cached in memory, `localStorage`, and `trauma_protocols.fallback.json` with Web Speech API voice readout so emergency checklists open in `<10ms` even offline or with an expired JWT.
5. **HMAC-SHA256 Canonical Mission Control Sync & Tamper Detection:** Generates cryptographically signed medical digests with a live tamper-verification demo.

## Security & Architecture Notes
- **Single-Worker Requirement:** Always run Uvicorn with `--workers 1` so in-memory WebSocket subscriptions and the background telemetry simulator share state deterministically.
- **WebSocket Token Note:** For local hackathon simplicity, `/ws/telemetry?token=<jwt>` passes the JWT in the query string (which may appear in local server access logs). Production deployments should exchange the JWT for a single-use short-lived ticket token.
- **Knowledge Base Provenance:** All files in `backend/data/nasa_kb/` are paraphrased prototype summaries based on public NASA Human Research Program (HRP) Evidence Reports (Stenger et al., 2017; Carnell et al., 2016; Flynn-Evans et al., 2016) with illustrative section/page numbers.

## Quick Start
### Windows (PowerShell)
