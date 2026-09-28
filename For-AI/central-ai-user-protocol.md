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

1. Choose English or German, then Begin. Text explains that appearance alone does not reveal blicketness; the UI does not disclose the set's AND/OR rule.
2. A new bucket arrives with three distinct gray shapes and visibly mixes them for 1.45 seconds. `phase_started`, `bucket_arrival_started`, `bucket_arrived`, `bucket_mixing_started`, and `bucket_mixed` record the transition.
3. Six trials follow in the order A, B, C, A+B, A+C, B+C. Only the prompted object can be picked up. Drag it onto the red platform, or click the object and then the platform. For a pair, place the first in the left slot and the second in the right slot; the check starts only after both contact events. `trial_started`, `object_picked_up`, and `platform_contact_detected` record the subset and placement order.
4. The platform lowers, a neutral cyan scan runs for 3.6 seconds, and a 950 ms dark pause precedes the result. Gold and an activation tune mean the full subset activated the detector; red means it stayed off. The task-object materials remain gray. `detector_outcome` and the session's trial entry include `phaseId`, `rule`, `objectIds`, and `activated`.
5. Next moves the object or pair onto the adjacent table. `object_return_started` and `object_returned_to_table` record the full subset. Repeated Next input during the move does not skip a trial.
6. After six trials, judge each of that set's three objects with Blicket/Not a Blicket buttons. A neutral ring marks the subject. The next bucket arrives after the third answer. Each response logs `phaseId`, `objectId`, and `saysBlicket`.
7. After the ninth judgment, `session_completed` and `completedAt` are recorded and a v2 session JSON downloads automatically. It contains 18 trial records and nine judgments; there is no network upload or singular point-choice question.

Restart cancels outstanding check timers and begins set 1 with a new session ID. Sound on/off controls synthesized handling and outcome effects. Only an activated detector plays the tune. Existing English/German narration clips are dormant: they describe the earlier one-set, single-object question and would misstate the pair trials. Before re-enabling speech, revise the cue inventory, regenerate and inspect the affected MP3s, and validate text/audio agreement. The previous audio pipeline instructions remain in Git history and `audio/README.md`.

Source interpretation and adaptation limits are in `scientific-context.md`; browser and publication gates are in `VERIFICATION.md`.
