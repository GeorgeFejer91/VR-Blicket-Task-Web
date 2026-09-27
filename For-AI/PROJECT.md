# Project

Reviewed: 2026-09-27.

## Purpose and scope

A public PC browser game lets players discover which object activates a detector. It is a prototype, not a validated research instrument. The game remains English. VR and new causal protocol families are deferred; no backend, account, or session upload exists.

## Architecture

| Path | Responsibility |
| --- | --- |
| `index.html`, `styles.css` | Desktop page and prompts |
| `game.js` | Three.js scene, bucket motion, interaction, feedback, judgments, local export |
| `scenario.json` | Three gray stimuli and hidden outcomes |
| `bucket-physics.mjs` | Bounded collisions |
| `tests/bucket-physics.test.mjs` | Containment and separation checks |
| `vendor/` | Bundled Three.js 0.180.0 and license |
| `docs/research/` | Reviewed research summaries |
| `For-AI/` | Current agent guidance, gates, and decisions |

One bucket carries a cube, cylinder, and rectangular block. All use matte `#808080`; each is tested once. Contact depresses the detector, then gold indicates activation and red non-activation. The cube is the demo cause. Players pick one object, then judge each independently, with optional local JSON export. Shape, size, order, and response position are not counterbalanced.

Scenario `v1_gray_object_types` uses `obj_cube`, `obj_column`, `obj_block`. Older colored exports have different IDs and must not be silently pooled. This repository contains reviewed public browser code and guidance, excluding the private historical source archive. It is independently editable.

## Publication

Repository: [VR-Blicket-Task-Web](https://github.com/GeorgeFejer91/VR-Blicket-Task-Web). GitHub Pages serves `main` / root at [the game](https://georgefejer91.github.io/VR-Blicket-Task-Web/). Serve locally with `python -m http.server 8878 --bind 127.0.0.1`. Verification evidence is owned by `VERIFICATION.md`.
