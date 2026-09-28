# Browser game protocol

Last updated: 2026-09-28

The current source of truth is `scenario.json` plus `game.js`. This is the minimal PC loop, not a full research protocol or a VR build.

| Stage | Prompt and 3D action | Visible result | Logged event |
| --- | --- | --- | --- |
| Language | Choose English or German, then Begin/Start | All game text and narration use the selected language | Session JSON stores `language` |
| Start | Begin the game | A deep bucket carrying three gray objects moves onto the table, then shakes for 1.45 seconds while the objects rattle and collide before the first object rises | `bucket_arrival_started`, `bucket_arrived`, `bucket_mixing_started`, `bucket_mixed` |
| Each trial | The current object rises from the bucket; put it on the detector by drag, or select it then click the platform | The platform sinks into an open well until the object's center reaches the rim; a neutral cyan ray sweeps across its visible half during the 1,500 ms check | `trial_started`, `object_picked_up`, `platform_contact_detected` |
| Outcome | Watch the detector | The platform, side lamps and large BLICKET sign frame blink gold and play a short tune for a hidden blicket; they blink red without an activation tune otherwise | `detector_outcome` |
| Next | Advance after each outcome | The tested object visibly moves onto the table beside the detector before the next object rises from the bucket or the final prompt opens | `object_return_started`, `object_returned_to_table`, next `trial_started` |
| Point choice | Select one of the three lower-middle 2D object buttons | All three objects and the detector stay visible; individual questions begin | `final_point_choice_submitted` |
| Individual choices | Judge the object marked by a neutral ring using the lower-middle 2D Blicket or Not a Blicket buttons | All objects remain on the table; game completes after three responses | `final_sequential_choice_submitted` |
| Complete | Submit the third individual judgment | The session JSON download starts automatically, with all responses and the completion event; no download button or network upload | `session_completed` |

Only the current object may be tested. A drop away from the platform does not count as contact. Inputs are locked while the detector checks. The current scenario uses cube, cylinder, and rectangular block in that order, all using the same matte gray material. Both outcomes use the same descent and scan; result lights appear only afterward. The UI must not identify hidden blicket status before the detector outcome. Task-object materials remain gray throughout. No avatars or people are rendered.

## Narration assets and voice-cloner CLI

The [audio cue inventory](../audio/README.md) and `audio/cues.json` map each narration cue ID to its triggering game event, exact English/German text, and shipped MP3 files. Event narration covers language selection, bucket arrival/mixing, each trial prompt, pickup, contact/checking, both detector outcomes, return, point choice, each individual question, and completion. Automatic transitions queue narration; a new player action interrupts older instructions. Sound off stops voice and effects. Missing audio must not block play. Existing session JSON event names remain stable; `language` records the selected locale.

Generate or repair assets with the sibling `voice-cloner` checkout's CLI (`../voice-cloner/Voice.cmd`), or pass `-VoiceCmd` to the script for another installation. First read that app's `AI-GUIDE.md` and `agent-contract.json`. Run `Voice.cmd doctor`, `voices list`, and `voices show <ID>` to select a saved voice. The inventory pins the Alba reference SHA-256; `tools/generate-blicket-narration.ps1` refuses a different reference. Use the Qwen engine for these shippable assets; its model is Apache 2.0 and the cataloged Alba recording is CC BY 4.0. From this repository root:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools/generate-blicket-narration.ps1 -VoiceId <saved-Alba-reference-id>
```

The script calls `Voice.cmd generate --voice <ID> --engine qwen --language en|de --text <inventory text> --output <audio path>` for each missing file. It reuses existing MP3s; after changing a line, pass `-CueId <cue-id> -Force` to regenerate that cue in both languages. The CLI starts or reuses its local server and returns JSON. If a job times out, use its `job_id` with `Voice.cmd jobs wait`; do not submit the same text twice. Keep references, profiles, model caches, and the app's private outputs outside this repository. Check all 32 shipped MP3s with ffprobe and local speech recognition before publication; human listening is still required before participant use because automatic checks cannot establish complete pronunciation or German translation quality.

If a future request changes prompts, object motion, detector rules, responses, or logging, update this document and the scenario/runtime together. Keep the historical native protocol in Git history; it is no longer the active specification.
