import * as THREE from './vendor/three.module.min.js';
import { stepBucketBodies } from './bucket-physics.mjs';
import { createSounds } from './sounds.mjs?v=20260928f';
import { sizeTextRegions } from './text-layout.mjs?v=20260928c';
import { copy, objectName } from './copy.mjs?v=20260929b';
import { createNarration } from './narration.mjs?v=20260929b';

const ui = Object.fromEntries(
  ['scene', 'prompt', 'detail', 'progress', 'feedback', 'begin', 'next', 'restart', 'sound',
    'subtitle', 'language-menu', 'language-title', 'language-detail', 'language-en', 'language-de',
    'quiz', 'answer-yes', 'answer-no']
    .map((id) => [id, document.getElementById(id)]),
);

const BUCKET_HOME = new THREE.Vector3(-2.25, 0, 0.2);
const START = new THREE.Vector3(-2.25, 3.05, 0.2);
const DETECTOR = new THREE.Vector3(1.55, 0, -0.45);
const PLATFORM_TOP = 2.29;
const PLATFORM_Y = 2.20;
const PLATFORM_HALF_X = 1.35;
const PLATFORM_HALF_Z = 1.00;
const PAIR_X = 0.67;
const RECESS_LIP_Y = 2.15;
const SCAN_START_SECONDS = 0.55;
const REVEAL_PAUSE_MS = 950;
const TABLE_TOP = -0.09;
const MACHINE_RIM_TOP = 2.27;
const RETURN_SECONDS = 1.0;
const PLACE_SECONDS = 0.9;
const sounds = createSounds();
let narration;
let language = 'en';
let languageChosen = false;
const t = (key, values) => copy(language, key, values);
const nameOf = (id) => objectName(scenario.phases.flatMap((phase) => phase.objects).find((item) => item.id === id), language);
const BUCKET_ENTRY_X = -6.6;
const ARRIVAL_SECONDS = 1.8;
const MIX_SECONDS = 1.45;
const LIFT_SECONDS = 0.8;
const raycaster = new THREE.Raycaster();
const scanRaycaster = new THREE.Raycaster();
scanRaycaster.far = 3.0;
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
let signFrame;
let machineLabel;
let labelLight;
let resultLamps = [];
let scanBeam;
let scanBounce;
let scanFloodLight;
let judgmentMarker;
let currentObject;
let stage = 'intro';
let phaseIndex = 0;
let trialIndex = 0;
let judgmentIndex = 0;
let placementIndex = 0;
let placedObjects = [];
let session;
let pointerHeld = false;
let draggedObject = false;
let lastFrame = 0;
let arrivalElapsed = 0;
let flight;
let bucketBodies = [];
let outcomeActivated = null;
let outcomeAt = 0;
let returnFlights = [];
let lastRattleAt = 0;
let mixElapsed = 0;
let checkElapsed = 0;
let touchInput = false;
let reducedMotion = false;

boot().catch((error) => {
  ui.prompt.textContent = 'The game could not load.';
  ui.detail.textContent = 'Open this site in a browser with WebGL. For local play, serve the web folder over HTTP.';
  ui.feedback.textContent = error.message;
  ui.begin.hidden = true;
  console.error(error);
});

async function boot() {
  const [response, audioResponse] = await Promise.all([
    fetch('./scenario.json', { cache: 'no-store' }),
    fetch('./audio/cues.json', { cache: 'no-store' }).catch(() => null),
  ]);
  if (!response.ok) throw new Error('Game data could not load.');
  scenario = await response.json();
  narration = createNarration(audioResponse?.ok ? await audioResponse.json() : { narration: [] },
    (active) => sounds.setVoiceActive(active));
  if (scenario.phases?.length !== 3 || scenario.evidenceOrder?.length !== 6 ||
      scenario.phases.some((phase) => phase.objects.length !== 3 || !['disjunctive', 'conjunctive'].includes(phase.rule))) {
    throw new Error('This game needs three three-object AND/OR phases.');
  }

  buildScene();
  renderIntro();
  ui.begin.textContent = t('begin');
  ui.begin.addEventListener('click', start);
  for (const code of ['en', 'de']) {
    ui[`language-${code}`].addEventListener('click', () => {
      language = code;
      languageChosen = true;
      document.documentElement.lang = code;
      narration.setLanguage(code);
      applyLanguage();
      ui.begin.disabled = true;
      ui.feedback.textContent = t('introListening');
      narration.play('intro', false, () => {
        if (stage !== 'intro' || !languageChosen) return;
        ui.begin.disabled = false;
        ui.feedback.textContent = t('introReady');
        ui.begin.focus({ preventScroll: true });
      });
    });
  }
  ui['answer-yes'].addEventListener('click', () => { if (stage === 'judge') submitJudgment(true); });
  ui['answer-no'].addEventListener('click', () => { if (stage === 'judge') submitJudgment(false); });
  ui.next.addEventListener('click', advance);
  ui.restart.addEventListener('click', start);
  ui.sound.addEventListener('click', () => {
    const enabled = sounds.toggle();
    narration.setEnabled(enabled);
    ui.sound.textContent = t(enabled ? 'soundOn' : 'soundOff');
    ui.sound.setAttribute('aria-pressed', String(enabled));
    if (!enabled && stage === 'intro' && languageChosen) {
      ui.begin.disabled = false;
      ui.feedback.textContent = t('introReady');
    }
  });
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerup', onPointerUp);
  renderer.domElement.addEventListener('pointercancel', onPointerCancel);
  window.addEventListener('resize', resize);
  const coarsePointer = window.matchMedia('(any-pointer: coarse)');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const updatePreferences = () => {
    touchInput = coarsePointer.matches;
    reducedMotion = motionPreference.matches;
  };
  coarsePointer.addEventListener('change', updatePreferences);
  motionPreference.addEventListener('change', updatePreferences);
  updatePreferences();
  new ResizeObserver(resize).observe(ui.scene);
  sizeTextRegions(document.querySelector('.app'));
  resize();
  renderer.setAnimationLoop(animate);
}

function applyLanguage() {
  ui.subtitle.textContent = t('subtitle');
  ui['language-title'].textContent = t('languageTitle');
  ui['language-detail'].textContent = t('languageDetail');
  ui.begin.textContent = t('begin');
  ui.restart.textContent = t('restart');
  ui.sound.textContent = t(ui.sound.getAttribute('aria-pressed') === 'false' ? 'soundOff' : 'soundOn');
  ui.scene.setAttribute('aria-label', t('sceneLabel'));
  ui.quiz.setAttribute('aria-label', t('quizLabel'));
  for (const code of ['en', 'de']) ui[`language-${code}`].setAttribute('aria-pressed', String(code === language));
  ui['answer-yes'].textContent = t('blicket');
  ui['answer-no'].textContent = t('notBlicket');
  renderIntro();
}

function setQuiz(mode) {
  ui.quiz.hidden = mode !== 'judge';
  ui['answer-yes'].hidden = mode !== 'judge';
  ui['answer-no'].hidden = mode !== 'judge';
  if (mode === 'judge') ui['answer-yes'].focus({ preventScroll: true });
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
  const base = box(3.15, 0.26, 2.45, '#30463d');
  base.position.y = 0.13;
  machine.add(base);
  for (const [width, depth, x, z] of [
    [3.15, 0.19, 0, 1.14], [3.15, 0.19, 0, -1.14],
    [0.18, 2.29, -1.485, 0], [0.18, 2.29, 1.485, 0],
  ]) {
    const wall = box(width, 1.96, depth, '#30463d');
    wall.position.set(x, 1.24, z);
    machine.add(wall);
  }
  for (const [width, depth, x, z] of [
    [3.25, 0.13, 0, 1.23], [3.25, 0.13, 0, -1.23],
    [0.14, 2.35, -1.55, 0], [0.14, 2.35, 1.55, 0],
  ]) {
    const rim = box(width, 0.08, depth, '#232b27');
    rim.position.set(x, 2.23, z);
    machine.add(rim);
  }
  platform = box(PLATFORM_HALF_X * 2, 0.18, PLATFORM_HALF_Z * 2, '#c9443c');
  platform.material.roughness = 0.38;
  platform.position.y = PLATFORM_Y;
  platform.userData.action = 'platform';
  machine.add(platform);
  pickMeshes.push(platform);

  for (const x of [-1.49, 1.49]) {
    const lamp = box(0.11, 0.62, 0.035, '#24352f');
    lamp.position.set(x, 1.74, 1.26);
    machine.add(lamp);
    resultLamps.push(lamp);
  }
  signFrame = box(2.98, 0.62, 0.045, '#24352f');
  signFrame.position.set(0, 0.71, 1.26);
  machine.add(signFrame);
  machineLabel = label('BLICKET', 2.82, 0.46, 0, 0.71, 1.29, '#253b32', '#f3eddd');
  machine.add(machineLabel);
  labelLight = new THREE.PointLight('#ffd178', 0, 1.8);
  labelLight.position.set(0, 0.71, 1.45);
  machine.add(labelLight);
  scanBeam = new THREE.Group();
  for (const x of [-1.37, 1.37]) {
    const emitter = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 12, 8),
      new THREE.MeshBasicMaterial({ color: '#b6fff4' }),
    );
    emitter.position.x = x;
    scanBeam.add(emitter);
  }
  for (const [radius, opacity] of [[0.085, 0.22], [0.024, 0.95]]) {
    const ray = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, 2.74, 12),
      new THREE.MeshBasicMaterial({ color: '#a7f5ee', transparent: true, opacity, depthWrite: false }),
    );
    ray.rotation.z = Math.PI / 2;
    scanBeam.add(ray);
  }
  scanBeam.position.set(0, 2.32, 0.18);
  scanBeam.visible = false;
  machine.add(scanBeam);
  scanBounce = new THREE.Group();
  scanBounce.visible = false;
  for (const [radius, opacity] of [[0.15, 0.22], [0.055, 0.9]]) {
    scanBounce.add(new THREE.Mesh(
      new THREE.SphereGeometry(radius, 12, 8),
      new THREE.MeshBasicMaterial({ color: '#c0fff5', transparent: true, opacity,
        blending: THREE.AdditiveBlending, depthWrite: false }),
    ));
  }
  for (const end of [[-0.34, 0.30, 0.55], [0.08, 0.55, 0.54], [0.48, 0.20, 0.52]]) {
    const direction = new THREE.Vector3(...end);
    const ray = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.017, direction.length(), 6),
      new THREE.MeshBasicMaterial({ color: '#a7f5ee', transparent: true, opacity: 0.55,
        blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    ray.position.copy(direction).multiplyScalar(0.5);
    ray.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    scanBounce.add(ray);
  }
  const bouncedLight = new THREE.PointLight('#9cfff2', 2.5, 1.5);
  scanBounce.add(bouncedLight);
  machine.add(scanBounce);
  scanFloodLight = new THREE.PointLight('#82fff1', 0, 2.5);
  scanFloodLight.position.set(0, 2.60, 0.75);
  machine.add(scanFloodLight);
  scene.add(machine);

  bucket = new THREE.Group();
  bucket.position.copy(BUCKET_HOME);
  const pail = new THREE.Mesh(
    new THREE.CylinderGeometry(1.48, 1.34, 1.5, 40, 1, true),
    new THREE.MeshStandardMaterial({ color: '#928273', side: THREE.DoubleSide, roughness: 0.9 }),
  );
  pail.position.y = 0.80;
  pail.castShadow = true;
  bucket.add(pail);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(1.48, 0.07, 8, 40),
    new THREE.MeshStandardMaterial({ color: '#5c544a', roughness: 0.8 }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 1.56;
  bucket.add(rim);
  const bottom = new THREE.Mesh(
    new THREE.CylinderGeometry(1.34, 1.34, 0.04, 40),
    new THREE.MeshStandardMaterial({ color: '#6a5e52', roughness: 0.8 }),
  );
  bottom.position.y = 0.035;
  bucket.add(bottom);
  scene.add(bucket);

  for (const spec of scenario.phases.flatMap((phase) => phase.objects)) {
    const mesh = makeObject(spec);
    mesh.userData.objectId = spec.id;
    mesh.userData.bucketRadius = { cube: 0.44, column: 0.38, block: 0.53, sphere: 0.4,
      cone: 0.39, wedge: 0.48, prism: 0.43, pyramid: 0.44, capsule: 0.38 }[spec.visible.shape];
    mesh.visible = false;
    objects.set(spec.id, mesh);
    pickMeshes.push(mesh);
    scene.add(mesh);
  }

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
  context.font = 'bold 105px sans-serif';
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
    case 'sphere': geometry = new THREE.SphereGeometry(0.38, 24, 16); break;
    case 'cone': geometry = new THREE.ConeGeometry(0.37, 0.86, 24); break;
    case 'wedge': {
      const shape = new THREE.Shape();
      shape.moveTo(-0.43, -0.34); shape.lineTo(0.43, -0.34);
      shape.lineTo(-0.43, 0.34); shape.closePath();
      geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.62, bevelEnabled: false });
      geometry.translate(0, 0, -0.31);
      break;
    }
    case 'prism': geometry = new THREE.CylinderGeometry(0.4, 0.4, 0.78, 6); break;
    case 'pyramid': geometry = new THREE.ConeGeometry(0.44, 0.83, 4); break;
    case 'capsule': geometry = new THREE.CapsuleGeometry(0.28, 0.32, 6, 16); break;
    default: throw new Error(`Unsupported object shape: ${spec.visible.shape}`);
  }
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function renderIntro() {
  stage = 'intro';
  machine.visible = true;
  machine.position.y = 0;
  bucket.visible = true;
  bucket.position.copy(BUCKET_HOME);
  bucket.rotation.set(0, 0, 0);
  ui['language-menu'].hidden = false;
  setQuiz(null);
  for (const object of objects.values()) object.visible = false;
  setDetector(null);
  ui.progress.textContent = t('ready');
  ui.prompt.textContent = t('introPrompt');
  ui.detail.textContent = t('introDetail');
  ui.feedback.textContent = t('introFeedback');
  ui.begin.hidden = false;
  ui.next.hidden = true;
}

function start() {
  sounds.stop();
  narration?.stop();
  sounds.unlock();
  for (const timer of pendingTimers) clearTimeout(timer);
  pendingTimers.clear();
  flight = null;
  returnFlights = [];
  session = {
    schema: 'vr_blicket_task.web_session.v2',
    sessionId: crypto.randomUUID(),
    scenarioId: scenario.scenarioId,
    language,
    startedAt: new Date().toISOString(),
    trials: [],
    events: [],
    judgments: [],
  };
  pointerHeld = false;
  draggedObject = false;
  ui.begin.hidden = true;
  ui.restart.hidden = false;
  ui['language-menu'].hidden = true;
  beginPhase(0);
}

function phase() { return scenario.phases[phaseIndex]; }

function activeTrial() {
  const roles = scenario.evidenceOrder[trialIndex];
  return {
    trialId: `${phase().id}_trial_${trialIndex + 1}`,
    phaseId: phase().id,
    objectIds: roles.map((role) => phase().objects.find((object) => object.role === role).id),
  };
}

function beginPhase(index) {
  phaseIndex = index;
  trialIndex = 0;
  judgmentIndex = 0;
  placementIndex = 0;
  placedObjects = [];
  flight = null;
  returnFlights = [];
  ui.next.hidden = true;
  machine.visible = true;
  machine.position.y = 0;
  bucket.visible = true;
  bucket.position.set(BUCKET_ENTRY_X, 0, BUCKET_HOME.z);
  bucket.rotation.set(0, 0, 0);
  setQuiz(null);
  judgmentMarker.visible = false;
  platform.position.y = PLATFORM_Y;
  scanBeam.visible = false;
  scanBounce.visible = false;
  scanFloodLight.intensity = 0;
  checkElapsed = 0;
  setDetector(null);
  currentObject = null;
  bucketBodies = [];
  for (const object of objects.values()) object.visible = false;
  const positions = [[-0.58, -0.3], [0.57, -0.3], [0, 0.68]];
  phase().objects.forEach((spec, index) => {
    const mesh = objects.get(spec.id);
    bucket.add(mesh);
    mesh.visible = true;
    mesh.rotation.set(0, 0, 0);
    const [x, z] = positions[index];
    const radius = mesh.userData.bucketRadius;
    bucketBodies.push({ id: spec.id, mesh, x, z, vx: (Math.random() - 0.5) * 2,
      vz: (Math.random() - 0.5) * 2, phase: Math.random() * Math.PI * 2, radius });
    mesh.position.set(x, 0.065 + objectHalfHeight(mesh), z);
  });
  arrivalElapsed = 0;
  mixElapsed = 0;
  lastRattleAt = 0;
  stage = 'arrival';
  ui.progress.textContent = t('phaseProgress', { index: phaseIndex + 1, total: scenario.phases.length });
  ui.prompt.textContent = t('arrivalPrompt');
  ui.detail.textContent = t('arrivalDetail');
  ui.feedback.textContent = t('arrivalFeedback');
  log('phase_started', { phaseId: phase().id, rule: phase().rule });
  log('bucket_arrival_started', { phaseId: phase().id, bucketId: phase().bucketId,
    objectIds: phase().objects.map((object) => object.id) });
}

function showTrial() {
  placementIndex = 0;
  placedObjects = [];
  showPlacement();
}

function showPlacement() {
  const trial = activeTrial();
  const id = trial.objectIds[placementIndex];
  stage = 'presenting';
  currentObject = objects.get(id);
  bucketBodies = bucketBodies.filter((body) => body.id !== id);
  scene.attach(currentObject);
  flight = makeFlight(currentObject, START, LIFT_SECONDS);
  currentObject.rotation.set(0, 0, 0);
  bucket.visible = true;
  machine.visible = true;
  if (placementIndex === 0) setDetector(null);
  ui.progress.textContent = t('trialProgress', { phase: phaseIndex + 1, phases: scenario.phases.length,
    index: trialIndex + 1, total: scenario.evidenceOrder.length });
  ui.prompt.textContent = t('showPrompt', { object: nameOf(id) });
  ui.detail.textContent = t('showDetail');
  ui.feedback.textContent = t('showFeedback');
  ui.next.hidden = true;
}

function readyTrial() {
  const trial = activeTrial();
  const id = trial.objectIds[placementIndex];
  stage = 'ready';
  ui.prompt.textContent = t('readyPrompt', { object: nameOf(id) });
  ui.detail.textContent = t('readyDetail');
  ui.feedback.textContent = t('readyFeedback', { object: nameOf(id) });
  if (placementIndex === 0) log('trial_started', { trialId: trial.trialId, phaseId: phase().id,
    objectIds: trial.objectIds });
  narration?.play(placementIndex === 0 ? 'place_object' : 'add_object');
}

function setDetector(outcome, lit = true) {
  const visible = outcome !== null && lit;
  const signal = outcome ? '#efae43' : '#cf6050';
  const glow = outcome ? '#df6715' : '#aa2720';
  platform.material.color.set(visible ? signal : '#c9443c');
  platform.material.emissive.set(visible ? glow : '#000000');
  platform.material.emissiveIntensity = visible ? 0.7 : 0;
  for (const lamp of resultLamps) {
    lamp.material.color.set(visible ? signal : '#24352f');
    lamp.material.emissive.set(visible ? glow : '#000000');
    lamp.material.emissiveIntensity = visible ? 1.2 : 0;
  }
  if (signFrame) {
    const labelActive = visible && outcome === true;
    signFrame.material.color.set(labelActive ? '#ffcc68' : '#24352f');
    signFrame.material.emissive.set(labelActive ? '#ff981c' : '#000000');
    signFrame.material.emissiveIntensity = labelActive ? 1.4 : 0;
    if (machineLabel) machineLabel.material.color.set(labelActive ? '#ffedb0' : '#ffffff');
    if (labelLight) labelLight.intensity = labelActive ? 3.2 : 0;
  }
}

function updateScanBounce() {
  scanBounce.visible = false;
  scanFloodLight.intensity = scanBeam.visible ? 5 : 0;
  if (!scanBeam.visible || !currentObject) return;
  scanFloodLight.position.y = scanBeam.position.y + 0.32;
  machine.updateWorldMatrix(true, false);
  currentObject.updateWorldMatrix(true, false);
  const origin = machine.localToWorld(new THREE.Vector3(-1.37, scanBeam.position.y, scanBeam.position.z));
  scanRaycaster.set(origin, new THREE.Vector3(1, 0, 0));
  const hit = scanRaycaster.intersectObjects(placedObjects, false)[0];
  if (!hit) return;
  scanBounce.position.copy(machine.worldToLocal(hit.point.clone()));
  scanBounce.visible = true;
}

function onPointerDown(event) {
  if (event.button !== 0 || event.isPrimary === false) return;
  const target = pick(event);
  if (!target) return;
  if (stage === 'ready' && target.objectId === currentObject?.userData.objectId) {
    stage = 'held';
    pointerHeld = true;
    draggedObject = false;
    renderer.domElement.setPointerCapture(event.pointerId);
    currentObject.position.y = START.y + 0.16;
    ui.prompt.textContent = t('heldPrompt');
    ui.detail.textContent = t('heldDetail');
    ui.feedback.textContent = t('heldFeedback');
    sounds.play('pickup');
    log('object_picked_up', { trialId: activeTrial().trialId, objectId: currentObject.userData.objectId });
    return;
  }
  if (stage === 'held' && target.action === 'platform') {
    placeObject();
    return;
  }
}

function onPointerMove(event) {
  if (event.isPrimary === false) return;
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
  if (!pointerHeld || event.isPrimary === false) return;
  pointerHeld = false;
  if (renderer.domElement.hasPointerCapture(event.pointerId)) {
    renderer.domElement.releasePointerCapture(event.pointerId);
  }
  if (stage !== 'held') return;
  if (draggedObject && pointOnPlane(event) && overPlatform(dropPoint, currentObject)) {
    placeObject();
  } else if (draggedObject) {
    stage = 'resetting';
    flight = makeFlight(currentObject, START, LIFT_SECONDS, placedObjects);
  }
}

function onPointerCancel(event) {
  if (!pointerHeld || event.isPrimary === false) return;
  pointerHeld = false;
  draggedObject = false;
  if (renderer.domElement.hasPointerCapture(event.pointerId)) {
    renderer.domElement.releasePointerCapture(event.pointerId);
  }
  if (stage === 'held') {
    stage = 'resetting';
    flight = makeFlight(currentObject, START, LIFT_SECONDS, placedObjects);
  }
}

function clickable(target) {
  if (stage === 'ready' || stage === 'held') {
    return target.objectId === currentObject?.userData.objectId || (stage === 'held' && target.action === 'platform');
  }
  return false;
}

function pick(event) {
  const bounds = renderer.domElement.getBoundingClientRect();
  pointer.set(
    ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
    -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
  );
  raycaster.setFromCamera(pointer, camera);
  const visible = (mesh) => {
    for (let node = mesh; node; node = node.parent) if (!node.visible) return false;
    return true;
  };
  const hit = raycaster.intersectObjects(pickMeshes, false)
    .find(({ object }) => visible(object) && clickable(object.userData));
  if (hit) return hit.object.userData;
  if (!touchInput && event.pointerType !== 'touch') return;
  // A finger can land just outside a small projected object on a narrow screen.
  let nearest;
  let distance = 28;
  for (const mesh of pickMeshes) {
    if (!visible(mesh) || !clickable(mesh.userData)) continue;
    const projected = mesh.getWorldPosition(new THREE.Vector3()).project(camera);
    if (projected.z < -1 || projected.z > 1) continue;
    const x = bounds.left + (projected.x + 1) * bounds.width / 2;
    const y = bounds.top + (1 - projected.y) * bounds.height / 2;
    const candidate = Math.hypot(event.clientX - x, event.clientY - y);
    if (candidate < distance) { distance = candidate; nearest = mesh.userData; }
  }
  return nearest;
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

function makeFlight(object, to, duration, obstacles = []) {
  const halfHeight = objectHalfHeight(object);
  const obstacleTop = obstacles.reduce((top, other) =>
    Math.max(top, other.position.y + objectHalfHeight(other)), 0);
  return {
    object, from: object.position.clone(), to: to.clone(), duration, elapsed: 0,
    highY: Math.max(object.position.y, to.y, MACHINE_RIM_TOP + halfHeight + 0.28,
      obstacleTop + halfHeight + 0.28),
  };
}

function moveFlight(motion, delta) {
  motion.elapsed += delta;
  const progress = Math.min(motion.elapsed / motion.duration, 1);
  const ease = (value) => value * value * (3 - 2 * value);
  const { object, from, to, highY } = motion;
  if (progress < 0.28) {
    object.position.set(from.x, THREE.MathUtils.lerp(from.y, highY, ease(progress / 0.28)), from.z);
  } else if (progress < 0.72) {
    const across = ease((progress - 0.28) / 0.44);
    object.position.set(THREE.MathUtils.lerp(from.x, to.x, across),
      highY + 0.16 * Math.sin(Math.PI * across),
      THREE.MathUtils.lerp(from.z, to.z, across));
  } else {
    object.position.set(to.x, THREE.MathUtils.lerp(highY, to.y, ease((progress - 0.72) / 0.28)), to.z);
  }
  return progress === 1;
}

function placeObject() {
  if (stage !== 'held') return;
  const trial = activeTrial();
  narration?.stop();
  stage = 'placing';
  pointerHeld = false;
  const slot = trial.objectIds.length === 1 ? 0 : placementIndex === 0 ? -PAIR_X : PAIR_X;
  const destination = new THREE.Vector3(DETECTOR.x + slot,
    PLATFORM_TOP + objectHalfHeight(currentObject), DETECTOR.z);
  flight = makeFlight(currentObject, destination, PLACE_SECONDS, placedObjects);
  ui.prompt.textContent = t('placingPrompt');
  ui.detail.textContent = t('placingDetail');
  ui.feedback.textContent = t('placingFeedback');
}

function finishPlacement() {
  const trial = activeTrial();
  placedObjects.push(currentObject);
  const id = currentObject.userData.objectId;
  log('platform_contact_detected', { trialId: trial.trialId, phaseId: phase().id, objectId: id,
    objectIdsOnPlatform: placedObjects.map((object) => object.userData.objectId) });
  sounds.play('place');
  placementIndex += 1;
  if (placementIndex < trial.objectIds.length) {
    showPlacement();
    return;
  }
  stage = 'checking';
  checkElapsed = 0;
  outcomeActivated = null;
  setDetector(null);
  ui.prompt.textContent = t('checkingPrompt');
  ui.detail.textContent = t('checkingDetail');
  ui.feedback.textContent = t('checkingFeedback');
  sounds.play('press');
  const timer = setTimeout(() => {
    pendingTimers.delete(timer);
    showOutcome();
  }, scenario.detector.checkDurationMs + REVEAL_PAUSE_MS);
  pendingTimers.add(timer);
}

function showOutcome() {
  if (stage !== 'checking') return;
  const trial = activeTrial();
  const blicketIds = phase().objects.filter((object) => object.hiddenBlicket).map((object) => object.id);
  const activated = phase().rule === 'disjunctive'
    ? trial.objectIds.some((id) => blicketIds.includes(id))
    : blicketIds.every((id) => trial.objectIds.includes(id));
  stage = 'outcome';
  scanBeam.visible = false;
  scanBounce.visible = false;
  scanFloodLight.intensity = 0;
  platform.position.y = PLATFORM_Y - (PLATFORM_TOP - RECESS_LIP_Y +
    Math.min(...placedObjects.map(objectHalfHeight)));
  for (const object of placedObjects) object.position.y = platform.position.y + 0.09 + objectHalfHeight(object);
  outcomeActivated = activated;
  outcomeAt = performance.now();
  setDetector(activated);
  if (activated) sounds.play('activate');
  ui.prompt.textContent = t(activated ? 'activePrompt' : 'inactivePrompt');
  ui.detail.textContent = t(activated ? 'activeDetail' : 'inactiveDetail');
  ui.feedback.textContent = t(activated ? 'activeFeedback' : 'inactiveFeedback');
  ui.next.hidden = false;
  ui.next.textContent = t(trialIndex + 1 < scenario.evidenceOrder.length ? 'next' : 'choices');
  session.trials.push({ trialId: trial.trialId, phaseId: phase().id, rule: phase().rule,
    objectIds: trial.objectIds, activated });
  log('detector_outcome', { trialId: trial.trialId, phaseId: phase().id, objectIds: trial.objectIds, activated });
}

function advance() {
  if (stage !== 'outcome') return;
  sounds.stop();
  narration?.stop();
  stage = 'returning';
  returnFlights = placedObjects.map((object) => makeFlight(object, tablePosition(object), RETURN_SECONDS));
  setDetector(null);
  ui.next.hidden = true;
  ui.detail.textContent = t('returningDetail');
  ui.feedback.textContent = t('returningFeedback');
  log('object_return_started', { trialId: activeTrial().trialId, objectIds: activeTrial().objectIds });
}

function tablePosition(object) {
  const index = phase().objects.findIndex((spec) => spec.id === object.userData.objectId);
  return new THREE.Vector3(0.15 + index * 1.4, TABLE_TOP + objectHalfHeight(object), 1.65);
}

function finishReturn() {
  returnFlights.forEach(({ object, to }) => object.position.copy(to));
  sounds.play('return');
  log('object_returned_to_table', { trialId: activeTrial().trialId, objectIds: activeTrial().objectIds });
  trialIndex += 1;
  if (trialIndex < scenario.evidenceOrder.length) showTrial();
  else { judgmentIndex = 0; showJudgment(); }
}

function showJudgment() {
  stage = 'judge';
  const spec = phase().objects[judgmentIndex];
  const objectId = spec.id;
  const object = objects.get(objectId);
  judgmentMarker.position.copy(object.position);
  judgmentMarker.position.y = TABLE_TOP + 0.03;
  judgmentMarker.visible = true;
  setQuiz('judge');
  ui.progress.textContent = t('questionProgress', { phase: phaseIndex + 1, index: judgmentIndex + 1,
    total: phase().objects.length });
  ui.prompt.textContent = t('judgePrompt', { object: nameOf(spec.id) });
  ui.detail.textContent = t('judgeDetail');
  ui.feedback.textContent = t('judgeFeedback');
  log('final_sequential_prompt_opened', { phaseId: phase().id, objectId });
  narration?.play('judge_object');
}

function submitJudgment(saysBlicket) {
  if (stage !== 'judge') return;
  const objectId = phase().objects[judgmentIndex].id;
  session.judgments.push({ phaseId: phase().id, objectId, saysBlicket });
  sounds.play('choice');
  log('final_sequential_choice_submitted', { phaseId: phase().id, objectId, saysBlicket });
  judgmentIndex += 1;
  if (judgmentIndex < phase().objects.length) showJudgment();
  else if (phaseIndex + 1 < scenario.phases.length) beginPhase(phaseIndex + 1);
  else complete();
}

function complete() {
  if (stage === 'complete') return;
  narration?.stop();
  stage = 'complete';
  setQuiz(null);
  judgmentMarker.visible = false;
  machine.visible = true;
  bucket.visible = false;
  setDetector(null);
  sounds.play('complete');
  session.completedAt = new Date().toISOString();
  log('session_completed', {});
  ui.progress.textContent = t('completeProgress');
  ui.prompt.textContent = t('completePrompt');
  ui.detail.textContent = t('completeDetail');
  ui.feedback.textContent = t('completeFeedback');
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
  // Fit the bucket, raised object, machine and table row at every aspect.
  const target = new THREE.Vector3(0, 0.85, 0.25);
  const direction = new THREE.Vector3(0, 5.6, 7.2).normalize();
  const up = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(1, 0, 0));
  const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 0.92;
  let distance = 8.6;
  for (const x of [-4, 4.35]) for (const y of [-0.1, 3.6]) for (const z of [-1.5, 3.6]) {
    const corner = new THREE.Vector3(x, y, z).sub(target);
    distance = Math.max(distance, corner.dot(direction) +
      Math.max(Math.abs(corner.x) / (tangent * camera.aspect), Math.abs(corner.dot(up)) / tangent));
  }
  camera.position.copy(target).addScaledVector(direction, distance);
  camera.lookAt(target);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  renderer.setSize(width, height, false);
}

function animate(time) {
  const delta = Math.min((time - lastFrame) / 1000 || 0, 0.05);
  lastFrame = time;

  const shaking = stage === 'arrival' || stage === 'mixing';
  const motionScale = reducedMotion ? 0.18 : 1;
  if (bucket.visible && bucketBodies.length) {
    stepBucketBodies(bucketBodies, delta, shaking ? 9 * motionScale : 0, time / 1000);
    bucketBodies.forEach((body, index) => {
      const phase = body.phase || index * 2;
      const bounce = shaking ? Math.abs(Math.sin(time * 0.027 + phase)) * 0.09 * motionScale : 0;
      body.mesh.position.set(body.x, 0.065 + objectHalfHeight(body.mesh) + bounce, body.z);
      body.mesh.rotation.set(shaking ? Math.sin(time * 0.017 + phase) * 0.05 * motionScale : 0,
        0, shaking ? Math.cos(time * 0.021 + phase) * 0.05 * motionScale : 0);
    });
  }

  if (shaking) {
    if (time - lastRattleAt > 450) {
      sounds.play('rattle');
      lastRattleAt = time;
    }
  }
  if (stage === 'arrival') {
    arrivalElapsed += delta;
    const progress = Math.min(arrivalElapsed / ARRIVAL_SECONDS, 1);
    const eased = 1 - (1 - progress) ** 3;
    bucket.position.x = BUCKET_ENTRY_X + (BUCKET_HOME.x - BUCKET_ENTRY_X) * eased;
    bucket.rotation.z = Math.sin(time * 0.023) * 0.05 * (1 - progress) * motionScale;
    bucket.rotation.x = Math.sin(time * 0.018) * 0.035 * (1 - progress) * motionScale;
    if (progress === 1) {
      bucket.position.copy(BUCKET_HOME);
      bucket.rotation.set(0, 0, 0);
      sounds.play('land');
      log('bucket_arrived', { phaseId: phase().id, bucketId: phase().bucketId });
      stage = 'mixing';
      ui.progress.textContent = t('mixing');
      ui.prompt.textContent = t('mixingPrompt');
      ui.detail.textContent = t('mixingDetail');
      log('bucket_mixing_started', { phaseId: phase().id, bucketId: phase().bucketId });
    }
  }

  if (stage === 'mixing') {
    mixElapsed += delta;
    const envelope = Math.max(0, Math.min(1, (MIX_SECONDS - mixElapsed) / 0.3)) * motionScale;
    bucket.position.set(BUCKET_HOME.x + Math.sin(time * 0.025) * 0.09 * envelope,
      Math.abs(Math.sin(time * 0.019)) * 0.045 * envelope,
      BUCKET_HOME.z + Math.cos(time * 0.021) * 0.06 * envelope);
    bucket.rotation.set(Math.sin(time * 0.021) * 0.065 * envelope, 0,
      Math.cos(time * 0.025) * 0.075 * envelope);
    if (mixElapsed >= MIX_SECONDS) {
      bucket.position.copy(BUCKET_HOME);
      bucket.rotation.set(0, 0, 0);
      log('bucket_mixed', { phaseId: phase().id, bucketId: phase().bucketId });
      showTrial();
    }
  }
  if (flight && (stage === 'presenting' || stage === 'placing' || stage === 'resetting')) {
    if (moveFlight(flight, delta)) {
      const finishedStage = stage;
      flight = null;
      if (finishedStage === 'presenting') readyTrial();
      else if (finishedStage === 'placing') finishPlacement();
      else {
        stage = 'ready';
        ui.prompt.textContent = t('readyPrompt', { object: nameOf(currentObject.userData.objectId) });
        ui.detail.textContent = t('readyDetail');
        ui.feedback.textContent = t('readyFeedback', { object: nameOf(currentObject.userData.objectId) });
      }
    }
  }

  if (stage === 'returning') {
    let returned = true;
    for (const motion of returnFlights) returned = moveFlight(motion, delta) && returned;
    if (returned) finishReturn();
  }

  if (stage === 'checking') {
    checkElapsed += delta;
    const progress = Math.min(checkElapsed / SCAN_START_SECONDS, 1);
    const eased = progress * progress * (3 - 2 * progress);
    const drop = PLATFORM_TOP - RECESS_LIP_Y + Math.min(...placedObjects.map(objectHalfHeight));
    platform.position.y = PLATFORM_Y - drop * eased;
    scanBeam.visible = progress === 1 && checkElapsed < scenario.detector.checkDurationMs / 1000;
    const scanProgress = Math.max(0, Math.min((checkElapsed - SCAN_START_SECONDS) /
      (scenario.detector.checkDurationMs / 1000 - SCAN_START_SECONDS), 1));
    scanBeam.position.y = RECESS_LIP_Y + 0.07 + 0.19 * Math.sin(scanProgress * Math.PI);
  } else {
    scanBeam.visible = false;
    if (stage !== 'outcome') platform.position.y = THREE.MathUtils.damp(platform.position.y, PLATFORM_Y, 9, delta);
  }
  if (stage === 'checking' || stage === 'outcome') {
    for (const object of placedObjects) object.position.y = platform.position.y + 0.09 + objectHalfHeight(object);
  }
  updateScanBounce();
  if (stage === 'outcome') {
    const elapsed = time - outcomeAt;
    const pulseOn = elapsed >= Math.max(scenario.detector.activationDurationMs, 1400) ||
      Math.floor(elapsed / 170) % 2 === 0;
    setDetector(outcomeActivated, pulseOn);
  }
  renderer.render(scene, camera);
}
