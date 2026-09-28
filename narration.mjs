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

  function playNext(id, onDone) {
    if (!enabled || !cues.has(id) || typeof Audio === 'undefined') { onDone?.(); return; }
    const wait = nextCueAt - Date.now();
    if (wait > 0) {
      pauseTimer = setTimeout(() => { pauseTimer = null; playNext(id, onDone); }, wait);
      return;
    }
    const file = cues.get(id).files[language];
    const clip = new Audio(new URL(`./audio/${file}?v=20260928i`, import.meta.url));
    audio = clip;
    clip.volume = 0.9;
    const finished = () => {
      if (audio !== clip) return;
      audio = null;
      nextCueAt = Date.now() + PAUSE_MS;
      onSpeaking(false);
      onDone?.();
      const next = pending.shift();
      if (next) playNext(next.id, next.onDone);
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
    play(id, queue = false, onDone) {
      if (queue && (audio || pauseTimer)) { pending.push({ id, onDone }); return; }
      stop();
      playNext(id, onDone);
    },
  };
}
