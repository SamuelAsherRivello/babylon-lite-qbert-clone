# Provenance

## Repository and skills

Repository created with GitHub's template-generation API from SamuelAsherRivello/github-repository-template on 2026-09-28, preserving its MIT ownership and contributor credits. GitHub generated a fresh single root commit, with no source history.

All 19 skill directories from https://github.com/SamuelAsherRivello/ai-skills-library at commit b4791422aea61fd98356346aed92cb4dfcb97190 were copied into `.agents/skills/`, including supporting files. Overlapping skills use the library's exact content, including generatedBy values. Other template OpenSpec helpers remain. The library currently has no repository-wide license; imported skills retain any per-skill license notices and are not relicensed by this game's MIT license. They are local instructions and are not included in the deployed game. New skill discovery is available on the next chat turn.

## Original art

`public/assets/cabinet.png` was generated using the built-in imagegen tool for this project. Prompt:

> Create original photorealistic futuristic brushed titanium arcade cabinet border artwork, landscape 1536x1024. This is a background texture for a portrait metal pyramid hopping browser game. Central 40 percent is very dark empty charcoal space reserved for game screen, no objects there. On far left and far right, architectural stacks of polished chrome and dark gunmetal stairs, ribbed metal heat sinks, beautifully machined beveled panels, tiny screws, inset amber illuminated strips, subtle teal reflected rim lights. Dramatic premium industrial product photography, physically realistic brushed metal scratches, high contrast but restrained dark exposure, symmetrical balanced composition, interesting angular stepped geometry in the side gutters. No text, no logos, no letters, no characters, no UI, no actual game screenshot. Edge-to-edge background.

All game meshes, brushed-metal grain, favicon and Web Audio sounds were authored procedurally for the game. No original Q*bert sprites, recordings or ROM data are included. The reference game's layout was inspected, not its art copied. The supplied Google image-search URL failed to load; the metallic treatment was developed from the user's written direction.

## Babylon Lite lookup texture

`public/assets/brdf-lut.png` comes from https://github.com/BabylonJS/Babylon-Lite/blob/master/packages/babylon-lite/assets/brdf-lut.png, retrieved 2026-09-28. It is a numerical physically based rendering lookup, not decorative artwork. Babylon Lite is Apache-2.0. Full license and notice are in `third-party/`.

## Interpretation

The request combined '2d side view' with a faithful Q*bert clone. The implemented fixed isometric pyramid preserves the requested game's recognizable movement and rules. The rendering is 3D orthographic with 2D discrete board movement, one screen, no scrolling. Difficulty follows recognizable arcade modes with original timing and visual designs.
