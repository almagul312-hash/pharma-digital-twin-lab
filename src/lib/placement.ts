export const TABLE_LIMITS = { x: 2.02, z: 0.86 } as const;

export function clampTable(x: number, z: number) {
  return {
    x: Math.min(TABLE_LIMITS.x, Math.max(-TABLE_LIMITS.x, x)),
    z: Math.min(TABLE_LIMITS.z, Math.max(-TABLE_LIMITS.z, z)),
  };
}

export type Blocker = { x: number; z: number; radius: number };

/**
 * Push a disk out of locked footprints on the bench plane.
 * Used while a kinematic body follows the pointer, because kinematic bodies
 * are not stopped by contacts. Resting dynamic bodies still collide in Rapier.
 */
export function placeWithoutOverlap(x: number, z: number, radius: number, blockers: Blocker[]) {
  let point = clampTable(x, z);
  for (let pass = 0; pass < 6; pass += 1) {
    for (const blocker of blockers) {
      const dx = point.x - blocker.x;
      const dz = point.z - blocker.z;
      const distance = Math.hypot(dx, dz);
      const minimum = radius + blocker.radius;
      if (distance >= minimum) {
        continue;
      }
      const awayX = distance < 0.0001 ? 1 : dx / distance;
      const awayZ = distance < 0.0001 ? 0 : dz / distance;
      const push = minimum - distance;
      point = clampTable(point.x + awayX * push, point.z + awayZ * push);
    }
  }
  return point;
}
