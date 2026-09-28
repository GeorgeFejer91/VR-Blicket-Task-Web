# Project

Reviewed: 2026-09-27.

## Purpose and scope

A public PC browser game lets players discover which object activates a detector. It is a prototype, not a validated research instrument. The game offers English and German text and narration. VR and new causal protocol families are deferred; no backend, account, or session upload exists.

## Architecture

| Path | Responsibility |
| --- | --- |
| `index.html`, `styles.css` | Desktop page and prompts |
| `game.js` | Three.js scene, bucket motion, interaction, feedback, judgments, local export |
| `scenario.json` | Three gray stimuli and hidden outcomes |
| `bucket-physics.mjs` | Bounded collisions |
| `sounds.mjs` | Synthesized bucket/handling effects, activation tune, mute control |
| `text-layout.mjs` | Measured text sizing for narrow and translated controls |
| `narration.mjs`, `audio/` | English/German narration playback, cue inventory and MP3 assets |
| `copy.mjs` | English/German on-screen text |
| `tests/bucket-physics.test.mjs` | Containment and separation checks |
| `tests/game-flow.test.mjs` | Persistent objects, decisions, restart and automatic JSON export |
| `tests/audio-cues.test.mjs` | Bilingual cue-to-file completeness |
| `vendor/` | Bundled Three.js 0.180.0 and license |
| `docs/research/` | Reviewed research summaries |
| `For-AI/` | Current agent guidance, gates, and decisions |

One bucket carries a cube, cylinder, and rectangular block. All use matte `#808080`; each is tested once. Contact lowers the platform into the detector and a neutral ray scans the object; gold then indicates activation and red non-activation. The cube is the demo cause. Players pick one object with a lower-middle 2D button, then judge each with 2D buttons. The complete local JSON downloads automatically after the final answer, with no download button. Shape, size, order, and response position are not counterbalanced.

The bucket is a deep open pail. After arriving, it visibly shakes for 1.45 seconds while the three objects collide and rattle inside; the first trial begins only after mixing. The same loop adapts to phone portrait and landscape through viewport dimensions, scene resize, coarse-pointer hit tolerance, safe-area spacing, and measured text reflow. Device behavior follows available screen and input capabilities rather than user-agent names.

The detector has a dark green cubic body and broad square red platform based on [original video references](machine-references.md). The raised upper handle is gone; the BLICKET label sits on the lower front panel. The platform sinks until half of the tested object enters the well, then a cyan ray scans its exposed face. Cyan light washes over the whole object, with an impact spot and short reflected rays where the scan hits; these effects do not signal causal status. The 3.6-second scan ends before a 950 ms dark pause and the result reveal. At the outcome the platform and side lamps flash gold/red, while the lower BLICKET label glows gold only for an activating object. Synthesized handling effects accompany bucket arrival and object placement; only activation plays the detector tune. The introduction explains Blicketness, then spoken cues only direct each placement and ask for final choices. Motion, lights, effects and on-screen text convey bucket, scan, result, return and completion without voice commentary. Sound on/off controls effects and narration. Narrated cues have a short pause between them; bucket rattles are less frequent, and the platform press follows its placement tap. Next carries each tested object onto the adjacent table before advancing and logs `object_returned_to_table`. All objects remain visible through final judgments and completion; a neutral ring marks the current judgment subject. Hidden outcomes remain scenario data, independent of appearance. German wording is provisional and not validated with participants.

Scenario `v1_gray_object_types` uses `obj_cube`, `obj_column`, `obj_block`. Older colored exports have different IDs and must not be silently pooled. This repository contains reviewed public browser code and guidance, excluding the private historical source archive. It is independently editable.

## Publication

Repository: [VR-Blicket-Task-Web](https://github.com/GeorgeFejer91/VR-Blicket-Task-Web). GitHub Pages serves `main` / root at [the game](https://georgefejer91.github.io/VR-Blicket-Task-Web/). Serve locally with `python -m http.server 8878 --bind 127.0.0.1`. Verification evidence is owned by `VERIFICATION.md`.
