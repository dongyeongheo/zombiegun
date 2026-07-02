import * as THREE from 'three';
import { SOLDIER, SAFE_HALF, GATE_WIDTH, GATE_Z } from './config.js';
import { rand, distXZ, angleToXZ } from './utils.js';
import { distToSafeZone, isInsideSafeZone } from './world.js';

const uniformMat = new THREE.MeshLambertMaterial({ color: 0x4a5c38 });
const uniformDarkMat = new THREE.MeshLambertMaterial({ color: 0x38452c });
const sniperUniformMat = new THREE.MeshLambertMaterial({ color: 0x2e3a28 });
const skinMat = new THREE.MeshLambertMaterial({ color: 0xd8ab84 });
const helmetMat = new THREE.MeshLambertMaterial({ color: 0x3d4a32 });
const bootMat = new THREE.MeshLambertMaterial({ color: 0x2a251e });
const gunMat = new THREE.MeshLambertMaterial({ color: 0x2e3034 });
const vestMat = new THREE.MeshLambertMaterial({ color: 0x33402a });

function buildSoldierModel(isSniper) {
  const g = new THREE.Group();
  const uni = isSniper ? sniperUniformMat : uniformMat;

  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.8, 0.28), uniformDarkMat);
  legL.position.set(-0.16, 0.46, 0);
  const legR = legL.clone();
  legR.position.x = 0.16;
  g.add(legL, legR);

  for (const sx of [-0.16, 0.16]) {
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.14, 0.36), bootMat);
    boot.position.set(sx, 0.07, -0.03);
    g.add(boot);
  }

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.85, 0.38), uni);
  torso.position.y = 1.3;
  g.add(torso);

  const vest = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 0.44), vestMat);
  vest.position.y = 1.42;
  g.add(vest);

  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 0.2), uni);
  armL.position.set(-0.42, 1.35, 0);
  g.add(armL);

  const armR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.24, 0.5), uni);
  armR.position.set(0.38, 1.45, -0.3);
  g.add(armR);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), skinMat);
  head.position.y = 1.98;
  g.add(head);

  const helmet = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.24, 0.48), helmetMat);
  helmet.position.y = 2.18;
  g.add(helmet);
  const brim = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.06, 0.14), helmetMat);
  brim.position.set(0, 2.08, -0.26);
  g.add(brim);

  const gun = new THREE.Group();
  const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.12, isSniper ? 0.7 : 0.5), gunMat);
  gun.add(receiver);
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(isSniper ? 0.035 : 0.022, isSniper ? 0.035 : 0.022, isSniper ? 0.7 : 0.4, 6),
    gunMat
  );
  barrel.rotation.x = Math.PI / 2;
  barrel.position.z = isSniper ? -0.65 : -0.42;
  gun.add(barrel);
  const mag = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.1), gunMat);
  mag.position.y = -0.13;
  gun.add(mag);
  if (isSniper) {
    const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.22, 6), gunMat);
    scope.rotation.x = Math.PI / 2;
    scope.position.y = 0.1;
    gun.add(scope);
  }
  gun.position.set(0.2, 1.45, -0.45);
  g.add(gun);

  g.rotation.y = Math.PI;
  const outer = new THREE.Group();
  outer.add(g);
  outer.userData.gun = gun;
  outer.userData.limbs = { legL, legR };
  return outer;
}

class Soldier {
  constructor(scene, effects, role, isSniper = false) {
    this.scene = scene;
    this.effects = effects;
    this.role = role;
    this.isSniper = isSniper;
    this.group = buildSoldierModel(isSniper);
    this.group.traverse(o => { if (o.isMesh) o.castShadow = true; });
    scene.add(this.group);

    this.fireCooldown = rand(0, 0.3);
    this.walkPhase = rand(0, Math.PI * 2);
    this.target = null;
    this.retargetTimer = rand(0, 0.25);

    this.patrolPoints = [];
    this.patrolIndex = 0;
    this.homePos = new THREE.Vector3();
    this.deployed = role !== 'emergency';
    this.returning = false;
    this.group.visible = this.deployed;

    this.removed = false;
  }

  pos() { return this.group.position; }
  damage() {}

  get range() { return this.isSniper ? SOLDIER.sniperRange : SOLDIER.arRange; }
  get fireInterval() { return this.isSniper ? SOLDIER.sniperInterval : SOLDIER.arInterval; }
  get dmg() { return this.isSniper ? SOLDIER.sniperDamage : SOLDIER.arDamage; }

  findTarget(zombies) {
    let best = null, bestD = this.range;
    for (const z of zombies) {
      if (z.dead) continue;
      const d = distXZ(this.group.position, z.group.position);
      if (d < bestD) { best = z; bestD = d; }
    }
    this.target = best;
  }

  faceToward(tpos, dt, snap = false) {
    const targetYaw = angleToXZ(this.group.position, tpos);
    let diff = targetYaw - this.group.rotation.y;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    this.group.rotation.y += diff * (snap ? 1 : Math.min(1, dt * 10));
  }

  shoot(zombies) {
    if (!this.target || this.target.dead) return;
    const from = this.group.position.clone();
    from.y = 1.5;
    const to = this.target.group.position.clone();
    to.y = 1.2 * this.target.def.scale;

    this.effects.muzzleFlash(from.clone().add(new THREE.Vector3(0, 0.1, 0)));
    this.effects.tracer(from, to, this.isSniper);
    this.effects.blood(to, this.isSniper ? 6 : 3);

    if (this.isSniper) {
      const dir = to.clone().sub(from).normalize();
      for (const z of zombies) {
        if (z.dead || z === this.target) continue;
        const zp = z.group.position.clone();
        zp.y = 1.2;
        const toZ = zp.clone().sub(from);
        const proj = toZ.dot(dir);
        if (proj < 0 || proj > this.range) continue;
        const perp = toZ.clone().addScaledVector(dir, -proj).length();
        if (perp < 0.9 * z.def.scale) z.takeDamage(this.dmg);
      }
    }
    this.target.takeDamage(this.dmg);
  }

  walkAnim(dt, moving) {
    const limbs = this.group.userData.limbs;
    if (moving) {
      this.walkPhase += dt * 8;
      const swing = Math.sin(this.walkPhase) * 0.5;
      limbs.legL.rotation.x = swing;
      limbs.legR.rotation.x = -swing;
    } else {
      limbs.legL.rotation.x *= 0.85;
      limbs.legR.rotation.x *= 0.85;
    }
  }

  moveToward(goal, speed, dt) {
    this.faceToward(goal, dt);
    const pos = this.group.position;
    const ang = angleToXZ(pos, goal);
    pos.x += Math.sin(ang) * speed * dt;
    pos.z += Math.cos(ang) * speed * dt;
  }

  update(dt, zombies) {
    this.fireCooldown -= dt;
    this.retargetTimer -= dt;
    if (this.retargetTimer <= 0) {
      this.retargetTimer = 0.25;
      if (this.group.visible) this.findTarget(zombies);
    }

    const engaging = this.target && !this.target.dead;

    if (this.role === 'guard') {
      if (engaging) {
        this.faceToward(this.target.group.position, dt);
        if (this.fireCooldown <= 0) {
          this.fireCooldown = this.fireInterval;
          this.shoot(zombies);
        }
      } else {
        this.faceToward({ x: this.group.position.x, z: this.group.position.z + 10 }, dt);
      }
      this.walkAnim(dt, false);
    } else if (this.role === 'patrol') {
      if (engaging) {
        this.faceToward(this.target.group.position, dt);
        if (this.fireCooldown <= 0) {
          this.fireCooldown = this.fireInterval;
          this.shoot(zombies);
        }
        this.walkAnim(dt, false);
      } else {
        const wp = this.patrolPoints[this.patrolIndex];
        if (distXZ(this.group.position, wp) < 1.5) {
          this.patrolIndex = (this.patrolIndex + 1) % this.patrolPoints.length;
        } else {
          this.moveToward(wp, SOLDIER.patrolSpeed, dt);
        }
        this.walkAnim(dt, true);
      }
    } else if (this.role === 'emergency') {
      if (!this.deployed) return;

      if (this.returning) {
        if (distXZ(this.group.position, this.homePos) < 1.2) {
          this.deployed = false;
          this.returning = false;
          this.group.visible = false;
        } else {
          this.moveToward(this.homePos, SOLDIER.patrolSpeed * 1.5, dt);
          this.walkAnim(dt, true);
        }
        return;
      }

      if (engaging) {
        const d = distXZ(this.group.position, this.target.group.position);
        const standoff = this.isSniper ? 35 : 18;
        if (d > standoff) {
          this.moveToward(this.target.group.position, SOLDIER.deploySpeed, dt);
          this.walkAnim(dt, true);
        } else {
          this.walkAnim(dt, false);
        }
        this.faceToward(this.target.group.position, dt);
        if (this.fireCooldown <= 0 && d < this.range) {
          this.fireCooldown = this.fireInterval;
          this.shoot(zombies);
        }
      } else {
        this.walkAnim(dt, false);
      }
    }
  }
}

export class SoldierManager {
  constructor(scene, effects, world) {
    this.scene = scene;
    this.effects = effects;
    this.world = world;
    this.soldiers = [];
    this.alertActive = false;
    this.alertCheckTimer = 0;

    this.setupGuards();
    this.setupPatrols();
    this.setupEmergency();
  }

  setupGuards() {
    const positions = [
      [-GATE_WIDTH / 2 - 2, GATE_Z - 3],
      [-GATE_WIDTH / 2 + 1.5, GATE_Z - 3],
      [GATE_WIDTH / 2 - 1.5, GATE_Z - 3],
      [GATE_WIDTH / 2 + 2, GATE_Z - 3],
    ];
    for (const [x, z] of positions) {
      const s = new Soldier(this.scene, this.effects, 'guard');
      s.group.position.set(x, 0, z);
      s.group.rotation.y = 0;
      this.soldiers.push(s);
    }
  }

  setupPatrols() {
    const inset = 10;
    const h = SAFE_HALF - inset;
    const baseRoute = [
      [-h, -h], [h, -h], [h, h], [-h, h],
    ];
    for (let pair = 0; pair < 4; pair++) {
      for (let member = 0; member < 2; member++) {
        const s = new Soldier(this.scene, this.effects, 'patrol');
        const route = baseRoute.map(([x, z]) => ({ x: x + (member === 1 ? 1.5 : 0), z: z + (member === 1 ? 1.5 : 0) }));
        s.patrolPoints = route;
        s.patrolIndex = pair % route.length;
        const start = route[s.patrolIndex];
        s.group.position.set(start.x + member * 1.5, 0, start.z + rand(-2, 2));
        this.soldiers.push(s);
      }
    }
  }

  setupEmergency() {
    const doors = this.world.tentDoors;
    for (let i = 0; i < 10; i++) {
      const isSniper = i < 2;
      const s = new Soldier(this.scene, this.effects, 'emergency', isSniper);
      const door = doors[i % doors.length];
      s.homePos.copy(door);
      s.group.position.copy(door);
      this.soldiers.push(s);
    }
  }

  update(dt, zombies) {
    this.alertCheckTimer -= dt;
    if (this.alertCheckTimer <= 0) {
      this.alertCheckTimer = 0.5;
      this.checkAlert(zombies);
    }

    for (const s of this.soldiers) s.update(dt, zombies);
  }

  checkAlert(zombies) {
    let threat = false;
    for (const z of zombies) {
      if (z.dead) continue;
      const d = distToSafeZone(z.group.position);
      if (d < SOLDIER.alertDist || isInsideSafeZone(z.group.position)) {
        threat = true;
        break;
      }
    }

    if (threat && !this.alertActive) {
      this.alertActive = true;
      this.deployEmergency();
      const banner = document.getElementById('alert-banner');
      banner.style.display = 'block';
      setTimeout(() => { banner.style.display = 'none'; }, 3500);
    } else if (!threat && this.alertActive) {
      let stillClose = false;
      for (const z of zombies) {
        if (z.dead) continue;
        if (distToSafeZone(z.group.position) < SOLDIER.clearDist) { stillClose = true; break; }
      }
      if (!stillClose) {
        this.alertActive = false;
        this.recallEmergency();
      }
    }
  }

  deployEmergency() {
    for (const s of this.soldiers) {
      if (s.role !== 'emergency') continue;
      s.deployed = true;
      s.returning = false;
      s.group.visible = true;
      s.group.position.copy(s.homePos);
    }
  }

  recallEmergency() {
    for (const s of this.soldiers) {
      if (s.role !== 'emergency' || !s.deployed) continue;
      s.returning = true;
      s.target = null;
    }
  }

  getVisibleSoldiers() {
    return this.soldiers.filter(s => s.group.visible);
  }
}
