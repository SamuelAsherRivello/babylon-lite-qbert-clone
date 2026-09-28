# Proposal

## Why
Create a complete, immediately playable browser interpretation of Q*bert with original realistic metal visuals. The user requested a new template-based public repository, imported shared skills, a release, and a working GitHub Pages demo.

## What Changes
- Replace the starter with Qbert Clone in `qbert-clone/`.
- Implement the 28-tile pyramid, four diagonal hops, tile color progression, enemies, discs, score, lives, bonus lives, four-round levels, pause and restart.
- Render through Babylon Lite's WebGPU engine with PBR metals and an original illustrated cabinet surround.
- Provide keyboard and onscreen controls, responsive portrait framing, sound settings and saved high score.
- Test rules and browser behavior, publish Pages and a versioned release, and synchronize the local checkout.

## Capabilities
### New Capabilities
- `arcade-game`: Pyramid rules, progression, enemies, scoring and lifecycle.
- `portrait-presentation`: WebGPU metallic scene, portrait frame, accessible keyboard/touch UI and original gutter art.
- `publication`: Reproducible build, GitHub Pages, versioned release and repository documentation.
### Modified Capabilities
None.

## Impact
Replaces starter React presentation with vanilla JavaScript, Babylon Lite and Vite. No server, accounts, external runtime assets or paid services. Assumption: faithfulness to Q*bert's fixed isometric board takes precedence over the conflicting side-view wording. Use original assets rather than extracted arcade art. Skill planning boundaries are superseded by explicit user authorization to continue through delivery without questions.
