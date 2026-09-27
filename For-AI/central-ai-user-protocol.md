# Browser game protocol

Last updated: 2026-09-27

The current source of truth is `scenario.json` plus `game.js`. This is the minimal PC loop, not a full research protocol or a VR build.

| Stage | Prompt and 3D action | Visible result | Logged event |
| --- | --- | --- | --- |
| Start | Begin the game | One bucket carrying three objects moves onto the table; objects rattle and collide inside it | `bucket_arrival_started`, `bucket_arrived` |
| Each trial | The current object rises from the bucket; put it on the detector by drag, or select it then click the platform | Machine and platform depress; detector checks for 900 ms | `trial_started`, `object_picked_up`, `platform_contact_detected` |
| Outcome | Watch the detector | Platform blinks gold and plays a short tune for a hidden blicket; platform blinks red without an activation tune otherwise | `detector_outcome` |
| Next | Advance after each outcome | The tested object visibly moves onto the table beside the detector before the next object rises from the bucket or the final prompt opens | `object_returned_to_table`, next `trial_started` |
| Point choice | Click the one tabletop object believed to be a blicket | All three objects and the detector stay visible; individual questions begin | `final_point_choice_submitted` |
| Individual choices | Judge the object marked by a neutral ring using the 3D Blicket or Not a Blicket pad | All objects remain on the table; game completes after three responses | `final_sequential_choice_submitted` |
| Complete | Submit the third individual judgment | The session JSON download starts automatically, with all responses and the completion event; no download button or network upload | `session_completed` |

Only the current object may be tested. A drop away from the platform does not count as contact. Inputs are locked while the detector checks. The current scenario uses cube, cylinder, and rectangular block in that order, all using the same matte gray material. Both outcomes use the same physical checking motion; blink color conveys the result only afterward. The UI must not identify hidden blicket status before the detector outcome. Task-object materials remain gray throughout. No avatars or people are rendered.

If a future request changes prompts, object motion, detector rules, responses, or logging, update this document and the scenario/runtime together. Keep the historical native protocol in Git history; it is no longer the active specification.
