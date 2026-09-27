# Verification

Reviewed: 2026-09-27. Use VERIFIED, PARTIAL, BLOCKED, or NOT RUN; report the surface actually observed.

## Gates

1. Context: `powershell -NoProfile -File For-AI/scripts/check-context.ps1 -ProjectRoot .`. After pushing, add `-RequireRemote`; HEAD must match remote main. Required files and routing exist; secret checks pass.
2. Focused: `node --check game.js`, `node --check sounds.mjs`, and `node --test tests/*.test.mjs`. JSON parses; the three colors equal `#808080`, materials are matte, prompts/labels contain no old color names, and all trial, bucket, and response IDs resolve. Game-flow checks cover tabletop persistence, repeated Next input, restart during return and one complete serialized JSON download after the last judgment.
3. Integrated: serve the repository root over HTTP in a desktop WebGL browser. Inspect three gray objects; complete all tests, point choice, and three judgments. Verify a missed drop, contact/press, both outcome signals, sounds/mute, persistent tabletop objects, automatic download with all responses/completion event, and restart. No download button should exist. Outcomes come from `hiddenBlicket`, not appearance.
4. Publication: review explicit staged paths, push without force, verify the remote SHA and the Pages build for the public commit. Inspect hosted gray stimuli and complete the hosted flow. Publish reviewed browser code, public documentation, context, and tests only; no private archive, native source, participant data, or local artifacts.

Use installed Node/Python or the Codex bundled runtime if absent from PATH. HTTP is required for fetching scenario JSON.

## Detector, sound and automatic-download release

2026-09-27 release `669869a`: VERIFIED. Syntax, all three Node tests, and context/remote checks pass; the matching Pages build succeeded. Both the public local copy and hosted game completed the full desktop flow with click/drag placement, a missed drop, both outcomes, mute, persistent tabletop objects through every judgment/completion, and restart. Console warnings/errors were empty. The hosted final answer automatically saved a JSON file at 13:51:47 UTC; the parsed file contains the gray scenario ID, all three trials, point choice, three judgments, three table-return events, `completedAt` and one final `session_completed` event. No download button is rendered. A transient full C: drive prevented an earlier candidate download; disk space recovered and the hosted receipt supersedes that blocked attempt. Test exports and screenshots remain local and are not published.

## Evidence limits

Collision tests do not prove appearance, interaction, VR readiness, or scientific validity. Identical gray removes intentional color differences, but lighting produces shading. Full experimental validation still needs a chosen protocol, translation review and comprehension pilot, counterbalanced shape-to-cause mappings and positions/order, sampling/analysis plans, and empirical evidence. The forced single-object choice belongs only to this demo; conjunction protocols need multiple-object responses.

2026-09-27 gray release: VERIFIED. Both collision tests pass; scenario checks confirm uniform gray, neutral labels, resolved IDs, and unchanged hidden outcomes. The public release candidate completed three trials, point choice, and three judgments locally and on Pages. Local restart, missed platform drop, and a downloaded JSON with the gray scenario ID, three trials, point choice, and three judgments were checked. The Pages build for browser release `5610983` succeeded. These checks cover the published browser baseline and do not establish scientific validity.
