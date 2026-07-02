import * as THREE from 'three';
import { COIN_MAX, COIN_RESPAWN, COIN_PICKUP_RADIUS, MAP_HALF, SAFE_HALF } from './config.js';
import { rand, distXZ } from './utils.js';

const coinGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.1, 12);
const coinMat = new THREE.MeshLambertMaterial({ color: 0xffd24a, emissive: 0x8a6a10 });
const rimMat = new THREE.MeshLambertMaterial({ color: 0xb8860b, emissive: 0x5a4208 });
const rimGeo = new THREE.TorusGeometry(0.45, 0.06, 6, 14);

export class CoinManager {
  constructor(scene) {
    this.scene = scene;
    this.coins = [];
    this.respawnTimer = 0;
    for (let i = 0; i < COIN_MAX; i++) this.spawnCoin();
  }

  spawnCoin() {
    let x, z, tries = 0;
    do {
      x = rand(-MAP_HALF + 15, MAP_HALF - 15);
      z = rand(-MAP_HALF + 15, MAP_HALF - 15);
      tries++;
    } while (Math.abs(x) < SAFE_HALF + 5 && Math.abs(z) < SAFE_HALF + 5 && tries < 30);

    const g = new THREE.Group();
    const disc = new THREE.Mesh(coinGeo, coinMat);
    disc.rotation.x = Math.PI / 2;
    g.add(disc);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    g.add(rim);
    g.position.set(x, 0.8, z);
    g.userData.phase = rand(0, Math.PI * 2);
    this.scene.add(g);
    this.coins.push(g);
  }

  update(dt, playerPos, onPickup) {
    this.respawnTimer -= dt;
    if (this.respawnTimer <= 0 && this.coins.length < COIN_MAX) {
      this.respawnTimer = COIN_RESPAWN;
      this.spawnCoin();
    }

    const t = performance.now() * 0.002;
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      c.rotation.y = t + c.userData.phase;
      c.position.y = 0.8 + Math.sin(t * 1.5 + c.userData.phase) * 0.15;

      if (distXZ(c.position, playerPos) < COIN_PICKUP_RADIUS) {
        this.scene.remove(c);
        this.coins.splice(i, 1);
        onPickup(1);
      }
    }
  }
}
