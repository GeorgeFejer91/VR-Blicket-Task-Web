# Browser game protocol

Last updated: 2026-09-29. Source of truth: `scenario.json` and `game.js`. This is a playable three-sequence adaptation, not a full research protocol or VR build.

## Sequence and evidence

| Set | Rule | New gray shapes | A | B | C | A+B | A+C | B+C |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Disjunctive | Cube, cylinder, block | + | − | + | + | + | + |
| 2 | Disjunctive | Sphere, cone, wedge | + | − | + | + | + | + |
| 3 | Conjunctive | Hexagonal prism, pyramid, capsule | − | − | − | − | + | − |

`+` means the machine activates; `−` means it stays off. A and C are the hidden blickets in every set. In the disjunctive sets either suffices; in the conjunctive set both are required. The rule is evaluated from scenario roles and the complete placed subset, never from mesh shape or material. The fixed within-session phase order is a game adaptation; Lucas et al. (2014) compared conditions between participants and tested transfer to a separate ambiguous set.

## Player flow

1. Choose English or German. A voice introduction explains that appearance alone does not reveal blicketness and that the machine can respond to objects alone or in pairs. Begin becomes available when the introduction finishes, or immediately if sound is off or audio playback fails. The UI does not disclose the set's AND/OR rule.
2. A new bucket arrives with three distinct gray shapes and visibly mixes them for 1.45 seconds. `phase_started`, `bucket_arrival_started`, `bucket_arrived`, `bucket_mixing_started`, and `bucket_mixed` record the transition.
3. Six trials follow in the order A, B, C, A+B, A+C, B+C. A short voice prompt asks for the first object and, for pairs, the second. Only the prompted object can be picked up. Drag it onto the red platform, or click the object and then the platform. Automated placement follows an eased arc above the machine rim and any object already placed, then descends into the left or right slot. The check starts only after both contact events. `trial_started`, `object_picked_up`, and `platform_contact_detected` record the subset and placement order.
4. The platform lowers, a neutral cyan scan runs for 3.6 seconds, and a 950 ms dark pause precedes the result. Gold and an activation tune mean the full subset activated the detector; red means it stayed off. The task-object materials remain gray. `detector_outcome` and the session's trial entry include `phaseId`, `rule`, `objectIds`, and `activated`.
5. Next lifts the object or pair above the machine rim and arcs it onto the adjacent table, where it remains visible. `object_return_started` and `object_returned_to_table` record the full subset. Repeated Next input during the move does not skip a trial.
6. After six trials, judge each of that set's three objects with Blicket/Not a Blicket buttons. A neutral ring marks the subject. The next bucket arrives after the third answer. Each response logs `phaseId`, `objectId`, and `saysBlicket`.
7. After the ninth judgment, `session_completed` and `completedAt` are recorded and a v2 session JSON downloads automatically. It contains 18 trial records and nine judgments; there is no network upload or singular point-choice question.

Restart cancels outstanding check timers and narration, then begins set 1 with a new session ID. Sound on/off controls voice and synthesized handling/outcome effects. Only an activated detector plays the tune. The narrator is silent during scanning, result reveal, and object return; the visual result and activation tune provide those cues. The four active bilingual voice cues and retained dormant assets are documented in `audio/README.md`.

Source interpretation and adaptation limits are in `scientific-context.md`; browser and publication gates are in `VERIFICATION.md`.
