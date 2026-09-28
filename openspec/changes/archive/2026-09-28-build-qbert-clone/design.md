# Design
## Context
The generated template supplies Vite, OpenSpec, four corner roles and Pages/release workflows. See proposal.md for motivation. Babylon Lite's published functional API uses createEngine, scene ownership, registerScene and startEngine.
## Goals / Non-Goals
Goals: deterministic rules that can be tested without a GPU; real WebGPU rendering; responsive fixed camera and original metallic visuals; reliable static publication.
Non-goals: ROM emulation, copied sprites/audio, multiplayer, backend services or WebGL substitution.
## Decisions
- Use a pure JavaScript Game model with injected randomness, delta-time ticks and discrete movement events. Rendering only reads state; input calls the same move command. This avoids tying tests to GPU timings.
- Use Babylon Lite directly rather than the full Babylon engine or compatibility wrapper. Preallocate actor meshes and update transforms/visibility each frame. Reflective PBR metals receive a locally generated environment texture and directional lights.
- Position board coordinates in the XZ plane, with height decreasing by row, and use a fixed orthographic/isometric camera. Animate hops between states while the logical model gates repeated input.
- Use a 9:16 CSS frame, DOM HUD and buttons, surrounding original imagegen art and machined CSS trim. Preserve template corner semantics; collapse peripheral text on narrow screens.
- Use Web Audio synthesized effects on user gesture and localStorage with graceful failure for best score and sound preference.
- Keep Vite and npm at repository root; rename application to qbert-clone. Use repository-specific Pages base path. Keep a single version.txt source consumed by the UI and release workflow.
- Use Node rule tests and Playwright browser integration tests at desktop/mobile sizes. Verify actual GPU initialization and screenshots, not just successful HTTP responses.
## Risks / Trade-offs
- WebGPU availability varies by browser/device → explain unavailable adapters with retry and browser guidance; no misleading fallback label.
- Metallic surfaces can obscure tile states → keep bright inset amber target panels and numerical progress.
- Enemy timing and overlapping hops → deterministic cooldowns, collision checks on landing and arrival, temporary respawn immunity.
- Short screens reduce usable controls → scale the complete portrait cabinet together and retain keyboard access.
## Migration Plan
Publish through the generated repo's Pages workflow after local validation. Release workflow tests/builds, bumps version, tags, releases and dispatches Pages. Roll back by deploying a previous verified commit. Pull the bot release commit back into the local checkout.
