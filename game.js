import * as THREE from './vendor/three.module.min.js';

const ui = Object.fromEntries(
  ['scene', 'prompt', 'detail', 'progress', 'feedback', 'begin', 'next', 'download', 'restart']
    .map((id) => [id, document.getElementById(id)]),
);

const START = new THREE.Vector3(-2.25, 1.08, 0.2);
const DETECTOR = new THREE.Vector3(1.55, 0, -0.45);
const PLATFORM_TOP = 0.96;
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
let lamp;
let leftLight;
let rightLight;
let choicePads;
let currentObject;
let stage = 'intro';
let trialIndex = 0;
let judgmentIndex = 0;
let session;
let pointerHeld = false;
let draggedObject = false;
let lastFrame = 0;

boot().catch((error) => {
  ui.prompt.textContent = 'The game could not load.';
  ui.detail.textContent = 'Open this site in a browser with WebGL. For local play, serve the web folder over HTTP.';
  ui.feedback.textContent = error.message;
  ui.begin.hidden = true;
  console.error(error);
});

async function boot() {
  const response = await fetch('./scenario.json');
  if (!response.ok) throw new Error(`Scenario request failed: ${response.status}`);
  scenario = await response.json();
  if (scenario.ruleType !== 'deterministic_hidden_object' || scenario.trialOrder.length !== 3) {
    throw new Error('This game needs the three-trial deterministic scenario.');
  }

  buildScene();
  renderIntro();
  ui.begin.disabled = false;
  ui.begin.textContent = 'Begin';
  ui.begin.addEventListener('click', start);
  ui.next.addEventListener('click', advance);
  ui.restart.addEventListener('click', start);
  ui.download.addEventListener('click', downloadSession);
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
  const body = box(2.45, 0.62, 1.67, '#48463f');
  body.position.y = 0.37;
  machine.add(body);
  const trim = box(2.55, 0.11, 1.78, '#716d63');
  trim.position.y = 0.70;
  machine.add(trim);
  platform = box(1.87, 0.18, 1.28, '#d0c2aa');
  platform.position.y = 0.87;
  platform.userData.action = 'platform';
  machine.add(platform);
  pickMeshes.push(platform);

  const front = box(1.05, 0.28, 0.055, '#34332f');
  front.position.set(0, 0.36, 0.865);
  machine.add(front);
  machine.add(label('BLICKET', 1.0, 0.17, 0, 0.37, 0.905, '#f0eadc', '#34332f'));

  lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.155, 24, 16),
    new THREE.MeshStandardMaterial({ color: '#55534c', emissive: '#000000', roughness: 0.35 }),
  );
  lamp.position.set(0, 0.48, 0.92);
  machine.add(lamp);
  leftLight = sideLight(-1.15);
  rightLight = sideLight(1.15);
  machine.add(leftLight, rightLight);
  scene.add(machine);

  bucket = new THREE.Group();
  bucket.position.set(START.x, 0, START.z);
  const pail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.64, 0.5, 0.52, 32, 1, true),
    new THREE.MeshStandardMaterial({ color: '#928273', side: THREE.DoubleSide, roughness: 0.9 }),
  );
  pail.position.y = 0.28;
  pail.castShadow = true;
  bucket.add(pail);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.64, 0.065, 8, 32),
    new THREE.MeshStandardMaterial({ color: '#5c544a', roughness: 0.8 }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.55;
  bucket.add(rim);
  const bottom = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 0.04, 32),
    new THREE.MeshStandardMaterial({ color: '#6a5e52', roughness: 0.8 }),
  );
  bottom.position.y = 0.035;
  bucket.add(bottom);
  scene.add(bucket);

  for (const spec of scenario.objects) {
    const mesh = makeObject(spec);
    mesh.userData.objectId = spec.id;
    mesh.visible = false;
    objects.set(spec.id, mesh);
    pickMeshes.push(mesh);
    scene.add(mesh);
  }

  choicePads = new THREE.Group();
  choicePads.add(choicePad('blicket', -1.45, '#7a5a32', 'BLICKET'));
  choicePads.add(choicePad('not_blicket', 1.45, '#5b5a55', 'NOT A BLICKET'));
  choicePads.visible = false;
  scene.add(choicePads);
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

function sideLight(x) {
  const mesh = box(0.18, 0.33, 0.11, '#656059');
  mesh.position.set(x, 0.38, 0.86);
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

function choicePad(action, x, color, text) {
  const group = new THREE.Group();
  group.position.set(x, 0, -1.4);
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
  bucket.visible = true;
  choicePads.visible = false;
  for (const object of objects.values()) object.visible = false;
  setDetector(false);
  ui.progress.textContent = 'Ready to begin';
  ui.prompt.textContent = 'Find out which object makes the detector go.';
  ui.detail.textContent = 'Put each object on the 3D detector, watch what happens, then make your choices.';
  ui.feedback.textContent = 'Click Begin to start.';
  ui.begin.hidden = false;
  ui.next.hidden = true;
  ui.download.hidden = true;
}

function start() {
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
  ui.download.hidden = true;
  showTrial();
}

function showTrial() {
  const trial = scenario.trialOrder[trialIndex];
  const spec = scenario.objects.find((object) => object.id === trial.objectId);
  if (!spec) throw new Error(`Missing object ${trial.objectId}`);
  stage = 'ready';
  currentObject = objects.get(spec.id);
  for (const object of objects.values()) object.visible = object === currentObject;
  currentObject.position.copy(START);
  currentObject.rotation.set(0, 0, 0);
  bucket.visible = true;
  machine.visible = true;
  choicePads.visible = false;
  platform.position.y = 0.87;
  setDetector(false);
  ui.progress.textContent = `Object ${trialIndex + 1} of ${scenario.trialOrder.length}`;
  ui.prompt.textContent = `Put the ${spec.label.toLowerCase()} on the blicket detector.`;
  ui.detail.textContent = 'Drag the 3D object onto the platform, or click the object and then click the platform.';
  ui.feedback.textContent = `${spec.label} is ready to test.`;
  ui.next.hidden = true;
  log('trial_started', { trialId: trial.trialId, objectId: spec.id });
}

function setDetector(active) {
  if (!lamp) return;
  lamp.material.color.set(active ? '#efae43' : '#55534c');
  lamp.material.emissive.set(active ? '#df6715' : '#000000');
  lamp.material.emissiveIntensity = active ? 1.4 : 0;
  for (const light of [leftLight, rightLight]) {
    light.material.color.set(active ? '#eaaa45' : '#656059');
    light.material.emissive.set(active ? '#a74510' : '#000000');
    light.material.emissiveIntensity = active ? 0.7 : 0;
  }
  platform.material.color.set(active ? '#e5b86c' : '#d0c2aa');
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
  if (draggedObject && pointOnPlane(event) && overPlatform(dropPoint)) {
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

function overPlatform(point) {
  return Math.abs(point.x - DETECTOR.x) <= 0.97 && Math.abs(point.z - DETECTOR.z) <= 0.67;
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
  currentObject.position.set(DETECTOR.x, PLATFORM_TOP + objectHalfHeight(currentObject), DETECTOR.z);
  ui.prompt.textContent = 'The detector is checking the object…';
  ui.detail.textContent = 'Watch the platform and light.';
  ui.feedback.textContent = 'Checking…';
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
  setDetector(activated);
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
  trialIndex += 1;
  if (trialIndex < scenario.trialOrder.length) showTrial();
  else showPointChoice();
}

function showPointChoice() {
  stage = 'point';
  currentObject = null;
  bucket.visible = false;
  machine.visible = false;
  choicePads.visible = false;
  const xPositions = [-2.3, 0, 2.3];
  scenario.finalPrompt.pointObjectIds.forEach((id, index) => {
    const object = objects.get(id);
    object.visible = true;
    object.position.set(xPositions[index], 1.15, 0);
  });
  ui.progress.textContent = 'Your choice';
  ui.prompt.textContent = scenario.finalPrompt.pointPrompt;
  ui.detail.textContent = 'Click one of the three 3D objects.';
  ui.feedback.textContent = 'Choose the object you think made the machine go.';
  ui.next.hidden = true;
  log('final_point_prompt_opened', {});
}

function submitPoint(objectId) {
  if (!scenario.finalPrompt.pointObjectIds.includes(objectId)) return;
  session.finalPointObjectId = objectId;
  log('final_point_choice_submitted', { objectId });
  judgmentIndex = 0;
  showJudgment();
}

function showJudgment() {
  stage = 'judge';
  const objectId = scenario.finalPrompt.sequentialObjectIds[judgmentIndex];
  const spec = scenario.objects.find((object) => object.id === objectId);
  for (const [id, object] of objects) {
    object.visible = id === objectId;
    if (id === objectId) object.position.set(0, 1.55, 0.6);
  }
  choicePads.visible = true;
  ui.progress.textContent = `Question ${judgmentIndex + 1} of ${scenario.finalPrompt.sequentialObjectIds.length}`;
  ui.prompt.textContent = `Is the ${spec.label.toLowerCase()} a blicket?`;
  ui.detail.textContent = 'Click one of the two 3D answer pads.';
  ui.feedback.textContent = 'Make your judgment.';
  log('final_sequential_prompt_opened', { objectId });
}

function submitJudgment(saysBlicket) {
  const objectId = scenario.finalPrompt.sequentialObjectIds[judgmentIndex];
  session.judgments.push({ objectId, saysBlicket });
  log('final_sequential_choice_submitted', { objectId, saysBlicket });
  judgmentIndex += 1;
  if (judgmentIndex < scenario.finalPrompt.sequentialObjectIds.length) showJudgment();
  else complete();
}

function complete() {
  stage = 'complete';
  choicePads.visible = false;
  for (const object of objects.values()) object.visible = false;
  machine.visible = true;
  bucket.visible = false;
  setDetector(false);
  session.completedAt = new Date().toISOString();
  log('session_completed', {});
  ui.progress.textContent = 'Complete';
  ui.prompt.textContent = 'All done.';
  ui.detail.textContent = 'Your choices were saved in this browser session. Download the JSON if you want to keep them.';
  ui.feedback.textContent = 'Thank you for playing.';
  ui.download.hidden = false;
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
  const targetY = stage === 'checking' || stage === 'outcome' ? 0.76 : 0.87;
  platform.position.y = THREE.MathUtils.damp(platform.position.y, targetY, 9, delta);
  if (currentObject && (stage === 'checking' || stage === 'outcome')) {
    currentObject.position.y = platform.position.y + 0.09 + objectHalfHeight(currentObject);
  }
  renderer.render(scene, camera);
}
