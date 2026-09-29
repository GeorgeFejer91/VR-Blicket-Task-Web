import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, statSync } from 'node:fs';

test('every narrated event has distinct English and German shipped audio', () => {
  const inventory = JSON.parse(readFileSync(new URL('../audio/cues.json', import.meta.url), 'utf8'));
  const ids = new Set();
  for (const cue of inventory.narration) {
    assert.ok(cue.triggerId);
    assert.ok(!ids.has(cue.id), `duplicate cue ${cue.id}`);
    ids.add(cue.id);
    for (const language of ['en', 'de']) {
      assert.ok(cue.text[language], `${cue.id}/${language} has no script`);
      assert.match(cue.files[language], new RegExp(`^${language}/${cue.id}\\.mp3$`));
      const file = new URL(`../audio/${cue.files[language]}`, import.meta.url);
      assert.ok(statSync(file).size > 1000, `${cue.id}/${language} has no useful audio`);
    }
  }
  for (const id of ['intro', 'place_object', 'add_object', 'judge_object', 'arrival', 'mixing',
    'picked_up', 'checking', 'activated', 'inactive', 'returning', 'point', 'complete']) {
    assert.ok(ids.has(id), `missing event cue ${id}`);
  }
  for (const object of ['cube', 'column', 'block']) {
    assert.ok(ids.has(`trial_${object}`));
    assert.ok(ids.has(`judge_${object}`));
  }
});
