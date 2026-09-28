export function createNarration(inventory, onSpeaking = () => {}) {
  const cues = new Map(inventory.narration.map((cue) => [cue.id, cue]));
  let language = 'en';
  let enabled = true;
  let audio;
  let pending = [];

  function stop() {
    pending = [];
    if (audio) { audio.pause(); audio.currentTime = 0; audio = null; }
    onSpeaking(false);
  }

  function playNext(id) {
    if (!enabled || !cues.has(id) || typeof Audio === 'undefined') return;
    const file = cues.get(id).files[language];
    const clip = new Audio(new URL(`./audio/${file}`, import.meta.url));
    audio = clip;
    clip.volume = 0.9;
    const finished = () => {
      if (audio !== clip) return;
      audio = null;
      const next = pending.shift();
      if (next) playNext(next);
      else onSpeaking(false);
    };
    clip.onended = finished;
    clip.onerror = finished;
    onSpeaking(true);
    clip.play().catch(finished);
  }

  return {
    stop,
    setLanguage(value) { language = value; stop(); },
    setEnabled(value) { enabled = value; if (!enabled) stop(); },
    play(id, queue = false) {
      if (queue && audio) { pending.push(id); return; }
      stop();
      playNext(id);
    },
  };
}
