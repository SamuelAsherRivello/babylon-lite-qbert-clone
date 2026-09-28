# Qbert Clone — repository guidance

- Repository root is the npm/Git root. Application source, tests and assets live in `qbert-clone/`.
- Runtime: JavaScript, Vite, `@babylonjs/lite` functional API, WebGPU only. Keep rules in `src/game.js` independent from rendering and DOM.
- Run `npm test`, `npm run build`, and `npm run test:browser` with a local Vite server for runtime changes.
- Preserve title at upper left, project links at upper right, settings at lower left and version at lower right; adapt responsively.
- Canonical screenshot: `qbert-clone/documentation/screenshot01.png`.
- `version.txt` is the displayed/released version. Release workflow increments its patch and deploys Pages.
- Do not create pull requests unless explicitly requested. Never push to the source template repository.
- Shared skills imported from the requested ai-skills-library; see `qbert-clone/documentation/provenance.md`. Library variants intentionally supersede overlapping template skills. Do not hand-edit imported skill content.
- OpenSpec 1.13.1 manages repo-local planning in `openspec/`; use explore, propose and apply in that order for substantial changes. Explicit user instructions take precedence over skill defaults.
