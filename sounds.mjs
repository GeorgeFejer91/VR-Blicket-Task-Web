// Small, locally synthesized effects; no audio downloads or dependencies.
export function createSounds() {
  let context;
  let output;
  let enabled = true;
  let voiceActive = false;
  const sources = new Set();

  function unlock() {
    if (!enabled) return;
    try {
      const Audio = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!Audio) return;
      if (!context) {
        context = new Audio();
        output = context.createGain();
        output.gain.value = voiceActive ? 0.18 : 0.55;
        output.connect(context.destination);
      }
      context.resume().catch(() => {});
    } catch { /* The game can still be played without audio. */ }
  }

  function stop() {
    for (const source of sources) source.stop();
    sources.clear();
  }

  function tone(frequency, duration, volume, delay = 0, endFrequency = frequency) {
    if (!enabled || !context || context.state !== 'running') return;
    const at = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, at);
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, at + duration);
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(volume, at + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, at + duration);
    oscillator.connect(gain).connect(output);
    sources.add(oscillator);
    oscillator.onended = () => { sources.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(at);
    oscillator.stop(at + duration + 0.02);
  }

  function tap(volume = 0.15) {
    tone(190, 0.09, volume, 0, 65);
    tone(780, 0.035, volume * 0.3, 0, 230);
  }

  return {
    unlock,
    stop,
    setVoiceActive(active) {
      voiceActive = active;
      if (output && context) output.gain.setTargetAtTime(active ? 0.18 : 0.55, context.currentTime, 0.04);
    },
    toggle() {
      enabled = !enabled;
      if (!enabled) stop();
      else unlock();
      return enabled;
    },
    play(effect) {
      switch (effect) {
        case 'rattle': tap(0.07); break;
        case 'land': tap(0.24); break;
        case 'pickup': tone(290, 0.1, 0.09, 0, 450); break;
        case 'place': tap(0.22); break;
        case 'press': tone(95, 0.18, 0.12, 0.16, 55); break;
        case 'return': tap(0.17); break;
        case 'choice': tone(420, 0.075, 0.09); break;
        case 'activate':
          [523.25, 659.25, 783.99, 659.25, 1046.5].forEach((note, index) =>
            tone(note, 0.23, 0.15, index * 0.22));
          break;
        case 'complete':
          tone(440, 0.16, 0.09);
          tone(554.37, 0.22, 0.09, 0.16);
          break;
      }
    },
  };
}
