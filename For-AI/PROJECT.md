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
| `sounds.mjs` | Synthesized bucket/handling effects, activation tune, mute control |
| `tests/bucket-physics.test.mjs` | Containment and separation checks |
| `tests/game-flow.test.mjs` | Persistent objects, restart, complete automatic JSON export |
| `vendor/` | Bundled Three.js 0.180.0 and license |
| `docs/research/` | Reviewed research summaries |
| `For-AI/` | Current agent guidance, gates, and decisions |

One bucket carries a cube, cylinder, and rectangular block. All use matte `#808080`; each is tested once. Contact depresses the detector, then gold indicates activation and red non-activation. The cube is the demo cause. Players pick one object, then judge each independently. The complete local JSON downloads automatically after the final answer, with no download button. Shape, size, order, and response position are not counterbalanced.

The detector has a dark green box and broad red top based on [original video references](machine-references.md). Synthesized handling effects accompany bucket arrival and object placement; only activation plays the detector tune. Sound on/off controls all effects. Next carries each tested object onto the adjacent table before advancing and logs `object_returned_to_table`. All objects remain visible through final judgments and completion; a neutral ring marks the current judgment subject. Hidden outcomes remain scenario data, independent of appearance.

Scenario `v1_gray_object_types` uses `obj_cube`, `obj_column`, `obj_block`. Older colored exports have different IDs and must not be silently pooled. This repository contains reviewed public browser code and guidance, excluding the private historical source archive. It is independently editable.

## Publication

Repository: [VR-Blicket-Task-Web](https://github.com/GeorgeFejer91/VR-Blicket-Task-Web). GitHub Pages serves `main` / root at [the game](https://georgefejer91.github.io/VR-Blicket-Task-Web/). Serve locally with `python -m http.server 8878 --bind 127.0.0.1`. Verification evidence is owned by `VERIFICATION.md`.
