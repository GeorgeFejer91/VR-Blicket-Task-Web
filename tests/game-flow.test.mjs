import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import vm from 'node:vm';
import * as THREE from '../vendor/three.module.min.js';
import { stepBucketBodies } from '../bucket-physics.mjs';
import { copy, objectName } from '../copy.mjs';

test('objects persist and a complete session downloads once after the final judgment', async () => {
  const elements = new Map();
  const effects = [];
  const downloads = [];
  let downloadBlob;
  const context = vm.createContext({
    THREE, stepBucketBodies, copy, objectName, console, performance, Blob, crypto: { randomUUID },
    URL: { createObjectURL(blob) { downloadBlob = blob; return 'blob:session'; }, revokeObjectURL() {} },
    setTimeout: () => 1, clearTimeout() {},
    createSounds: () => ({ unlock() {}, stop() {}, play: (effect) => effects.push(effect) }),
    document: { createElement(tag) {
      assert.equal(tag, 'a');
      return { click() { downloads.push({ filename: this.download, blob: downloadBlob }); } };
    }, getElementById(id) {
      if (!elements.has(id)) elements.set(id, { setAttribute() {}, focus() {} });
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
    machine.position.copy(DETECTOR);
    bucket = new THREE.Group();
    platform = box(2.2, 0.18, 1.44, '#c9443c');
    signFrame = box(2.13, 0.36, 0.045, '#24352f');
    machineLabel = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.2), new THREE.MeshBasicMaterial());
    labelLight = new THREE.PointLight('#ffd178', 0, 1.8);
    resultLamps = [box(0.11, 0.75, 0.035, '#24352f')];
    scanBeam = new THREE.Group();
    scanBeam.position.z = 0.18;
    scanBounce = new THREE.Group();
    machine.add(scanBounce);
    scanFloodLight = new THREE.PointLight('#82fff1', 0, 2.5);
    machine.add(scanFloodLight);
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
    for (let time = 0; time <= 2100; time += 20) animate(time);
  `);
  assert.equal(run('stage'), 'mixing');
  assert.equal(run('session.language'), 'en');
  assert.equal(run('session.trials.length'), 0);
  assert.ok(run('bucket.rotation.x !== 0 || bucket.rotation.z !== 0'));
  assert.equal(run('session.events.at(-1).type'), 'bucket_mixing_started');
  run('for (let time = 2120; time <= 4400; time += 20) animate(time);');
  assert.equal(run('stage'), 'ready');
  assert.equal(run('session.events.filter(event => event.type === "bucket_mixed").length'), 1);
  assert.equal(run('overPlatform(DETECTOR, currentObject)'), true);
  assert.equal(run('overPlatform(new THREE.Vector3(DETECTOR.x + 2, 0, DETECTOR.z), currentObject)'), false);
  for (let index = 0; index < 3; index += 1) {
    run('stage = "held"; placeObject();');
    assert.equal(run('scanBeam.visible'), false);
    run('for (let frame = 0; frame < 30; frame += 1) animate(lastFrame + 20);');
    assert.equal(run('scanBeam.visible'), true);
    assert.equal(run('scanBounce.visible'), true);
    assert.equal(run('scanFloodLight.intensity'), 5);
    assert.ok(run('scanBounce.position.x < 0'));
    assert.ok(Math.abs(run('currentObject.position.y - RECESS_LIP_Y')) < 1e-8);
    run('showOutcome();');
    assert.equal(run('stage'), 'outcome');
    assert.equal(run('scanBeam.visible'), false);
    assert.equal(run('scanBounce.visible'), false);
    assert.equal(run('scanFloodLight.intensity'), 0);
    assert.equal(run('signFrame.material.emissiveIntensity > 0'), index === 0);
    assert.equal(run('labelLight.intensity > 0'), index === 0);
    assert.equal(run('machineLabel.material.color.getHexString()'), index === 0 ? 'ffedb0' : 'ffffff');
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
  assert.equal(elements.get('quiz').hidden, false);
  assert.equal(elements.get('answer-cube').hidden, false);
  assert.equal(elements.get('answer-yes').hidden, true);
  run('submitPoint(scenario.objects[0].id);');
  assert.equal(elements.get('answer-cube').hidden, true);
  assert.equal(elements.get('answer-yes').hidden, false);
  assert.equal(downloads.length, 0);
  for (let index = 0; index < 3; index += 1) {
    assert.equal(downloads.length, 0);
    assert.equal(run('stage'), 'judge');
    assert.equal(run('[...objects.values()].every(object => object.visible)'), true);
    run(`submitJudgment(${index === 0});`);
  }
  assert.equal(run('stage'), 'complete');
  assert.equal(elements.get('quiz').hidden, true);
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
    for (let frame = 0; frame < 210; frame += 1) animate(lastFrame + 20);
    stage = 'held'; placeObject(); showOutcome(); advance();
    start();
    for (let frame = 0; frame < 210; frame += 1) animate(lastFrame + 20);
  `);
  assert.equal(run('stage'), 'ready');
  assert.equal(run('trialIndex'), 0);
  assert.equal(run('session.trials.length'), 0);
  run(`
    renderer.domElement = { hasPointerCapture() { return false; } };
    pointerHeld = true; stage = 'held'; currentObject.position.copy(DETECTOR);
    onPointerCancel({ pointerId: 1, isPrimary: true });
  `);
  assert.equal(run('currentObject.position.distanceTo(START)'), 0);
  assert.equal(run('session.events.some(event => event.type === "platform_contact_detected")'), false);
  // Rotating/resizing a device must retain the whole interactive tabletop.
  for (const [width, height] of [[296, 296], [366, 366], [820, 260], [1200, 468]]) {
    context.testWidth = width;
    context.testHeight = height;
    run(`
      ui.scene.clientWidth = testWidth; ui.scene.clientHeight = testHeight;
      renderer.setSize = () => {};
      camera = new THREE.PerspectiveCamera(37, 1, 0.1, 100);
      resize();
    `);
    assert.ok(run(`[-4, 4.1].every(x => [-0.1, 3.6].every(y => [-1.5, 3.6].every(z => {
      const point = new THREE.Vector3(x, y, z).project(camera);
      return Math.abs(point.x) <= 0.93 && Math.abs(point.y) <= 0.93;
    })))`));
  }
  run("language = 'de'; start();");
  assert.equal(run('session.language'), 'de');
  assert.equal(elements.get('prompt').textContent, 'Schau zu, wie der Eimer auf den Tisch kommt.');
});
