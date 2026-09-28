# Browser game protocol

Last updated: 2026-09-28

The current source of truth is `scenario.json` plus `game.js`. This is the minimal PC loop, not a full research protocol or a VR build.

| Stage | Prompt and 3D action | Visible result | Logged event |
| --- | --- | --- | --- |
| Language | Choose English or German, then Begin/Start | All game text and narration use the selected language | Session JSON stores `language` |
| Start | Begin the game | A deep bucket carrying three gray objects moves onto the table, then shakes for 1.45 seconds while the objects rattle and collide before the first object rises | `bucket_arrival_started`, `bucket_arrived`, `bucket_mixing_started`, `bucket_mixed` |
| Each trial | The current object rises from the bucket; put it on the detector by drag, or select it then click the platform | The platform sinks into an open well until the object's center reaches the rim; a neutral cyan ray crosses it while light washes over the whole object and bounces from the impact point during the 1,500 ms check | `trial_started`, `object_picked_up`, `platform_contact_detected` |
| Outcome | Watch the detector | The platform and side lamps blink gold and play a short tune for a hidden blicket; the lower BLICKET label glows gold only then. The platform and lamps blink red without a tune otherwise, while the label stays neutral | `detector_outcome` |
| Next | Advance after each outcome | The tested object visibly moves onto the table beside the detector before the next object rises from the bucket or the final prompt opens | `object_return_started`, `object_returned_to_table`, next `trial_started` |
| Point choice | Select one of the three lower-middle 2D object buttons | All three objects and the detector stay visible; individual questions begin | `final_point_choice_submitted` |
| Individual choices | Judge the object marked by a neutral ring using the lower-middle 2D Blicket or Not a Blicket buttons | All objects remain on the table; game completes after three responses | `final_sequential_choice_submitted` |
| Complete | Submit the third individual judgment | The session JSON download starts automatically, with all responses and the completion event; no download button or network upload | `session_completed` |

Only the current object may be tested. A drop away from the platform does not count as contact. Inputs are locked while the detector checks. The current scenario uses cube, cylinder, and rectangular block in that order, all using the same matte gray material. Both outcomes use the same descent and scan; result lights appear only afterward. The UI must not identify hidden blicket status before the detector outcome. Task-object materials remain gray throughout. No avatars or people are rendered.

## Narration assets and voice-cloner CLI

The [audio cue inventory](../audio/README.md) and `audio/cues.json` map each narration cue ID to its triggering game event, exact English/German text, and shipped MP3 files. Spoken game cues cover language selection, bucket arrival/mixing, each trial prompt, scanning, both detector outcomes, point choice, each individual question, and completion. The pickup and table-return events use handling effects and on-screen text without extra speech. The scanner lowers for 550 ms, speaks its scan cue while its neutral light crosses the object, scans until 3.6 seconds after contact, then holds 650 ms of darkness before revealing the result. Result speech waits until the 1.4-second light/tune animation has finished, plus 100 ms. Automatic transitions queue narration with at least 700 ms of silence between clips; a new player action interrupts older instructions but still observes that pause. Sound off stops voice and cancels waiting clips. Bucket rattles are spaced at least 450 ms apart and the platform press starts 160 ms after the placement tap. Missing audio must not block play. Existing session JSON event names remain stable; `language` records the selected locale.

Generate or repair assets with the sibling `voice-cloner` checkout's CLI (`../voice-cloner/Voice.cmd`), or pass `-VoiceCmd` to the script for another installation. First read that app's `AI-GUIDE.md` and `agent-contract.json`. Run `Voice.cmd doctor`, `voices list`, and `voices show <ID>` to select a saved voice. The inventory pins the Alba reference SHA-256; `tools/generate-blicket-narration.ps1` refuses a different reference. Use the Qwen engine for these shippable assets; its model is Apache 2.0 and the cataloged Alba recording is CC BY 4.0. From this repository root:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools/generate-blicket-narration.ps1 -VoiceId <saved-Alba-reference-id>
```

The script calls `Voice.cmd generate --voice <ID> --engine qwen --language en|de --text <inventory text> --output <audio path>` for each missing file and verifies the returned language against the requested locale. It reuses existing MP3s; after changing a line, pass `-CueId <cue-id> -Force` to regenerate that cue in both languages. The CLI starts or reuses its local server and returns JSON. If a job times out, use its `job_id` with `Voice.cmd jobs wait`; do not submit the same text twice. Keep references, profiles, model caches, and the app's private outputs outside this repository. Check all 32 shipped MP3s with ffprobe and local speech recognition before publication; human listening is still required before participant use because automatic checks cannot establish complete pronunciation or German translation quality.

If a future request changes prompts, object motion, detector rules, responses, or logging, update this document and the scenario/runtime together. Keep the historical native protocol in Git history; it is no longer the active specification.
