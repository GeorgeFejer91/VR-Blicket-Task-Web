# Audio cue inventory

`cues.json` is the machine-readable inventory. Each narration cue has a stable ID, triggering game event, English and German script, and two shipped MP3 paths. The game loads these files; it never calls the voice-cloner app at runtime.

| Cue ID | Trigger ID | English file | German file |
| --- | --- | --- | --- |
| `intro` | `language_selected` | `en/intro.mp3` | `de/intro.mp3` |
| `arrival` | `bucket_arrival_started` | `en/arrival.mp3` | `de/arrival.mp3` |
| `mixing` | `bucket_mixing_started` | `en/mixing.mp3` | `de/mixing.mp3` |
| `trial_cube` | `trial_started:obj_cube` | `en/trial_cube.mp3` | `de/trial_cube.mp3` |
| `trial_column` | `trial_started:obj_column` | `en/trial_column.mp3` | `de/trial_column.mp3` |
| `trial_block` | `trial_started:obj_block` | `en/trial_block.mp3` | `de/trial_block.mp3` |
| `picked_up` | `object_picked_up` | `en/picked_up.mp3` | `de/picked_up.mp3` |
| `checking` | `platform_contact_detected` | `en/checking.mp3` | `de/checking.mp3` |
| `activated` | `detector_outcome:true` | `en/activated.mp3` | `de/activated.mp3` |
| `inactive` | `detector_outcome:false` | `en/inactive.mp3` | `de/inactive.mp3` |
| `returning` | `object_return_started` | `en/returning.mp3` | `de/returning.mp3` |
| `point` | `final_point_prompt_opened` | `en/point.mp3` | `de/point.mp3` |
| `judge_cube` | `final_sequential_prompt_opened:obj_cube` | `en/judge_cube.mp3` | `de/judge_cube.mp3` |
| `judge_column` | `final_sequential_prompt_opened:obj_column` | `en/judge_column.mp3` | `de/judge_column.mp3` |
| `judge_block` | `final_sequential_prompt_opened:obj_block` | `en/judge_block.mp3` | `de/judge_block.mp3` |
| `complete` | `session_completed` | `en/complete.mp3` | `de/complete.mp3` |

Sound effects (`rattle`, `land`, `pickup`, `place`, `press`, `activate`, `return`, `choice`, `complete`) are synthesized by `sounds.mjs` at runtime and shared between languages. They have no audio files; `cues.json` lists their triggers. The activation tune plays only for an activating object. Pickup and return have authored voice files in the inventory but the game now uses only handling effects for those routine actions, leaving space around the scan and result lines. Sound off mutes both narration and effects.

Voice: Qwen3-TTS 1.7B Base with a saved reference to [Alba MacKenna's Kyutai tts-voices recording](https://huggingface.co/kyutai/tts-voices/blob/main/alba-mackenna/casual.wav), cataloged under CC BY 4.0. Audio is AI-generated speech, and the voice reference is credited here. The model and reference hash are recorded in `cues.json`. German wording is a provisional adaptation and has not been validated with participants.
