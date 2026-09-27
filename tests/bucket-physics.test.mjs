import assert from 'node:assert/strict';
import test from 'node:test';
import { BUCKET_INNER_RADIUS, stepBucketBodies } from '../bucket-physics.mjs';

test('three objects stay inside the moving bucket without overlapping', () => {
  const bodies = [
    { x: -0.58, z: -0.3, vx: 0, vz: 0, radius: 0.44 },
    { x: 0.57, z: -0.3, vx: 0, vz: 0, radius: 0.38 },
    { x: 0, z: 0.68, vx: 0, vz: 0, radius: 0.53 },
  ];
  for (let frame = 0; frame < 180; frame += 1) {
    stepBucketBodies(bodies, 1 / 60, 7, frame / 60);
    for (const body of bodies) {
      assert.ok(Math.hypot(body.x, body.z) + body.radius <= BUCKET_INNER_RADIUS + 0.001);
    }
    for (let i = 0; i < bodies.length; i += 1) {
      for (let j = i + 1; j < bodies.length; j += 1) {
        assert.ok(Math.hypot(bodies[i].x - bodies[j].x, bodies[i].z - bodies[j].z) >=
          bodies[i].radius + bodies[j].radius - 0.003);
      }
    }
  }
});

test('overlapping objects separate on contact', () => {
  const bodies = [
    { x: 0, z: 0, vx: 0, vz: 0, radius: 0.4 },
    { x: 0, z: 0, vx: 0, vz: 0, radius: 0.4 },
  ];
  stepBucketBodies(bodies, 1 / 60);
  assert.ok(Math.hypot(bodies[0].x - bodies[1].x, bodies[0].z - bodies[1].z) >= 0.8 - 0.001);
});
