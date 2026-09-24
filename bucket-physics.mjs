// Small, deterministic collision step for the three objects inside the moving bucket.
export const BUCKET_INNER_RADIUS = 1.28;

export function stepBucketBodies(bodies, dt, shake = 0, elapsed = 0) {
  const step = Math.min(Math.max(dt, 0), 0.05);
  const damping = Math.exp(-2.8 * step);

  bodies.forEach((body, index) => {
    body.vx = (body.vx + Math.sin(elapsed * 19 + index * 2.4) * shake * step) * damping;
    body.vz = (body.vz + Math.cos(elapsed * 23 + index * 2.1) * shake * step) * damping;
    body.x += body.vx * step;
    body.z += body.vz * step;
  });

  // A few short passes keep all three solids separated after a hard bucket shake.
  for (let pass = 0; pass < 3; pass += 1) {
    for (const body of bodies) {
      const distance = Math.hypot(body.x, body.z);
      const limit = BUCKET_INNER_RADIUS - body.radius;
      if (distance <= limit) continue;
      const nx = distance ? body.x / distance : 1;
      const nz = distance ? body.z / distance : 0;
      body.x = nx * limit;
      body.z = nz * limit;
      const outwardSpeed = body.vx * nx + body.vz * nz;
      if (outwardSpeed > 0) {
        body.vx -= 1.45 * outwardSpeed * nx;
        body.vz -= 1.45 * outwardSpeed * nz;
      }
    }

    for (let i = 0; i < bodies.length; i += 1) {
      for (let j = i + 1; j < bodies.length; j += 1) {
        const a = bodies[i];
        const b = bodies[j];
        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const distance = Math.hypot(dx, dz);
        const minDistance = a.radius + b.radius;
        if (distance >= minDistance) continue;
        const nx = distance ? dx / distance : 1;
        const nz = distance ? dz / distance : 0;
        const overlap = (minDistance - distance) / 2;
        a.x -= nx * overlap;
        a.z -= nz * overlap;
        b.x += nx * overlap;
        b.z += nz * overlap;
        const closingSpeed = (b.vx - a.vx) * nx + (b.vz - a.vz) * nz;
        if (closingSpeed < 0) {
          const impulse = -0.7 * closingSpeed;
          a.vx -= impulse * nx;
          a.vz -= impulse * nz;
          b.vx += impulse * nx;
          b.vz += impulse * nz;
        }
      }
    }
  }
}
