import * as THREE from 'three';
import { SAFE_HALF } from './config.js';
import { rand, distXZ, angleToXZ } from './utils.js';

const SHIRT_COLORS = [0x8f5a4a, 0x4a6b8f, 0x8f8a4a, 0x6b4a8f, 0x4a8f6b, 0x8f4a6b];
const pantsMat = new THREE.MeshLambertMaterial({ color: 0x3d3a35 });
const skinMat = new THREE.MeshLambertMaterial({ color: 0xd8ab84 });
const hairMats = [
  new THREE.MeshLambertMaterial({ color: 0x2a1e12 }),
  new THREE.MeshLambertMaterial({ color: 0x5a4028 }),
  new THREE.MeshLambertMaterial({ color: 0x8a8a8a }),
];

function buildVillager(i) {
  const g = new THREE.Group();
  const shirtMat = new THREE.MeshLambertMaterial({ color: SHIRT_COLORS[i % SHIRT_COLORS.length] });

  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.75, 0.26), pantsMat);
  legL.position.set(-0.15, 0.42, 0);
  const legR = legL.clone();
  legR.position.x = 0.15;
  g.add(legL, legR);

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.34), shirtMat);
  torso.position.y = 1.2;
  g.add(torso);

  for (const sx of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.65, 0.18), shirtMat);
    arm.position.set(sx * 0.38, 1.25, 0);
    g.add(arm);
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.16), skinMat);
    hand.position.set(sx * 0.38, 0.86, 0);
    g.add(hand);
  }

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.38), skinMat);
  head.position.y = 1.85;
  g.add(head);

  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 0.42), hairMats[i % 3]);
  hair.position.y = 2.06;
  g.add(hair);

  g.rotation.y = Math.PI;
  const outer = new THREE.Group();
  outer.add(g);
  outer.userData.limbs = { legL, legR };
  return outer;
}

export class VillagerManager {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.villagers = [];
    for (let i = 0; i < 10; i++) {
      const v = {
        group: buildVillager(i),
        wanderTarget: { x: rand(-SAFE_HALF + 8, SAFE_HALF - 8), z: rand(-SAFE_HALF + 8, SAFE_HALF - 8) },
        wanderTimer: rand(0, 4),
        walkPhase: rand(0, Math.PI * 2),
        pauseTimer: 0,
      };
      v.group.position.set(rand(-SAFE_HALF + 10, SAFE_HALF - 10), 0, rand(-SAFE_HALF + 10, SAFE_HALF - 10));
      v.group.traverse(o => { if (o.isMesh) o.castShadow = true; });
      scene.add(v.group);
      this.villagers.push(v);
    }
  }

  update(dt) {
    for (const v of this.villagers) {
      const limbs = v.group.userData.limbs;

      if (v.pauseTimer > 0) {
        v.pauseTimer -= dt;
        limbs.legL.rotation.x *= 0.85;
        limbs.legR.rotation.x *= 0.85;
        continue;
      }

      const pos = v.group.position;
      const d = distXZ(pos, v.wanderTarget);

      if (d < 1.2) {
        v.pauseTimer = rand(1.5, 5);
        v.wanderTarget = {
          x: rand(-SAFE_HALF + 8, SAFE_HALF - 8),
          z: rand(-SAFE_HALF + 8, SAFE_HALF - 8),
        };
        continue;
      }

      const targetYaw = angleToXZ(pos, v.wanderTarget);
      let diff = targetYaw - v.group.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      v.group.rotation.y += diff * Math.min(1, dt * 6);

      pos.x += Math.sin(targetYaw) * 1.8 * dt;
      pos.z += Math.cos(targetYaw) * 1.8 * dt;
      this.world.resolveCollision(pos, 0.4);

      v.walkPhase += dt * 6;
      const swing = Math.sin(v.walkPhase) * 0.4;
      limbs.legL.rotation.x = swing;
      limbs.legR.rotation.x = -swing;
    }
  }
}
