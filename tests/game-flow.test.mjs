import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import vm from 'node:vm';
import * as THREE from '../vendor/three.module.min.js';
import { stepBucketBodies } from '../bucket-physics.mjs';
import { copy, objectName } from '../copy.mjs';

test('OR, OR, AND sequences use distinct gray sets and accept two separate placements', async () => {
  const fixture = JSON.parse(readFileSync(new URL('../scenario.json', import.meta.url), 'utf8'));
  assert.deepEqual(fixture.phases.map((phase) => phase.rule), ['disjunctive', 'disjunctive', 'conjunctive']);
  const specs = fixture.phases.flatMap((phase) => phase.objects);
  assert.equal(new Set(specs.map((spec) => spec.id)).size, 9);
  assert.equal(new Set(specs.map((spec) => spec.visible.shape)).size, 9);
  assert.ok(specs.every((spec) => spec.visible.color === '#808080' && spec.visible.material === 'matte'));

  const elements = new Map();
  const downloads = [];
  const effects = [];
  const spoken = [];
  let downloadBlob;
  const context = vm.createContext({
    THREE, stepBucketBodies, copy, objectName, console, performance, Blob, crypto: { randomUUID },
    URL: { createObjectURL(blob) { downloadBlob = blob; return 'blob:session'; }, revokeObjectURL() {} },
    setTimeout: () => 1, clearTimeout() {},
    createSounds: () => ({ unlock() {}, stop() {}, play: (effect) => effects.push(effect) }),
    document: {
      createElement(tag) {
        assert.equal(tag, 'a');
        return { click() { downloads.push({ filename: this.download, blob: downloadBlob }); } };
      },
      getElementById(id) {
        if (!elements.has(id)) elements.set(id, { setAttribute() {}, focus() {} });
        return elements.get(id);
      },
    },
  });
  const source = readFileSync(new URL('../game.js', import.meta.url), 'utf8')
    .replace(/^import .*;\r?\n/gm, '')
    .replace(/boot\(\)\.catch\(\(error\) => \{[\s\S]*?\n\}\);/, '');
  vm.runInContext(source, context);
  const run = (code) => vm.runInContext(code, context);
  context.fixture = fixture;
  context.spoken = spoken;
  run(`
    scenario = fixture;
    scene = new THREE.Scene();
    machine = new THREE.Group(); machine.position.copy(DETECTOR);
    bucket = new THREE.Group(); scene.add(machine, bucket);
    platform = box(2.7, 0.18, 2, '#c9443c'); machine.add(platform);
    signFrame = box(2.98, 0.36, 0.045, '#24352f');
    machineLabel = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.2), new THREE.MeshBasicMaterial());
    labelLight = new THREE.PointLight('#ffd178', 0, 1.8);
    resultLamps = [box(0.11, 0.75, 0.035, '#24352f')];
    scanBeam = new THREE.Group(); scanBeam.position.z = 0.18;
    scanBounce = new THREE.Group(); machine.add(scanBounce);
    scanFloodLight = new THREE.PointLight('#82fff1', 0, 2.5); machine.add(scanFloodLight);
    judgmentMarker = new THREE.Group(); scene.add(judgmentMarker);
    renderer = { render() {} };
    for (const spec of scenario.phases.flatMap(phase => phase.objects)) {
      const mesh = makeObject(spec);
      mesh.userData.objectId = spec.id;
      mesh.userData.bucketRadius = 0.4;
      objects.set(spec.id, mesh);
    }
    narration = { stop() {}, play(id) { spoken.push(id); } };
    start();
  `);
  const expected = [
    [true, false, true, true, true, true],
    [true, false, true, true, true, true],
    [false, false, false, false, true, false],
  ];
  for (let phaseIndex = 0; phaseIndex < 3; phaseIndex += 1) {
    assert.equal(run('stage'), 'arrival');
    run('for (let frame = 0; frame < 205; frame += 1) animate(lastFrame + 20);');
    assert.equal(run('stage'), 'ready');
    assert.equal(run('phaseIndex'), phaseIndex);
    for (let trialIndex = 0; trialIndex < 6; trialIndex += 1) {
      const ids = fixture.evidenceOrder[trialIndex].map((role) => fixture.phases[phaseIndex].objects.find((o) => o.role === role).id);
      for (let placement = 0; placement < ids.length; placement += 1) {
        assert.equal(run('stage'), 'ready');
        assert.equal(run('currentObject.userData.objectId'), ids[placement]);
        run('stage = "held"; placeObject();');
        assert.equal(run('stage'), 'placing');
        assert.equal(run('placedObjects.length'), placement);
        run('for (let frame = 0; frame < 23; frame += 1) animate(lastFrame + 20);');
        assert.ok(run('currentObject.position.y - objectHalfHeight(currentObject) > MACHINE_RIM_TOP'));
        run('for (let frame = 0; frame < 23; frame += 1) animate(lastFrame + 20);');
        if (placement + 1 < ids.length) {
          assert.equal(run('stage'), 'presenting');
          assert.equal(run('placedObjects.length'), 1);
          run('for (let frame = 0; frame < 42; frame += 1) animate(lastFrame + 20);');
        }
      }
      assert.equal(run('stage'), 'checking');
      assert.equal(run('placedObjects.length'), ids.length);
      if (ids.length === 2) {
        assert.ok(run('placedObjects[0].position.x < DETECTOR.x && placedObjects[1].position.x > DETECTOR.x'));
        assert.ok(run('placedObjects.every(object => overPlatform(object.position, object))'));
        assert.ok(run('placedObjects[1].position.x - placedObjects[0].position.x >= 1.3'));
      }
      run('showOutcome();');
      assert.equal(run('session.trials.at(-1).activated'), expected[phaseIndex][trialIndex]);
      assert.deepEqual(Array.from(run('session.trials.at(-1).objectIds')), ids);
      run('advance(); for (let frame = 0; frame < 24; frame += 1) animate(lastFrame + 20);');
      assert.ok(run('placedObjects.every(object => object.position.y - objectHalfHeight(object) > MACHINE_RIM_TOP)'));
      run('for (let frame = 0; frame < 78; frame += 1) animate(lastFrame + 20);');
      assert.equal(run('stage'), trialIndex < 5 ? 'ready' : 'judge');
    }
    for (let judgment = 0; judgment < 3; judgment += 1) {
      run('submitJudgment(true);');
    }
  }
  assert.equal(run('stage'), 'complete');
  assert.equal(run('session.trials.length'), 18);
  assert.equal(run('session.judgments.length'), 9);
  assert.equal(effects.filter((effect) => effect === 'activate').length, 11);
  assert.equal(spoken.filter((id) => id === 'place_object').length, 18);
  assert.equal(spoken.filter((id) => id === 'add_object').length, 9);
  assert.equal(spoken.filter((id) => id === 'judge_object').length, 9);
  assert.equal(downloads.length, 1);
  const exported = JSON.parse(await downloads[0].blob.text());
  assert.equal(exported.schema, 'vr_blicket_task.web_session.v2');
  assert.deepEqual(exported.trials.map((trial) => trial.activated), expected.flat());
  assert.equal(exported.events.filter((event) => event.type === 'phase_started').length, 3);
  run('start();');
  assert.equal(run('phaseIndex'), 0);
  assert.equal(run('session.trials.length'), 0);
});
