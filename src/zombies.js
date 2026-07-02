import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { ZOMBIES, ZOMBIE_CAP, SPAWN_INTERVAL, SPAWNS_PER_TICK, INITIAL_SPAWNS, ZOMBIE_CULL_DIST, ATTACK_RANGE, LOSE_SIGHT_TIME, MAP_HALF, SAFE_HALF, GATE_WIDTH, GATE_Z } from './config.js';
import { rand, randInt, distXZ, angleToXZ, inFov } from './utils.js';
import { isInsideSafeZone } from './world.js';

const sharedMat = new THREE.MeshLambertMaterial({ vertexColors: true });
const CLOTH = 0x3d3a35;
const CLOTH2 = 0x4a4238;
const EYE = 0xff2a1a;
const JAW = 0x1a0808;
const PAD = 0x2a2420;
const SPIKE = 0x38303f;

function colorize(geo, hex) {
  const c = new THREE.Color(hex);
  const n = geo.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return geo;
}

function cBox(w, h, d, hex, x, y, z, rx = 0, ry = 0, rz = 0) {
  const g = new THREE.BoxGeometry(w, h, d);
  if (rx || ry || rz) { g.rotateX(rx); g.rotateY(ry); g.rotateZ(rz); }
  g.translate(x, y, z);
  return colorize(g, hex);
}

function cCone(r, h, seg, hex, x, y, z, rx = 0) {
  const g = new THREE.ConeGeometry(r, h, seg);
  if (rx) g.rotateX(rx);
  g.translate(x, y, z);
  return colorize(g, hex);
}

const typeAssets = {};
function getTypeAssets(type) {
  if (typeAssets[type]) return typeAssets[type];
  const def = ZOMBIES[type];
  const skin = def.color;
  const darker = (def.color & 0xfefefe) >> 1;

  const parts = [
    cBox(0.72, 0.9, 0.4, type === 'bruiser' || type === 'super' ? darker : CLOTH2, 0, 1.3, 0),
    cBox(0.74, 0.4, 0.42, skin, 0, 1.55, 0),
    cBox(0.46, 0.46, 0.46, skin, 0, 2.0, 0),
    cBox(0.24, 0.06, 0.03, JAW, 0, 1.88, -0.235),
  ];

  const eyeW = type === 'super' ? 0.13 : 0.09;
  for (const ex of [-0.11, 0.11]) {
    parts.push(cBox(eyeW, 0.06, 0.02, EYE, ex, 2.05, -0.24));
  }

  if (type === 'leader' || type === 'alpha' || type === 'super') {
    for (const sx of [-0.42, 0.42]) {
      parts.push(cBox(0.26, 0.16, 0.44, PAD, sx, 1.72, 0));
    }
    parts.push(cCone(0.1, 0.3, 4, type === 'leader' ? PAD : EYE, 0, 2.36, 0));
  }

  if (type === 'bruiser' || type === 'super') {
    for (const [sx, sy] of [[-0.3, 1.75], [0, 1.85], [0.3, 1.75]]) {
      parts.push(cCone(0.09, 0.35, 4, SPIKE, sx, sy, 0.18, 0.5));
    }
  }

  const staticGeo = mergeGeometries(parts);
  staticGeo.rotateY(Math.PI);

  const armGeo = mergeGeometries([
    cBox(0.2, 0.2, 0.75, skin, 0, 0, 0),
    cBox(0.16, 0.16, 0.18, darker, 0, 0, -0.43),
  ]);

  typeAssets[type] = { staticGeo, armGeo };
  return typeAssets[type];
}

const legGeo = colorize(new THREE.BoxGeometry(0.28, 0.85, 0.3), CLOTH);
const hitboxMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false });

function makeHpBar() {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 8;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#40ff5a';
  ctx.fillRect(0, 0, 64, 8);
  const tex = new THREE.CanvasTexture(c);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false }));
  sprite.scale.set(1.4, 0.18, 1);
  sprite.visible = false;
  return { sprite, canvas: c, ctx, tex };
}

export class Zombie {
  constructor(type, x, z, scene) {
    this.type = type;
    this.def = ZOMBIES[type];
    this.hp = this.def.hp;
    this.maxHp = this.def.hp;
    this.dead = false;
    this.scene = scene;

    const assets = getTypeAssets(type);
    this.group = new THREE.Group();
    this.group.position.set(x, 0, z);
    this.group.scale.setScalar(this.def.scale);

    const staticMesh = new THREE.Mesh(assets.staticGeo, sharedMat);
    this.group.add(staticMesh);

    const inner = new THREE.Group();
    inner.rotation.y = Math.PI;
    const legL = new THREE.Mesh(legGeo, sharedMat);
    legL.position.set(-0.18, 0.425, 0);
    const legR = new THREE.Mesh(legGeo, sharedMat);
    legR.position.set(0.18, 0.425, 0);
    const armL = new THREE.Mesh(assets.armGeo, sharedMat);
    armL.position.set(-0.46, 1.5, -0.35);
    const armR = new THREE.Mesh(assets.armGeo, sharedMat);
    armR.position.set(0.46, 1.5, -0.35);
    inner.add(legL, legR, armL, armR);
    this.group.add(inner);
    this.limbs = { legL, legR, armL, armR };

    scene.add(this.group);

    const h = 2.3;
    this.hitbox = new THREE.Mesh(new THREE.BoxGeometry(0.9, h, 0.9), hitboxMat);
    this.hitbox.position.y = h / 2;
    this.hitbox.userData.zombie = this;
    this.group.add(this.hitbox);

    const hpBar = makeHpBar();
    this.hpBar = hpBar;
    hpBar.sprite.position.y = 2.6;
    this.group.add(hpBar.sprite);

    this.state = 'wander';
    this.target = null;
    this.wanderTarget = { x, z };
    this.wanderTimer = 0;
    this.loseTimer = 0;
    this.atkCooldown = 0;
    this.walkPhase = rand(0, Math.PI * 2);
    this.perceptionTimer = rand(0, 0.2);

    this.leader = null;
    this.followers = [];
    this.followOffset = { x: rand(-6, 6), z: rand(-6, 6) };
  }

  takeDamage(amount, byPlayer = false) {
    if (this.dead) return;
    this.hp -= amount;
    this.lastHitByPlayer = byPlayer;
    this.hpBar.sprite.visible = true;
    this.updateHpBar();
    if (this.state === 'wander') {
      this.loseTimer = 0;
      this.state = 'chase';
    }
    this.alertPack();
    if (this.hp <= 0) this.die();
  }

  alertPack() {
    const packLeader = this.leader && !this.leader.dead ? this.leader : (this.followers.length ? this : null);
    if (!packLeader) return;
    const pack = [packLeader, ...packLeader.followers];
    for (const p of pack) {
      if (p.dead || p === this) continue;
      if (p.state === 'wander') {
        p.state = 'chase';
        p.loseTimer = 0;
      }
    }
  }

  updateHpBar() {
    const { ctx, tex } = this.hpBar;
    ctx.clearRect(0, 0, 64, 8);
    ctx.fillStyle = 'rgba(20,20,20,0.7)';
    ctx.fillRect(0, 0, 64, 8);
    const w = Math.max(0, this.hp / this.maxHp) * 64;
    ctx.fillStyle = this.hp / this.maxHp > 0.4 ? '#40ff5a' : '#ff5a40';
    ctx.fillRect(0, 0, w, 8);
    tex.needsUpdate = true;
  }

  die() {
    this.dead = true;
    if (this.followers.length) {
      for (const f of this.followers) f.leader = null;
      this.followers = [];
    }
    if (this.leader) {
      const idx = this.leader.followers.indexOf(this);
      if (idx >= 0) this.leader.followers.splice(idx, 1);
      this.leader = null;
    }
  }

  update(dt, candidates, world, nearPlayer) {
    if (this.dead) return;
    this.atkCooldown -= dt;

    this.perceptionTimer -= dt;
    if (this.perceptionTimer <= 0) {
      this.perceptionTimer = 0.2;
      this.perceive(candidates);
    }

    const pos = this.group.position;

    if (this.state === 'chase' && this.target) {
      if (this.target.removed || (this.target.isPlayer && !this.target.ref.alive)) {
        this.target = null;
        this.state = 'wander';
      }
    }

    if (this.state === 'chase' && this.target) {
      const tpos = this.target.pos();
      const d = distXZ(pos, tpos);

      let goal = tpos;
      if (!isInsideSafeZone(pos) && isInsideSafeZone(tpos)) {
        goal = { x: 0, z: GATE_Z + 3 };
        if (Math.abs(pos.x) < GATE_WIDTH / 2 && Math.abs(pos.z - GATE_Z) < 6) {
          goal = { x: 0, z: GATE_Z - 4 };
        }
      }

      if (d < ATTACK_RANGE * this.def.scale) {
        this.faceToward(tpos, dt);
        if (this.atkCooldown <= 0) {
          this.atkCooldown = this.def.atkInterval;
          this.target.damage(this.def.damage);
        }
      } else {
        this.moveToward(goal, this.def.speed, dt, world, nearPlayer);
      }

      if (!inFov(pos, this.yaw(), tpos, 360, this.def.sight * 1.4)) {
        this.loseTimer += dt;
        if (this.loseTimer > LOSE_SIGHT_TIME) {
          this.target = null;
          this.state = 'wander';
          this.loseTimer = 0;
        }
      } else {
        this.loseTimer = 0;
      }
    } else {
      this.wanderTimer -= dt;
      let wt = this.wanderTarget;

      if (this.leader && !this.leader.dead) {
        const lp = this.leader.group.position;
        wt = { x: lp.x + this.followOffset.x, z: lp.z + this.followOffset.z };
      } else if (this.wanderTimer <= 0 || distXZ(pos, wt) < 2) {
        this.wanderTimer = rand(4, 9);
        this.wanderTarget = {
          x: Math.max(-MAP_HALF + 15, Math.min(MAP_HALF - 15, pos.x + rand(-30, 30))),
          z: Math.max(-MAP_HALF + 15, Math.min(MAP_HALF - 15, pos.z + rand(-30, 30))),
        };
        wt = this.wanderTarget;
      }

      if (distXZ(pos, wt) > 1.5) {
        this.moveToward(wt, this.def.speed * 0.45, dt, world, nearPlayer);
      }
    }

    if (nearPlayer) {
      this.walkPhase += dt * this.def.speed * 1.6;
      const swing = Math.sin(this.walkPhase) * 0.5;
      this.limbs.legL.rotation.x = swing;
      this.limbs.legR.rotation.x = -swing;
      this.limbs.armL.rotation.x = swing * 0.15;
      this.limbs.armR.rotation.x = -swing * 0.15;
    }
  }

  perceive(candidates) {
    let best = null, bestD = Infinity;
    for (const c of candidates) {
      const cpos = c.pos();
      const d = distXZ(this.group.position, cpos);
      if (d >= bestD) continue;
      if (this.state === 'chase' || inFov(this.group.position, this.yaw(), cpos, this.def.fov, this.def.sight)) {
        best = c;
        bestD = d;
      }
    }
    if (best) {
      this.target = best;
      if (this.state !== 'chase') {
        this.state = 'chase';
        this.loseTimer = 0;
      }
    }
  }

  yaw() { return this.group.rotation.y; }

  faceToward(tpos, dt) {
    const targetYaw = angleToXZ(this.group.position, tpos);
    let diff = targetYaw - this.group.rotation.y;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    this.group.rotation.y += diff * Math.min(1, dt * 8);
  }

  moveToward(goal, speed, dt, world, nearPlayer) {
    this.faceToward(goal, dt);
    const pos = this.group.position;
    const ang = angleToXZ(pos, goal);
    pos.x += Math.sin(ang) * speed * dt;
    pos.z += Math.cos(ang) * speed * dt;
    if (nearPlayer) {
      world.resolveCollision(pos, 0.5 * this.def.scale);
    } else {
      pos.x = Math.max(-MAP_HALF + 10, Math.min(MAP_HALF - 10, pos.x));
      pos.z = Math.max(-MAP_HALF + 10, Math.min(MAP_HALF - 10, pos.z));
    }
  }

  dispose() {
    this.scene.remove(this.group);
    this.hpBar.tex.dispose();
    this.hpBar.sprite.material.dispose();
  }
}

export class ZombieManager {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.zombies = [];
    this.spawnTimer = 3;
    this.onZombieKilled = null;
  }

  randomSpawnPos(center) {
    let x, z;
    let tries = 0;
    do {
      const ang = rand(0, Math.PI * 2);
      const dist = rand(70, 180);
      x = center.x + Math.sin(ang) * dist;
      z = center.z + Math.cos(ang) * dist;
      x = Math.max(-MAP_HALF + 20, Math.min(MAP_HALF - 20, x));
      z = Math.max(-MAP_HALF + 20, Math.min(MAP_HALF - 20, z));
      tries++;
    } while (Math.abs(x) < SAFE_HALF + 15 && Math.abs(z) < SAFE_HALF + 15 && tries < 30);
    if (Math.abs(x) < SAFE_HALF + 15 && Math.abs(z) < SAFE_HALF + 15) {
      x = SAFE_HALF + 40;
      z = SAFE_HALF + 40;
    }
    return { x, z };
  }

  warmup(center) {
    for (let i = 0; i < INITIAL_SPAWNS; i++) this.spawnGroup(center);
  }

  spawn(type, x, z) {
    const zb = new Zombie(type, x, z, this.scene);
    this.zombies.push(zb);
    return zb;
  }

  spawnGroup(center) {
    const alive = this.zombies.filter(z => !z.dead).length;
    if (alive >= ZOMBIE_CAP) return;
    const room = ZOMBIE_CAP - alive;

    const roll = Math.random();
    const { x, z } = this.randomSpawnPos(center);

    if (roll < 0.12 && room >= 11) {
      const leader = this.spawn('leader', x, z);
      const count = Math.min(randInt(10, 20), room - 1);
      for (let i = 0; i < count; i++) {
        const w = this.spawn('walker', x + rand(-8, 8), z + rand(-8, 8));
        w.leader = leader;
        leader.followers.push(w);
      }
    } else if (roll < 0.22 && room >= 5) {
      const alphaZ = this.spawn('alpha', x, z);
      const count = Math.min(randInt(3, 4), room - 1);
      for (let i = 0; i < count; i++) {
        const r = this.spawn('runner', x + rand(-6, 6), z + rand(-6, 6));
        r.leader = alphaZ;
        alphaZ.followers.push(r);
      }
    } else if (roll < 0.3) {
      this.spawn('bruiser', x, z);
    } else if (roll < 0.35) {
      this.spawn('super', x, z);
    } else if (roll < 0.6) {
      this.spawn('runner', x, z);
    } else {
      this.spawn('walker', x, z);
    }
  }

  update(dt, candidates, playerPos) {
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = SPAWN_INTERVAL;
      for (let i = 0; i < SPAWNS_PER_TICK; i++) this.spawnGroup(playerPos);
    }

    for (let i = this.zombies.length - 1; i >= 0; i--) {
      const z = this.zombies[i];
      if (z.dead) {
        if (this.onZombieKilled) this.onZombieKilled(z);
        z.dispose();
        this.zombies.splice(i, 1);
        continue;
      }
      const d = distXZ(z.group.position, playerPos);
      if (d > ZOMBIE_CULL_DIST && z.state === 'wander') {
        z.die();
        z.dispose();
        this.zombies.splice(i, 1);
        continue;
      }
      z.update(dt, candidates, this.world, d < 130);
    }
  }
}
