export function createNarration(inventory, onSpeaking = () => {}) {
  const PAUSE_MS = 700;
  const cues = new Map(inventory.narration.map((cue) => [cue.id, cue]));
  let language = 'en';
  let enabled = true;
  let audio;
  let pending = [];
  let pauseTimer;
  let nextCueAt = 0;

  function stop() {
    pending = [];
    clearTimeout(pauseTimer);
    pauseTimer = null;
    if (audio) {
      audio.pause(); audio.currentTime = 0; audio = null;
      nextCueAt = Date.now() + PAUSE_MS;
    }
    onSpeaking(false);
  }

  function playNext(id) {
    if (!enabled || !cues.has(id) || typeof Audio === 'undefined') return;
    const wait = nextCueAt - Date.now();
    if (wait > 0) {
      pauseTimer = setTimeout(() => { pauseTimer = null; playNext(id); }, wait);
      return;
    }
    const file = cues.get(id).files[language];
    const clip = new Audio(new URL(`./audio/${file}?v=20260928g`, import.meta.url));
    audio = clip;
    clip.volume = 0.9;
    const finished = () => {
      if (audio !== clip) return;
      audio = null;
      nextCueAt = Date.now() + PAUSE_MS;
      onSpeaking(false);
      const next = pending.shift();
      if (next) playNext(next);
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
      if (queue && (audio || pauseTimer)) { pending.push(id); return; }
      stop();
      playNext(id);
    },
  };
}
