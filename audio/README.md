# Audio cue inventory

`cues.json` inventories the English and German MP3s. The current OR/OR/AND game plays only `intro`, `place_object`, `add_object`, and `judge_object`. The introduction explains blicketness and waits for the recording to finish before Begin is enabled. The placement and judgment cues give the next action; scanning and outcomes remain silent apart from the detector's sound effects. The other entries are retained from the previous single-set game as source assets and are not triggered because their wording would misstate pair trials or multiple blickets. The game never calls the voice-cloner app at runtime.

| Cue ID | Trigger ID | English file | German file |
| --- | --- | --- | --- |
| `intro` | `language_selected` | `en/intro.mp3` | `de/intro.mp3` |
| `place_object` | `placement_ready:first` | `en/place_object.mp3` | `de/place_object.mp3` |
| `add_object` | `placement_ready:second` | `en/add_object.mp3` | `de/add_object.mp3` |
| `judge_object` | `final_sequential_prompt_opened` | `en/judge_object.mp3` | `de/judge_object.mp3` |
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

Sound effects (`rattle`, `land`, `pickup`, `place`, `press`, `activate`, `return`, `choice`, `complete`) are synthesized by `sounds.mjs` at runtime and shared between languages. They have no audio files. The activation tune plays only for an activating subset. Sound off mutes both effects and narration. Voice cues leave at least 700 ms of silence between clips; placement interrupts an unfinished prompt so it cannot talk over the action.

Voice: Qwen3-TTS 1.7B Base with a saved reference to [Alba MacKenna's Kyutai tts-voices recording](https://huggingface.co/kyutai/tts-voices/blob/main/alba-mackenna/casual.wav), cataloged under CC BY 4.0. Audio is AI-generated speech, and the voice reference is credited here. The model and reference hash are recorded in `cues.json`. German wording is a provisional adaptation and has not been validated with participants.
