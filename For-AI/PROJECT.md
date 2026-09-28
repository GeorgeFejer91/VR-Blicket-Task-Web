# Project

Reviewed: 2026-09-29.

## Purpose and scope

A public PC browser game lets players discover which objects activate a detector alone or together. It is a prototype, not a validated research instrument. The game offers English and German text. VR is deferred; no backend, account, or session upload exists.

## Architecture

| Path | Responsibility |
| --- | --- |
| `index.html`, `styles.css` | Desktop page and prompts |
| `game.js` | Three.js scene, bucket motion, interaction, feedback, judgments, local export |
| `scenario.json` | Three gray object sets, OR/OR/AND rules and six-test evidence order |
| `bucket-physics.mjs` | Bounded collisions |
| `sounds.mjs` | Synthesized bucket/handling effects, activation tune, mute control |
| `text-layout.mjs` | Measured text sizing for narrow and translated controls |
| `narration.mjs`, `audio/` | Dormant narration assets from the previous single-set loop |
| `copy.mjs` | English/German on-screen text |
| `tests/bucket-physics.test.mjs` | Containment and separation checks |
| `tests/game-flow.test.mjs` | Eighteen outcomes, pair slots, nine judgments, export and restart |
| `tests/audio-cues.test.mjs` | Bilingual cue-to-file completeness |
| `vendor/` | Bundled Three.js 0.180.0 and license |
| `docs/research/` | Reviewed research summaries |
| `For-AI/` | Current agent guidance, gates, and decisions |

Three buckets arrive in sequence, each with three new shapes. All nine task objects use the same matte `#808080` material. Each set runs A, B, C, A+B, A+C, B+C. Pair members occupy separate slots on the widened red platform, and the detector checks only after the full subset is placed. The first two sets use a disjunctive rule and the third a conjunctive rule; A and C are hidden blickets in each set. After six trials, players judge all three objects individually. The complete local v2 JSON downloads after nine judgments, with no download button. Shape, size, trial/phase order, and response position are not counterbalanced.

Each bucket is a deep open pail. After arriving, it shakes for 1.45 seconds while its three objects collide and rattle inside; testing begins after mixing. The layout uses viewport dimensions, scene resize, coarse-pointer hit tolerance, safe-area spacing, and measured text reflow.

The detector has a dark green cubic body and broad red platform based on [original video references](machine-references.md). Its 2.7-unit platform places pair members 1.34 units apart within the well. A neutral cyan ray scans the placed subset for 3.6 seconds, followed by a 950 ms dark pause. The platform and side lamps flash gold/red for the result; the lower BLICKET label glows gold only for activation. Synthesized handling effects accompany bucket arrival and object placement, and only activation plays the tune. Sound on/off controls these effects. Next carries the tested object or pair onto the table. A neutral ring marks each judgment subject. Rule and blicket status remain scenario data, independent of appearance. Previous narrated cues are dormant until revised for pairs and multiple blickets. German wording is provisional and not validated with participants.

Scenario `functional_form_or_or_and_gray_v1` uses nine unique object IDs and the v2 session schema. Older exports have different IDs and must not be silently pooled. This repository contains reviewed public browser code and guidance, excluding the private historical source archive. It is independently editable.

## Publication

Repository: [VR-Blicket-Task-Web](https://github.com/GeorgeFejer91/VR-Blicket-Task-Web). GitHub Pages serves `main` / root at [the game](https://georgefejer91.github.io/VR-Blicket-Task-Web/). Serve locally with `python -m http.server 8878 --bind 127.0.0.1`. Verification evidence is owned by `VERIFICATION.md`.
