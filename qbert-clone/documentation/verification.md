# Verification

Local verification on 2026-09-28:

- OpenSpec 1.13.1: project doctor healthy; complete proposal/design/specs/tasks pass strict validation.
- All 19 imported skill directories match source commit b4791422aea61fd98356346aed92cb4dfcb97190 byte-for-byte.
- npm install: 0 reported vulnerabilities.
- npm test: 13 passing deterministic tests for movement, scoring, color modes, completion, discs, collision, lives, enemy behavior, freeze and pause.
- npm run build: successful Vite production build with repository Pages base path.
- npm run test:browser against the production preview: passed actual WebGPU initialization, mouse/keyboard/arrows/touch, life loss/game over/restart, pause, best score and sound persistence, and unsupported-GPU messaging.
- Viewports: 1440x1000, 390x844, 844x390, 320x568; no document scrolling or cabinet overflow.
- Real Codex in-app browser: successful Babylon Lite WebGPU render and visible game controls.
- Reviewed desktop/mobile screenshots; corrected mirrored projection and verified visible player shield.
- No captured browser errors in the successful supported-GPU test run.

Browser tests use the full Chromium channel. The headless-shell/software-backend attempt could not obtain a WebGPU adapter; full Chromium successfully used WebGPU. Hardware support remains browser/device dependent.

Release and public-runtime verification are recorded below.

## Published release

- Repository: https://github.com/SamuelAsherRivello/babylon-lite-qbert-clone
- Demo: https://samuelasherrivello.github.io/babylon-lite-qbert-clone/
- Release: https://github.com/SamuelAsherRivello/babylon-lite-qbert-clone/releases/tag/v0.1.1
- Release commit: 2a0862d (tag v0.1.1); contains the complete game implementation.
- Release workflow: https://github.com/SamuelAsherRivello/babylon-lite-qbert-clone/actions/runs/36410691234 — success.
- Release Pages deployment: https://github.com/SamuelAsherRivello/babylon-lite-qbert-clone/actions/runs/36410742462 — success.
- Full browser suite passed against the public HTTPS demo on 2026-09-28, using the same desktop/mobile/input/persistence checks as the local production preview.
- Public demo also opened and rendered in the Codex in-app browser with WEBGPU ONLINE and v0.1.1 visible.
- Canonical screenshot refreshed from the public v0.1.1 demo.
- Post-release changes are documentation/spec archival only; runtime source matches v0.1.1.

