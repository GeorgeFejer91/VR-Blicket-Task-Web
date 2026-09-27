# Decisions

## 2026-09-27: Original-video detector, persistent objects and automatic download

Status: accepted. The detector follows the dark box and broad red top seen in original Berkeley and UW I-LABS videos; provenance and adaptation limits are in `machine-references.md`. Web Audio supplies handling effects, a hidden-cause activation tune, neutral response/completion cues and a mute control. The model and tune are game adaptations rather than exact apparatus reproductions.

After each outcome, Next visibly moves the tested object onto the adjacent table. Objects stay there through all questions and completion, with a neutral ring identifying each judgment subject. Completed moves log `object_returned_to_table`. Gray materials and hidden causal data are preserved.

The user's final individual answer automatically downloads one completed session JSON. There is no download button. `completedAt` and `session_completed` are recorded before serialization; repeated completion does not export twice, and an unfinished restart does not export. `tests/game-flow.test.mjs` covers object persistence, return/restart behavior and the actual serialized Blob contents. Browser/release evidence belongs in `VERIFICATION.md`.

## 2026-09-27: Gray stimuli and public development guidance

Status: accepted. All task objects share matte `#808080`; neutral labels and IDs remove the old color references. A new scenario ID identifies the changed stimulus set. Shape/order assignments stay fixed for this demo, and require counterbalancing for research.

The current for-ai initiator baseline is adopted with project, skills, workflow, verification, decisions, and context checker. Public research notes explain terminology, shape precedents, and evidence limits. Private correspondence and historical source archives are excluded.

## 2026-09-24: Browser prototype

Status: accepted. A static Three.js browser game uses one shared moving bucket, object collisions, detector contact/press, gold/red feedback, point choice, per-object judgments, and local session export. GitHub Pages is the release surface; no VR or scientific-validity claim is implied.
