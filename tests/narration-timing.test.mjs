import assert from 'node:assert/strict';
import test from 'node:test';
import { createNarration } from '../narration.mjs';

test('narration leaves a pause between cues and cancels waiting speech when muted', (t) => {
  let now = 0;
  let timerId = 0;
  const timers = new Map();
  const clips = [];
  const starts = [];
  const previousAudio = globalThis.Audio;
  t.after(() => { globalThis.Audio = previousAudio; });
  t.mock.method(Date, 'now', () => now);
  t.mock.method(globalThis, 'setTimeout', (callback, delay) => {
    const id = ++timerId;
    timers.set(id, { at: now + delay, callback });
    return id;
  });
  t.mock.method(globalThis, 'clearTimeout', (id) => timers.delete(id));
  globalThis.Audio = class {
    constructor() { clips.push(this); }
    play() { starts.push(now); return Promise.resolve(); }
    pause() { this.paused = true; }
  };
  const advance = (milliseconds) => {
    now += milliseconds;
    for (const [id, timer] of [...timers]) {
      if (timer.at <= now) { timers.delete(id); timer.callback(); }
    }
  };
  const inventory = { narration: ['arrival', 'mixing', 'trial'].map((id) => ({
    id, files: { en: `${id}.mp3` },
  })) };
  const narration = createNarration(inventory);

  narration.play('arrival');
  assert.deepEqual(starts, [0]);
  narration.play('mixing', true);
  now = 100;
  clips[0].onended();
  advance(699);
  assert.deepEqual(starts, [0]);
  advance(1);
  assert.deepEqual(starts, [0, 800]);

  now = 850;
  narration.play('trial');
  assert.equal(clips[1].paused, true);
  advance(699);
  assert.deepEqual(starts, [0, 800]);
  narration.setEnabled(false);
  advance(100);
  assert.deepEqual(starts, [0, 800]);
  narration.setEnabled(true);
  narration.play('trial');
  assert.deepEqual(starts, [0, 800, 1649]);
});

test('introduction completion releases Begin, including when audio is unavailable', (t) => {
  const previousAudio = globalThis.Audio;
  t.after(() => { globalThis.Audio = previousAudio; });
  let clip;
  globalThis.Audio = class {
    constructor() { clip = this; }
    play() { return Promise.resolve(); }
    pause() {}
  };
  const narration = createNarration({ narration: [{ id: 'intro', files: { en: 'en/intro.mp3' } }] });
  let completed = 0;
  narration.play('intro', false, () => { completed += 1; });
  assert.equal(completed, 0);
  clip.onended();
  assert.equal(completed, 1);
  narration.setEnabled(false);
  narration.play('intro', false, () => { completed += 1; });
  assert.equal(completed, 2);
});
