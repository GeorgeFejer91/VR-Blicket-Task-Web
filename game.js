import * as THREE from './vendor/three.module.min.js';
import { stepBucketBodies } from './bucket-physics.mjs';
import { createSounds } from './sounds.mjs';

const ui = Object.fromEntries(
  ['scene', 'prompt', 'detail', 'progress', 'feedback', 'begin', 'next', 'restart', 'sound']
    .map((id) => [id, document.getElementById(id)]),
);

const BUCKET_HOME = new THREE.Vector3(-2.25, 0, 0.2);
const START = new THREE.Vector3(-2.25, 1.55, 0.2);
const DETECTOR = new THREE.Vector3(1.55, 0, -0.45);
const PLATFORM_TOP = 0.96;
const PLATFORM_Y = 0.87;
const PLATFORM_HALF_X = 1.10;
const PLATFORM_HALF_Z = 0.72;
const TABLE_TOP = -0.09;
const RETURN_SECONDS = 0.65;
const sounds = createSounds();
const BUCKET_ENTRY_X = -6.6;
const ARRIVAL_SECONDS = 1.8;
const LIFT_SECONDS = 0.55;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -PLATFORM_TOP);
const dropPoint = new THREE.Vector3();
const objects = new Map();
const pickMeshes = [];
const pendingTimers = new Set();

let scenario;
let renderer;
let camera;
let scene;
let machine;
let bucket;
let platform;
let choicePads;
let judgmentMarker;
let currentObject;
let stage = 'intro';
let trialIndex = 0;
let judgmentIndex = 0;
let session;
let pointerHeld = false;
let draggedObject = false;
let lastFrame = 0;
let arrivalElapsed = 0;
let liftElapsed = 0;
let liftFrom;
let bucketBodies = [];
let outcomeActivated = null;
let outcomeAt = 0;
let returnElapsed = 0;
let returnFrom;
let returnTo;
let lastRattleAt = 0;

boot().catch((error) => {
  ui.prompt.textContent = 'The game could not load.';
  ui.detail.textContent = 'Open this site in a browser with WebGL. For local play, serve the web folder over HTTP.';
  ui.feedback.textContent = error.message;
  ui.begin.hidden = true;
  console.error(error);
});

async function boot() {
  const response = await fetch('./scenario.json', { cache: 'no-store' });
  if (!response.ok) throw new Error(`Scenario request failed: ${response.status}`);
  scenario = await response.json();
  if (scenario.ruleType !== 'deterministic_hidden_object' || scenario.trialOrder.length !== 3 ||
      scenario.buckets.length !== 1 || scenario.buckets[0].objectIds.length !== 3) {
    throw new Error('This game needs one bucket with three deterministic trial objects.');
  }

  buildScene();
  renderIntro();
  ui.begin.disabled = false;
  ui.begin.textContent = 'Begin';
  ui.begin.addEventListener('click', start);
  ui.next.addEventListener('click', advance);
  ui.restart.addEventListener('click', start);
  ui.sound.addEventListener('click', () => {
    const enabled = sounds.toggle();
    ui.sound.textContent = enabled ? 'Sound on' : 'Sound off';
    ui.sound.setAttribute('aria-pressed', String(enabled));
  });
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerup', onPointerUp);
  renderer.domElement.addEventListener('pointercancel', onPointerUp);
  window.addEventListener('resize', resize);
  resize();
  renderer.setAnimationLoop(animate);
}

function buildScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#d8d1c4');
  camera = new THREE.PerspectiveCamera(37, 1, 0.1, 100);
  camera.position.set(0, 4.2, 7.2);
  camera.lookAt(0, 0.65, 0);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  ui.scene.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight('#ffffff', '#887f70', 2.1));
  const sun = new THREE.DirectionalLight('#ffffff', 2.4);
  sun.position.set(-3, 8, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -8;
  sun.shadow.camera.right = 8;
  sun.shadow.camera.top = 8;
  sun.shadow.camera.bottom = -8;
  scene.add(sun);

  const table = box(12, 0.26, 7.5, '#a99f90');
  table.position.set(0, -0.22, 0);
  table.receiveShadow = true;
  scene.add(table);

  machine = new THREE.Group();
  machine.position.copy(DETECTOR);
  // Berkeley's original demonstration uses a plain dark box with a broad red top.
  // Visual sources and adaptations are recorded in For-AI/machine-references.md.
  const body = box(2.45, 0.62, 1.67, '#30463d');
  body.position.y = 0.37;
  machine.add(body);
  const trim = box(2.55, 0.11, 1.78, '#232b27');
  trim.position.y = 0.70;
  machine.add(trim);
  platform = box(PLATFORM_HALF_X * 2, 0.18, PLATFORM_HALF_Z * 2, '#c9443c');
  platform.material.roughness = 0.38;
  platform.position.y = PLATFORM_Y;
  platform.userData.action = 'platform';
  machine.add(platform);
  pickMeshes.push(platform);

  machine.add(label('BLICKET', 0.86, 0.16, -0.43, 0.38, 0.839, '#e9e5d9', '#30463d'));
  for (let i = 0; i < 5; i += 1) {
    const slot = box(0.37, 0.025, 0.012, '#19211d');
    slot.position.set(0.62, 0.27 + i * 0.055, 0.841);
    machine.add(slot);
  }
  scene.add(machine);

  bucket = new THREE.Group();
  bucket.position.copy(BUCKET_HOME);
  const pail = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4, 1.26, 0.52, 40, 1, true),
    new THREE.MeshStandardMaterial({ color: '#928273', side: THREE.DoubleSide, roughness: 0.9 }),
  );
  pail.position.y = 0.29;
  pail.castShadow = true;
  bucket.add(pail);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(1.4, 0.07, 8, 40),
    new THREE.MeshStandardMaterial({ color: '#5c544a', roughness: 0.8 }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.56;
  bucket.add(rim);
  const bottom = new THREE.Mesh(
    new THREE.CylinderGeometry(1.26, 1.26, 0.04, 40),
    new THREE.MeshStandardMaterial({ color: '#6a5e52', roughness: 0.8 }),
  );
  bottom.position.y = 0.035;
  bucket.add(bottom);
  scene.add(bucket);

  for (const spec of scenario.objects) {
    const mesh = makeObject(spec);
    mesh.userData.objectId = spec.id;
    mesh.userData.bucketRadius = { cube: 0.44, column: 0.38, block: 0.53 }[spec.visible.shape];
    mesh.visible = false;
    objects.set(spec.id, mesh);
    pickMeshes.push(mesh);
    scene.add(mesh);
  }

  choicePads = new THREE.Group();
  choicePads.add(choicePad('blicket', 1.25, '#7a5a32', 'BLICKET'));
  choicePads.add(choicePad('not_blicket', 2.35, '#5b5a55', 'NOT A BLICKET'));
  choicePads.visible = false;
  scene.add(choicePads);
  judgmentMarker = new THREE.Mesh(
    new THREE.TorusGeometry(0.62, 0.026, 8, 48),
    new THREE.MeshBasicMaterial({ color: '#302e28' }),
  );
  judgmentMarker.rotation.x = -Math.PI / 2;
  judgmentMarker.visible = false;
  scene.add(judgmentMarker);
}

function box(width, height, depth, color) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({ color, roughness: 0.73, metalness: 0.02 }),
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function label(text, width, height, x, y, z, ink = '#282721', paper = '#e7dfd0') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  context.fillStyle = paper;
  context.fillRect(0, 0, 512, 128);
  context.fillStyle = ink;
  context.font = 'bold 54px sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, 256, 67, 480);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({ map: texture, transparent: false, side: THREE.DoubleSide }),
  );
  mesh.position.set(x, y, z);
  return mesh;
}

function makeObject(spec) {
  const material = new THREE.MeshStandardMaterial({ color: spec.visible.color, roughness: 0.6 });
  let geometry;
  switch (spec.visible.shape) {
    case 'cube': geometry = new THREE.BoxGeometry(0.72, 0.72, 0.72); break;
    case 'column': geometry = new THREE.CylinderGeometry(0.34, 0.34, 0.95, 32); break;
    case 'block': geometry = new THREE.BoxGeometry(0.94, 0.55, 0.65); break;
    default: throw new Error(`Unsupported object shape: ${spec.visible.shape}`);
  }
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function choicePad(action, z, color, text) {
  const group = new THREE.Group();
  group.position.set(-2.1, TABLE_TOP, z);
  const pad = box(2.35, 0.22, 0.78, color);
  pad.position.y = 0.13;
  pad.userData.action = action;
  pickMeshes.push(pad);
  group.add(pad);
  const caption = label(text, 2.18, 0.28, 0, 0.255, 0.405, '#fffaf0', color);
  caption.rotation.x = -0.4;
  group.add(caption);
  return group;
}

function renderIntro() {
  stage = 'intro';
  machine.visible = true;
  machine.position.y = 0;
  bucket.visible = true;
  bucket.position.copy(BUCKET_HOME);
  bucket.rotation.set(0, 0, 0);
  choicePads.visible = false;
  for (const object of objects.values()) object.visible = false;
  setDetector(null);
  ui.progress.textContent = 'Ready to begin';
  ui.prompt.textContent = 'Find out which object makes the detector go.';
  ui.detail.textContent = 'Put each object on the 3D detector, watch what happens, then make your choices.';
  ui.feedback.textContent = 'Click Begin to start.';
  ui.begin.hidden = false;
  ui.next.hidden = true;
}

function start() {
  sounds.stop();
  sounds.unlock();
  for (const timer of pendingTimers) clearTimeout(timer);
  pendingTimers.clear();
  session = {
    schema: 'vr_blicket_task.web_session.v1',
    sessionId: crypto.randomUUID(),
    scenarioId: scenario.scenarioId,
    startedAt: new Date().toISOString(),
    trials: [],
    events: [],
    finalPointObjectId: null,
    judgments: [],
  };
  trialIndex = 0;
  judgmentIndex = 0;
  pointerHeld = false;
  draggedObject = false;
  ui.begin.hidden = true;
  ui.restart.hidden = false;
  ui.next.hidden = true;
  machine.visible = true;
  machine.position.y = 0;
  bucket.visible = true;
  bucket.position.set(BUCKET_ENTRY_X, 0, BUCKET_HOME.z);
  bucket.rotation.set(0, 0, 0);
  choicePads.visible = false;
  judgmentMarker.visible = false;
  platform.position.y = PLATFORM_Y;
  setDetector(null);
  currentObject = null;
  bucketBodies = [];
  const positions = [[-0.58, -0.3], [0.57, -0.3], [0, 0.68]];
  scenario.buckets[0].objectIds.forEach((id, index) => {
    const mesh = objects.get(id);
    if (!mesh) throw new Error(`Missing bucket object ${id}`);
    bucket.add(mesh);
    mesh.visible = true;
    mesh.rotation.set(0, 0, 0);
    const [x, z] = positions[index];
    const radius = mesh.userData.bucketRadius;
    bucketBodies.push({ id, mesh, x, z, vx: 0, vz: 0, radius });
    mesh.position.set(x, 0.065 + objectHalfHeight(mesh), z);
  });
  arrivalElapsed = 0;
  lastRattleAt = 0;
  stage = 'arrival';
  ui.progress.textContent = 'Bucket arriving';
  ui.prompt.textContent = 'Watch the bucket come onto the table.';
  ui.detail.textContent = 'Three objects are moving inside it.';
  ui.feedback.textContent = 'The objects are rattling together.';
  log('bucket_arrival_started', { bucketId: scenario.buckets[0].id, objectIds: scenario.buckets[0].objectIds });
}

function showTrial() {
  const trial = scenario.trialOrder[trialIndex];
  const spec = scenario.objects.find((object) => object.id === trial.objectId);
  if (!spec) throw new Error(`Missing object ${trial.objectId}`);
  stage = 'presenting';
  currentObject = objects.get(spec.id);
  bucketBodies = bucketBodies.filter((body) => body.id !== spec.id);
  scene.attach(currentObject);
  liftFrom = currentObject.position.clone();
  liftElapsed = 0;
  currentObject.rotation.set(0, 0, 0);
  bucket.visible = true;
  machine.visible = true;
  choicePads.visible = false;
  setDetector(null);
  ui.progress.textContent = `Object ${trialIndex + 1} of ${scenario.trialOrder.length}`;
  ui.prompt.textContent = `Here is the ${spec.label.toLowerCase()}.`;
  ui.detail.textContent = 'Watch it come out of the bucket.';
  ui.feedback.textContent = 'Getting the object ready.';
  ui.next.hidden = true;
}

function readyTrial() {
  const trial = activeTrial();
  const spec = scenario.objects.find((object) => object.id === trial.objectId);
  stage = 'ready';
  ui.prompt.textContent = `Put the ${spec.label.toLowerCase()} on the blicket detector.`;
  ui.detail.textContent = 'Drag the 3D object onto the platform, or click the object and then click the platform.';
  ui.feedback.textContent = `${spec.label} is ready to test.`;
  log('trial_started', { trialId: trial.trialId, objectId: spec.id });
}

function setDetector(outcome, lit = true) {
  const visible = outcome !== null && lit;
  const signal = outcome ? '#efae43' : '#cf6050';
  const glow = outcome ? '#df6715' : '#aa2720';
  platform.material.color.set(visible ? signal : '#c9443c');
  platform.material.emissive.set(visible ? glow : '#000000');
  platform.material.emissiveIntensity = visible ? 0.7 : 0;
}

function onPointerDown(event) {
  if (event.button !== 0) return;
  const target = pick(event);
  if (!target) return;
  if (stage === 'ready' && target.objectId === currentObject?.userData.objectId) {
    stage = 'held';
    pointerHeld = true;
    draggedObject = false;
    renderer.domElement.setPointerCapture(event.pointerId);
    currentObject.position.y = START.y + 0.16;
    ui.prompt.textContent = 'Place the object on the detector platform.';
    ui.detail.textContent = 'Release it over the platform, or click the platform to place it.';
    ui.feedback.textContent = 'Object selected.';
    sounds.play('pickup');
    log('object_picked_up', { trialId: activeTrial().trialId, objectId: currentObject.userData.objectId });
    return;
  }
  if (stage === 'held' && target.action === 'platform') {
    placeObject();
    return;
  }
  if (stage === 'point' && target.objectId) {
    submitPoint(target.objectId);
    return;
  }
  if (stage === 'judge' && (target.action === 'blicket' || target.action === 'not_blicket')) {
    submitJudgment(target.action === 'blicket');
  }
}

function onPointerMove(event) {
  const target = pick(event);
  renderer.domElement.style.cursor = target && clickable(target) ? 'pointer' : 'default';
  if (!pointerHeld || stage !== 'held') return;
  if (!pointOnPlane(event)) return;
  draggedObject = true;
  currentObject.position.set(
    THREE.MathUtils.clamp(dropPoint.x, -4.5, 4.5),
    PLATFORM_TOP + objectHalfHeight(currentObject) + 0.18,
    THREE.MathUtils.clamp(dropPoint.z, -2.5, 2.4),
  );
}

function onPointerUp(event) {
  if (!pointerHeld) return;
  pointerHeld = false;
  if (renderer.domElement.hasPointerCapture(event.pointerId)) {
    renderer.domElement.releasePointerCapture(event.pointerId);
  }
  if (stage !== 'held') return;
  if (draggedObject && pointOnPlane(event) && overPlatform(dropPoint, currentObject)) {
    placeObject();
  } else {
    currentObject.position.copy(START);
    currentObject.position.y += 0.16;
  }
}

function clickable(target) {
  if (stage === 'ready' || stage === 'held') {
    return target.objectId === currentObject?.userData.objectId || (stage === 'held' && target.action === 'platform');
  }
  if (stage === 'point') return Boolean(target.objectId);
  if (stage === 'judge') return target.action === 'blicket' || target.action === 'not_blicket';
  return false;
}

function pick(event) {
  const bounds = renderer.domElement.getBoundingClientRect();
  pointer.set(
    ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
    -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
  );
  raycaster.setFromCamera(pointer, camera);
  return raycaster.intersectObjects(pickMeshes, false)
    .find((hit) => {
      for (let node = hit.object; node; node = node.parent) {
        if (!node.visible) return false;
      }
      return true;
    })?.object.userData;
}

function pointOnPlane(event) {
  const bounds = renderer.domElement.getBoundingClientRect();
  pointer.set(
    ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
    -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
  );
  raycaster.setFromCamera(pointer, camera);
  return raycaster.ray.intersectPlane(dragPlane, dropPoint) !== null;
}

function overPlatform(point, mesh) {
  mesh.geometry.computeBoundingBox();
  const bounds = mesh.geometry.boundingBox;
  const halfX = (bounds.max.x - bounds.min.x) / 2;
  const halfZ = (bounds.max.z - bounds.min.z) / 2;
  const overlapX = Math.max(0,
    Math.min(point.x + halfX, DETECTOR.x + PLATFORM_HALF_X) - Math.max(point.x - halfX, DETECTOR.x - PLATFORM_HALF_X));
  const overlapZ = Math.max(0,
    Math.min(point.z + halfZ, DETECTOR.z + PLATFORM_HALF_Z) - Math.max(point.z - halfZ, DETECTOR.z - PLATFORM_HALF_Z));
  return overlapX >= halfX && overlapZ >= halfZ;
}

function objectHalfHeight(mesh) {
  mesh.geometry.computeBoundingBox();
  return (mesh.geometry.boundingBox.max.y - mesh.geometry.boundingBox.min.y) / 2;
}

function activeTrial() { return scenario.trialOrder[trialIndex]; }

function placeObject() {
  if (stage !== 'held') return;
  const trial = activeTrial();
  stage = 'checking';
  pointerHeld = false;
  outcomeActivated = null;
  setDetector(null);
  currentObject.position.set(DETECTOR.x, PLATFORM_TOP + objectHalfHeight(currentObject), DETECTOR.z);
  ui.prompt.textContent = 'The detector is checking the object…';
  ui.detail.textContent = 'Watch the detector platform.';
  ui.feedback.textContent = 'Checking…';
  sounds.play('place');
  sounds.play('press');
  log('platform_contact_detected', { trialId: trial.trialId, objectId: trial.objectId });
  const timer = setTimeout(() => {
    pendingTimers.delete(timer);
    showOutcome();
  }, scenario.detector.checkDurationMs);
  pendingTimers.add(timer);
}

function showOutcome() {
  if (stage !== 'checking') return;
  const trial = activeTrial();
  const spec = scenario.objects.find((object) => object.id === trial.objectId);
  const activated = spec.hiddenBlicket === true;
  stage = 'outcome';
  outcomeActivated = activated;
  outcomeAt = performance.now();
  setDetector(activated);
  if (activated) sounds.play('activate');
  ui.prompt.textContent = activated ? 'The machine went!' : 'The machine stayed off.';
  ui.detail.textContent = activated
    ? `${spec.label} made the detector light up.`
    : `${spec.label} did not make the detector light up.`;
  ui.feedback.textContent = activated ? 'Detector activated.' : 'No activation.';
  ui.next.hidden = false;
  ui.next.textContent = trialIndex + 1 < scenario.trialOrder.length ? 'Next object' : 'Make your choices';
  session.trials.push({ trialId: trial.trialId, objectId: trial.objectId, activated });
  log('detector_outcome', { trialId: trial.trialId, objectId: trial.objectId, activated });
}

function advance() {
  if (stage !== 'outcome') return;
  sounds.stop();
  stage = 'returning';
  returnElapsed = 0;
  returnFrom = currentObject.position.clone();
  returnTo = tablePosition(currentObject);
  setDetector(null);
  ui.next.hidden = true;
  ui.detail.textContent = 'The tested object goes onto the table beside the machine.';
  ui.feedback.textContent = 'Putting the object on the table.';
}

function tablePosition(object) {
  const index = scenario.finalPrompt.pointObjectIds.indexOf(object.userData.objectId);
  return new THREE.Vector3(0.15 + index * 1.4, TABLE_TOP + objectHalfHeight(object), 1.65);
}

function finishReturn() {
  currentObject.position.copy(returnTo);
  sounds.play('return');
  log('object_returned_to_table', { trialId: activeTrial().trialId, objectId: currentObject.userData.objectId });
  trialIndex += 1;
  if (trialIndex < scenario.trialOrder.length) showTrial();
  else showPointChoice();
}

function showPointChoice() {
  stage = 'point';
  currentObject = null;
  bucket.visible = true;
  machine.visible = true;
  choicePads.visible = false;
  ui.progress.textContent = 'Your choice';
  ui.prompt.textContent = scenario.finalPrompt.pointPrompt;
  ui.detail.textContent = 'Click one of the three objects on the table beside the machine.';
  ui.feedback.textContent = 'Choose the object you think made the machine go.';
  ui.next.hidden = true;
  log('final_point_prompt_opened', {});
}

function submitPoint(objectId) {
  if (!scenario.finalPrompt.pointObjectIds.includes(objectId)) return;
  session.finalPointObjectId = objectId;
  sounds.play('choice');
  log('final_point_choice_submitted', { objectId });
  judgmentIndex = 0;
  showJudgment();
}

function showJudgment() {
  stage = 'judge';
  const objectId = scenario.finalPrompt.sequentialObjectIds[judgmentIndex];
  const spec = scenario.objects.find((object) => object.id === objectId);
  const object = objects.get(objectId);
  judgmentMarker.position.copy(object.position);
  judgmentMarker.position.y = TABLE_TOP + 0.03;
  judgmentMarker.visible = true;
  choicePads.visible = true;
  ui.progress.textContent = `Question ${judgmentIndex + 1} of ${scenario.finalPrompt.sequentialObjectIds.length}`;
  ui.prompt.textContent = `Is the ${spec.label.toLowerCase()} a blicket?`;
  ui.detail.textContent = 'Look at the object with the ring, then click one of the two answer pads.';
  ui.feedback.textContent = 'Make your judgment.';
  log('final_sequential_prompt_opened', { objectId });
}

function submitJudgment(saysBlicket) {
  const objectId = scenario.finalPrompt.sequentialObjectIds[judgmentIndex];
  session.judgments.push({ objectId, saysBlicket });
  sounds.play('choice');
  log('final_sequential_choice_submitted', { objectId, saysBlicket });
  judgmentIndex += 1;
  if (judgmentIndex < scenario.finalPrompt.sequentialObjectIds.length) showJudgment();
  else complete();
}

function complete() {
  if (stage === 'complete') return;
  stage = 'complete';
  choicePads.visible = false;
  judgmentMarker.visible = false;
  machine.visible = true;
  bucket.visible = false;
  setDetector(null);
  sounds.play('complete');
  session.completedAt = new Date().toISOString();
  log('session_completed', {});
  ui.progress.textContent = 'Complete';
  ui.prompt.textContent = 'All done.';
  ui.detail.textContent = 'Your session JSON downloads automatically. Check your browser’s downloads.';
  ui.feedback.textContent = 'Thank you for playing.';
  downloadSession();
}

function log(type, detail) {
  if (!session) return;
  session.events.push({ type, at: new Date().toISOString(), ...detail });
}

function downloadSession() {
  if (stage !== 'complete') return;
  const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `blicket-session-${session.sessionId}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function resize() {
  const width = ui.scene.clientWidth;
  const height = ui.scene.clientHeight;
  if (!width || !height) return;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

function animate(time) {
  const delta = Math.min((time - lastFrame) / 1000 || 0, 0.05);
  lastFrame = time;

  if (bucket.visible && bucketBodies.length) {
    stepBucketBodies(bucketBodies, delta, stage === 'arrival' ? 7 : 0, time / 1000);
    bucketBodies.forEach((body, index) => {
      const bounce = stage === 'arrival' ? Math.abs(Math.sin(time * 0.027 + index * 2)) * 0.07 : 0;
      body.mesh.position.set(body.x, 0.065 + objectHalfHeight(body.mesh) + bounce, body.z);
    });
  }

  if (stage === 'arrival') {
    if (time - lastRattleAt > 130) {
      sounds.play('rattle');
      lastRattleAt = time;
    }
    arrivalElapsed += delta;
    const progress = Math.min(arrivalElapsed / ARRIVAL_SECONDS, 1);
    const eased = 1 - (1 - progress) ** 3;
    bucket.position.x = BUCKET_ENTRY_X + (BUCKET_HOME.x - BUCKET_ENTRY_X) * eased;
    bucket.rotation.z = Math.sin(time * 0.023) * 0.035 * (1 - progress);
    bucket.rotation.x = Math.sin(time * 0.018) * 0.018 * (1 - progress);
    if (progress === 1) {
      bucket.position.copy(BUCKET_HOME);
      bucket.rotation.set(0, 0, 0);
      sounds.play('land');
      log('bucket_arrived', { bucketId: scenario.buckets[0].id });
      showTrial();
    }
  }

  if (stage === 'presenting') {
    liftElapsed += delta;
    const progress = Math.min(liftElapsed / LIFT_SECONDS, 1);
    const eased = 1 - (1 - progress) ** 3;
    currentObject.position.lerpVectors(liftFrom, START, eased);
    if (progress === 1) readyTrial();
  }

  if (stage === 'returning') {
    returnElapsed += delta;
    const progress = Math.min(returnElapsed / RETURN_SECONDS, 1);
    const eased = progress * progress * (3 - 2 * progress);
    currentObject.position.lerpVectors(returnFrom, returnTo, eased);
    currentObject.position.y += Math.sin(progress * Math.PI) * 0.55;
    if (progress === 1) finishReturn();
  }

  const machineTargetY = stage === 'checking' || stage === 'outcome'
    ? -scenario.detector.machineDropMeters : 0;
  machine.position.y = THREE.MathUtils.damp(machine.position.y, machineTargetY, 9, delta);
  const targetY = stage === 'checking' || stage === 'outcome'
    ? PLATFORM_Y - scenario.detector.platformDropMeters : PLATFORM_Y;
  platform.position.y = THREE.MathUtils.damp(platform.position.y, targetY, 9, delta);
  if (currentObject && (stage === 'checking' || stage === 'outcome')) {
    currentObject.position.y = machine.position.y + platform.position.y + 0.09 + objectHalfHeight(currentObject);
  }
  if (stage === 'outcome') {
    const elapsed = time - outcomeAt;
    const pulseOn = elapsed >= Math.max(scenario.detector.activationDurationMs, 1400) ||
      Math.floor(elapsed / 170) % 2 === 0;
    setDetector(outcomeActivated, pulseOn);
  }
  renderer.render(scene, camera);
}
