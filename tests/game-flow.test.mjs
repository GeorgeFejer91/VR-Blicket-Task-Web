import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import vm from 'node:vm';
import * as THREE from '../vendor/three.module.min.js';
import { stepBucketBodies } from '../bucket-physics.mjs';

test('objects persist and a complete session downloads once after the final judgment', async () => {
  const elements = new Map();
  const effects = [];
  const downloads = [];
  let downloadBlob;
  const context = vm.createContext({
    THREE, stepBucketBodies, console, performance, Blob, crypto: { randomUUID },
    URL: { createObjectURL(blob) { downloadBlob = blob; return 'blob:session'; }, revokeObjectURL() {} },
    setTimeout: () => 1, clearTimeout() {},
    createSounds: () => ({ unlock() {}, stop() {}, play: (effect) => effects.push(effect) }),
    document: { createElement(tag) {
      assert.equal(tag, 'a');
      return { click() { downloads.push({ filename: this.download, blob: downloadBlob }); } };
    }, getElementById(id) {
      if (!elements.has(id)) elements.set(id, { setAttribute() {} });
      return elements.get(id);
    } },
  });
  const source = readFileSync(new URL('../game.js', import.meta.url), 'utf8')
    .replace(/^import .*;\r?\n/gm, '')
    .replace(/boot\(\)\.catch\(\(error\) => \{[\s\S]*?\n\}\);/, '');
  vm.runInContext(source, context);
  const run = (code) => vm.runInContext(code, context);
  context.fixture = JSON.parse(readFileSync(new URL('../scenario.json', import.meta.url), 'utf8'));
  run(`
    scenario = fixture;
    scene = new THREE.Scene();
    machine = new THREE.Group();
    bucket = new THREE.Group();
    platform = box(2.2, 0.18, 1.44, '#c9443c');
    choicePads = new THREE.Group();
    judgmentMarker = new THREE.Group();
    scene.add(machine, bucket);
    renderer = { render() {} };
    for (const spec of scenario.objects) {
      const mesh = makeObject(spec);
      mesh.userData.objectId = spec.id;
      mesh.userData.bucketRadius = { cube: 0.44, column: 0.38, block: 0.53 }[spec.visible.shape];
      objects.set(spec.id, mesh);
    }
    start();
    for (let time = 0; time <= 3000; time += 20) animate(time);
  `);
  assert.equal(run('stage'), 'ready');
  assert.equal(run('overPlatform(DETECTOR, currentObject)'), true);
  assert.equal(run('overPlatform(new THREE.Vector3(DETECTOR.x + 2, 0, DETECTOR.z), currentObject)'), false);
  for (let index = 0; index < 3; index += 1) {
    run('stage = "held"; placeObject(); showOutcome();');
    assert.equal(run('stage'), 'outcome');
    assert.equal(run('session.trials.at(-1).activated'), index === 0);
    run('advance();');
    assert.equal(run('stage'), 'returning');
    assert.equal(run('currentObject.visible'), true);
    // Repeated Next input during motion must not skip a trial.
    run('advance(); for (let frame = 0; frame < 75; frame += 1) animate(lastFrame + 20);');
    assert.equal(run('stage'), index < 2 ? 'ready' : 'point');
    if (index < 2) {
      context.previousId = context.fixture.trialOrder[index].objectId;
      assert.equal(run('clickable({ objectId: previousId })'), false);
      assert.equal(run('clickable({ objectId: currentObject.userData.objectId })'), true);
    }
    for (let tested = 0; tested <= index; tested += 1) {
      context.testedId = context.fixture.trialOrder[tested].objectId;
      assert.equal(run('objects.get(testedId).visible'), true);
      assert.equal(run('objects.get(testedId).parent === scene'), true);
      assert.ok(run('objects.get(testedId).position.distanceTo(tablePosition(objects.get(testedId)))') < 1e-8);
    }
  }
  assert.equal(effects.filter((effect) => effect === 'activate').length, 1);
  assert.equal(run('session.events.filter(event => event.type === "object_returned_to_table").length'), 3);
  run('submitPoint(scenario.objects[0].id);');
  assert.equal(downloads.length, 0);
  for (let index = 0; index < 3; index += 1) {
    assert.equal(downloads.length, 0);
    assert.equal(run('stage'), 'judge');
    assert.equal(run('[...objects.values()].every(object => object.visible)'), true);
    run(`submitJudgment(${index === 0});`);
  }
  assert.equal(run('stage'), 'complete');
  assert.equal(run('session.judgments.length'), 3);
  assert.equal(run('[...objects.values()].every(object => object.visible)'), true);
  assert.equal(downloads.length, 1);
  assert.equal(downloads[0].filename, `blicket-session-${run('session.sessionId')}.json`);
  const exported = JSON.parse(await downloads[0].blob.text());
  assert.equal(exported.schema, 'vr_blicket_task.web_session.v1');
  assert.equal(exported.scenarioId, context.fixture.scenarioId);
  assert.equal(exported.trials.length, 3);
  assert.equal(exported.judgments.length, 3);
  assert.equal(exported.finalPointObjectId, context.fixture.objects[0].id);
  assert.ok(exported.completedAt);
  assert.equal(exported.events.at(-1).type, 'session_completed');
  run('complete();');
  assert.equal(downloads.length, 1);
  run('start();');
  assert.equal(downloads.length, 1);
  assert.equal(run('session.trials.length'), 0);
  assert.equal(run('[...objects.values()].every(object => object.visible && object.parent === bucket)'), true);
  assert.equal(run('judgmentMarker.visible'), false);
  run(`
    for (let frame = 0; frame < 150; frame += 1) animate(lastFrame + 20);
    stage = 'held'; placeObject(); showOutcome(); advance();
    start();
    for (let frame = 0; frame < 150; frame += 1) animate(lastFrame + 20);
  `);
  assert.equal(run('stage'), 'ready');
  assert.equal(run('trialIndex'), 0);
  assert.equal(run('session.trials.length'), 0);
});
