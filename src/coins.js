import * as THREE from 'three';
import { COIN_MAX, COIN_RESPAWN, COIN_PICKUP_RADIUS, FIELD_COIN_VALUE, MAP_HALF, SAFE_HALF } from './config.js';
import { rand, randInt, distXZ } from './utils.js';

const coinGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.1, 12);
const coinMat = new THREE.MeshLambertMaterial({ color: 0xffd24a, emissive: 0x8a6a10 });
const rimMat = new THREE.MeshLambertMaterial({ color: 0xb8860b, emissive: 0x5a4208 });
const rimGeo = new THREE.TorusGeometry(0.45, 0.06, 6, 14);

const MAGNET_RADIUS = 6;
const MAGNET_SPEED = 14;
const DROP_LIFE = 45;

export class CoinManager {
  constructor(scene) {
    this.scene = scene;
    this.coins = [];
    this.respawnTimer = 0;
    for (let i = 0; i < COIN_MAX; i++) this.spawnFieldCoin();
  }

  makeCoin(x, y, z, value, scale = 1) {
    const g = new THREE.Group();
    const disc = new THREE.Mesh(coinGeo, coinMat);
    disc.rotation.x = Math.PI / 2;
    g.add(disc);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    g.add(rim);
    g.position.set(x, y, z);
    g.scale.setScalar(scale);
    g.userData.phase = rand(0, Math.PI * 2);
    g.userData.value = value;
    this.scene.add(g);
    this.coins.push(g);
    return g;
  }

  spawnFieldCoin() {
    let x, z, tries = 0;
    do {
      x = rand(-MAP_HALF + 15, MAP_HALF - 15);
      z = rand(-MAP_HALF + 15, MAP_HALF - 15);
      tries++;
    } while (Math.abs(x) < SAFE_HALF + 5 && Math.abs(z) < SAFE_HALF + 5 && tries < 30);

    const c = this.makeCoin(x, 0.8, z, FIELD_COIN_VALUE);
    c.userData.field = true;
  }

  dropBurst(pos, total, forceCount) {
    const count = forceCount || randInt(6, 10);
    const value = Math.max(1, Math.round(total / count));
    for (let i = 0; i < count; i++) {
      const ang = rand(0, Math.PI * 2);
      const dist = rand(0.4, 2.8);
      const c = this.makeCoin(
        pos.x + Math.sin(ang) * dist,
        0.8,
        pos.z + Math.cos(ang) * dist,
        value,
        0.75
      );
      c.userData.drop = true;
      c.userData.life = DROP_LIFE;
      c.userData.popVel = rand(3, 6);
      c.userData.popY = rand(0.5, 1.2);
      c.position.y = c.userData.popY + 1.2;
    }
  }

  update(dt, playerPos, onPickup) {
    this.respawnTimer -= dt;
    const fieldCount = this.coins.reduce((n, c) => n + (c.userData.field ? 1 : 0), 0);
    if (this.respawnTimer <= 0 && fieldCount < COIN_MAX) {
      this.respawnTimer = COIN_RESPAWN;
      this.spawnFieldCoin();
    }

    const t = performance.now() * 0.002;
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      const viewD = distXZ(c.position, playerPos);
      c.visible = viewD < 180;
      if (!c.visible && !c.userData.drop) continue;
      c.rotation.y = t * 1.5 + c.userData.phase;

      if (c.userData.drop) {
        c.userData.life -= dt;
        if (c.userData.life <= 0) {
          this.scene.remove(c);
          this.coins.splice(i, 1);
          continue;
        }
        if (c.userData.popVel !== undefined) {
          c.position.y += c.userData.popVel * dt;
          c.userData.popVel -= 14 * dt;
          if (c.position.y <= 0.8 && c.userData.popVel < 0) {
            c.position.y = 0.8;
            delete c.userData.popVel;
          }
        }
        if (c.userData.life < 6) {
          c.visible = Math.floor(c.userData.life * 6) % 2 === 0;
        }
      } else {
        c.position.y = 0.8 + Math.sin(t * 1.5 + c.userData.phase) * 0.15;
      }

      const d = distXZ(c.position, playerPos);
      if (d < MAGNET_RADIUS && c.userData.popVel === undefined) {
        const pull = (1 - d / MAGNET_RADIUS) * MAGNET_SPEED + 3;
        const dx = playerPos.x - c.position.x;
        const dz = playerPos.z - c.position.z;
        const len = Math.max(d, 0.01);
        c.position.x += (dx / len) * pull * dt;
        c.position.z += (dz / len) * pull * dt;
      }

      if (d < COIN_PICKUP_RADIUS) {
        this.scene.remove(c);
        this.coins.splice(i, 1);
        onPickup(c.userData.value || 1);
      }
    }
  }
}
