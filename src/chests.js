import * as THREE from 'three';
import { CHEST_COUNT, CHEST_COIN_MIN, CHEST_COIN_MAX, MAP_HALF, SAFE_HALF } from './config.js';
import { rand, randInt, distXZ } from './utils.js';

const bodyMat = new THREE.MeshLambertMaterial({ color: 0x7a5230 });
const darkMat = new THREE.MeshLambertMaterial({ color: 0x54402a });
const brassMat = new THREE.MeshLambertMaterial({ color: 0xc9a227, emissive: 0x2a1f05 });
const openedMat = new THREE.MeshLambertMaterial({ color: 0x4a3a26 });

export class ChestManager {
  constructor(scene) {
    this.scene = scene;
    this.chests = [];
    for (let i = 0; i < CHEST_COUNT; i++) this.spawnChest();
  }

  spawnChest() {
    let x, z, tries = 0;
    do {
      x = rand(-MAP_HALF + 30, MAP_HALF - 30);
      z = rand(-MAP_HALF + 30, MAP_HALF - 30);
      tries++;
    } while (Math.abs(x) < SAFE_HALF + 20 && Math.abs(z) < SAFE_HALF + 20 && tries < 40);

    const g = new THREE.Group();

    const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.9, 1.0), bodyMat);
    body.position.y = 0.45;
    body.castShadow = true;
    g.add(body);

    for (const dy of [0.15, 0.75]) {
      const band = new THREE.Mesh(new THREE.BoxGeometry(1.54, 0.1, 1.04), darkMat);
      band.position.y = dy;
      g.add(band);
    }

    const lid = new THREE.Group();
    const lidMesh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.35, 1.0), bodyMat);
    lidMesh.position.set(0, 0.175, 0.5);
    lidMesh.castShadow = true;
    lid.add(lidMesh);
    const lidBand = new THREE.Mesh(new THREE.BoxGeometry(1.54, 0.12, 1.04), darkMat);
    lidBand.position.set(0, 0.28, 0.5);
    lid.add(lidBand);
    const lock = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.26, 0.1), brassMat);
    lock.position.set(0, 0.05, 1.0);
    lid.add(lock);
    lid.position.set(0, 0.9, -0.5);
    g.add(lid);

    const glow = new THREE.PointLight(0xffd24a, 0, 6);
    glow.position.y = 1.2;
    g.add(glow);

    g.position.set(x, 0, z);
    g.rotation.y = rand(0, Math.PI * 2);
    this.scene.add(g);

    this.chests.push({ group: g, lid, glow, opened: false, lidTarget: 0 });
  }

  nearestUnopened(playerPos, maxDist = 3.5) {
    let best = null, bestD = maxDist;
    for (const c of this.chests) {
      if (c.opened) continue;
      const d = distXZ(c.group.position, playerPos);
      if (d < bestD) { best = c; bestD = d; }
    }
    return best;
  }

  open(chest, coinManager) {
    if (chest.opened) return 0;
    chest.opened = true;
    chest.lidTarget = -2.1;
    chest.glow.intensity = 4;
    chest.group.traverse(o => {
      if (o.isMesh && o.material === bodyMat) o.material = openedMat;
    });
    const total = randInt(CHEST_COIN_MIN, CHEST_COIN_MAX);
    coinManager.dropBurst(chest.group.position, total, 14);
    return total;
  }

  update(dt) {
    for (const c of this.chests) {
      if (!c.opened) continue;
      if (c.lid.rotation.x > c.lidTarget) {
        c.lid.rotation.x = Math.max(c.lidTarget, c.lid.rotation.x - dt * 5);
      }
      if (c.glow.intensity > 0) {
        c.glow.intensity = Math.max(0, c.glow.intensity - dt * 1.5);
      }
    }
  }
}
