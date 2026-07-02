import * as THREE from 'three';
import { WEAPONS } from './config.js';
import { rand } from './utils.js';

const M = {
  metal: new THREE.MeshLambertMaterial({ color: 0x4a4d52 }),
  darkMetal: new THREE.MeshLambertMaterial({ color: 0x2e3034 }),
  wood: new THREE.MeshLambertMaterial({ color: 0x7a5a38 }),
  darkWood: new THREE.MeshLambertMaterial({ color: 0x54402a }),
  blade: new THREE.MeshLambertMaterial({ color: 0xb8bcc2 }),
  grip: new THREE.MeshLambertMaterial({ color: 0x26282c }),
  scope: new THREE.MeshLambertMaterial({ color: 0x1c1e22 }),
  bowWood: new THREE.MeshLambertMaterial({ color: 0x8a6540 }),
};

function buildAxe() {
  const g = new THREE.Group();
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.034, 0.75, 6), M.wood);
  handle.rotation.x = Math.PI / 2;
  handle.position.z = -0.15;
  g.add(handle);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.16, 0.2), M.blade);
  head.position.set(0, 0.02, -0.5);
  g.add(head);
  const edge = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.2, 0.07), M.blade);
  edge.position.set(0, 0.02, -0.62);
  g.add(edge);
  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.1), M.darkMetal);
  neck.position.set(0, 0, -0.48);
  g.add(neck);
  g.scale.setScalar(0.72);
  g.userData.baseZ = 0.35;
  return g;
}

function buildBow() {
  const g = new THREE.Group();
  const arc = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.022, 6, 24, Math.PI * 1.15),
    M.bowWood
  );
  arc.rotation.z = Math.PI / 2 - Math.PI * 1.15 / 2 + Math.PI / 2;
  arc.rotation.y = Math.PI / 2;
  g.add(arc);
  const stringGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0.38, 0.12),
    new THREE.Vector3(0, 0, 0.2),
    new THREE.Vector3(0, -0.38, 0.12),
  ]);
  g.add(new THREE.Line(stringGeo, new THREE.LineBasicMaterial({ color: 0xd8d4c8 })));
  const gripPart = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.16, 0.055), M.darkWood);
  g.add(gripPart);
  const arrow = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.62, 5), M.darkWood);
  arrow.rotation.x = Math.PI / 2;
  arrow.position.set(0, 0.01, -0.14);
  g.add(arrow);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.07, 5), M.blade);
  tip.rotation.x = -Math.PI / 2;
  tip.position.set(0, 0.01, -0.48);
  g.add(tip);
  return g;
}

function buildSword() {
  const g = new THREE.Group();
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.09, 0.95), M.blade);
  blade.position.z = -0.62;
  g.add(blade);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.14, 4), M.blade);
  tip.rotation.x = -Math.PI / 2;
  tip.rotation.y = Math.PI / 4;
  tip.scale.set(0.35, 1, 1);
  tip.position.z = -1.16;
  g.add(tip);
  const guard = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.035, 0.04), M.darkMetal);
  guard.position.z = -0.14;
  g.add(guard);
  const gripPart = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.03, 0.22, 6), M.grip);
  gripPart.rotation.x = Math.PI / 2;
  gripPart.position.z = -0.01;
  g.add(gripPart);
  const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.038, 6, 6), M.darkMetal);
  pommel.position.z = 0.11;
  g.add(pommel);
  return g;
}

function buildPistol() {
  const g = new THREE.Group();
  const slide = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.3), M.darkMetal);
  slide.position.set(0, 0.04, -0.18);
  g.add(slide);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.1, 8), M.metal);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.04, -0.37);
  g.add(barrel);
  const gripPart = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.14, 0.06), M.grip);
  gripPart.position.set(0, -0.05, -0.06);
  gripPart.rotation.x = 0.18;
  g.add(gripPart);
  const trigger = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.05), M.darkMetal);
  trigger.position.set(0, -0.005, -0.14);
  g.add(trigger);
  return g;
}

function buildShotgun() {
  const g = new THREE.Group();
  for (const dx of [-0.024, 0.024]) {
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.72, 8), M.darkMetal);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(dx, 0.03, -0.5);
    g.add(barrel);
  }
  const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.08, 0.22), M.metal);
  receiver.position.set(0, 0.015, -0.1);
  g.add(receiver);
  const stock = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.09, 0.3), M.wood);
  stock.position.set(0, -0.015, 0.16);
  stock.rotation.x = 0.12;
  g.add(stock);
  const foregrip = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 0.24), M.wood);
  foregrip.position.set(0, -0.015, -0.42);
  g.add(foregrip);
  return g;
}

function buildRifle() {
  const g = new THREE.Group();
  const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.42), M.darkMetal);
  receiver.position.set(0, 0.02, -0.2);
  g.add(receiver);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.4, 8), M.metal);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.035, -0.6);
  g.add(barrel);
  const handguard = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.055, 0.26), M.grip);
  handguard.position.set(0, 0.025, -0.5);
  g.add(handguard);
  const mag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.09), M.darkMetal);
  mag.position.set(0, -0.09, -0.16);
  mag.rotation.x = 0.25;
  g.add(mag);
  const stock = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.07, 0.26), M.grip);
  stock.position.set(0, 0.005, 0.13);
  g.add(stock);
  const gripPart = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.1, 0.05), M.grip);
  gripPart.position.set(0, -0.05, 0.0);
  gripPart.rotation.x = 0.3;
  g.add(gripPart);
  const sight = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.04, 0.1), M.darkMetal);
  sight.position.set(0, 0.08, -0.22);
  g.add(sight);
  return g;
}

function buildSniper() {
  const g = new THREE.Group();
  const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.09, 0.5), M.darkMetal);
  receiver.position.set(0, 0.02, -0.16);
  g.add(receiver);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.85, 8), M.metal);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.04, -0.82);
  g.add(barrel);
  const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.14), M.darkMetal);
  muzzle.position.set(0, 0.04, -1.26);
  g.add(muzzle);
  const scopeBody = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.24, 8), M.scope);
  scopeBody.rotation.x = Math.PI / 2;
  scopeBody.position.set(0, 0.11, -0.2);
  g.add(scopeBody);
  for (const dz of [-0.3, -0.1]) {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.02, 8), M.darkMetal);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 0.11, dz);
    g.add(ring);
  }
  const mag = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.13, 0.12), M.darkMetal);
  mag.position.set(0, -0.07, -0.1);
  g.add(mag);
  const stock = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.3), M.grip);
  stock.position.set(0, -0.005, 0.18);
  g.add(stock);
  for (const dx of [-0.05, 0.05]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.16, 5), M.metal);
    leg.position.set(dx, -0.06, -1.0);
    leg.rotation.z = dx > 0 ? -0.3 : 0.3;
    g.add(leg);
  }
  return g;
}

const BUILDERS = {
  axe: buildAxe, bow: buildBow, sword: buildSword,
  pistol: buildPistol, shotgun: buildShotgun, rifle: buildRifle, sniper: buildSniper,
};

export class WeaponSystem {
  constructor(camera, scene, effects) {
    this.camera = camera;
    this.scene = scene;
    this.effects = effects;
    this.raycaster = new THREE.Raycaster();

    this.viewModels = {};
    this.viewRoot = new THREE.Group();
    camera.add(this.viewRoot);
    for (const key of Object.keys(BUILDERS)) {
      const model = BUILDERS[key]();
      model.visible = false;
      this.viewRoot.add(model);
      this.viewModels[key] = model;
    }
    this.basePos = new THREE.Vector3(0.32, -0.28, -0.55);
    this.viewRoot.position.copy(this.basePos);

    this.current = 'axe';
    this.cooldown = 0;
    this.mag = 0;
    this.reloading = false;
    this.reloadTimer = 0;
    this.swingAnim = 0;
    this.recoilAnim = 0;
    this.mouseDown = false;
    this.bobTime = 0;

    document.addEventListener('mousedown', e => { if (e.button === 0) this.mouseDown = true; });
    document.addEventListener('mouseup', e => { if (e.button === 0) { this.mouseDown = false; this._firedThisPress = false; } });

    this.equip('axe');
  }

  equip(key) {
    for (const k of Object.keys(this.viewModels)) this.viewModels[k].visible = false;
    this.current = key;
    this.viewModels[key].visible = true;
    const def = WEAPONS[key];
    this.mag = def.mag || 0;
    this.reloading = false;
    this.reloadTimer = 0;
    this.cooldown = 0.15;
  }

  get def() { return WEAPONS[this.current]; }

  startReload() {
    if (this.reloading) return;
    this.reloading = true;
    this.reloadTimer = 0;
  }

  update(dt, zombieManager, uiOpen, playerAlive, moving) {
    const def = this.def;
    this.cooldown -= dt;
    this.bobTime += dt * (moving ? 9 : 2);

    if (this.reloading) {
      this.reloadTimer += dt;
      if (this.reloadTimer >= def.reload) {
        this.reloading = false;
        this.mag = def.mag;
      }
    }

    this.swingAnim = Math.max(0, this.swingAnim - dt * 4);
    this.recoilAnim = Math.max(0, this.recoilAnim - dt * 8);

    const model = this.viewModels[this.current];
    const bobY = Math.sin(this.bobTime * 2) * (moving ? 0.012 : 0.004);
    const bobX = Math.cos(this.bobTime) * (moving ? 0.008 : 0.002);
    this.viewRoot.position.set(
      this.basePos.x + bobX,
      this.basePos.y + bobY,
      this.basePos.z + this.recoilAnim * 0.08
    );
    if (def.type === 'melee') {
      model.rotation.x = -this.swingAnim * 1.6;
      model.rotation.z = (model.userData.baseZ || 0) + this.swingAnim * 0.4;
    } else {
      model.rotation.x = this.recoilAnim * 0.25;
      model.rotation.z = 0;
    }

    if (uiOpen || !playerAlive) return;
    if (!this.mouseDown) return;
    if (this.cooldown > 0) return;
    if (def.type === 'ranged') {
      if (this.reloading) return;
      if (this.mag <= 0) { this.startReload(); return; }
    }
    if (!def.auto && this._firedThisPress) return;

    this.fire(zombieManager);
    this._firedThisPress = true;
    this.cooldown = def.interval;
  }

  notifyMouseUp() { this._firedThisPress = false; }

  muzzleWorldPos() {
    const v = new THREE.Vector3(0.32, -0.2, -1.2);
    return this.camera.localToWorld(v);
  }

  fire(zm) {
    const def = this.def;

    if (def.type === 'melee') {
      this.swingAnim = 1;
      const origin = this.camera.position;
      const dir = new THREE.Vector3();
      this.camera.getWorldDirection(dir);
      let best = null, bestD = Infinity;
      for (const z of zm.zombies) {
        if (z.dead) continue;
        const center = z.group.position.clone();
        center.y = 1.2 * z.def.scale;
        const to = center.sub(origin);
        const d = to.length();
        if (d > def.range + z.def.scale) continue;
        to.normalize();
        if (to.dot(dir) < 0.5) continue;
        if (d < bestD) { bestD = d; best = z; }
      }
      if (best) {
        best.takeDamage(def.damage, true);
        this.effects.blood(best.group.position.clone().setY(1.3), 5);
      }
      return;
    }

    this.mag--;
    this.recoilAnim = 1;
    const muzzle = this.muzzleWorldPos();
    this.effects.muzzleFlash(muzzle);

    const origin = this.camera.position.clone();
    const baseDir = new THREE.Vector3();
    this.camera.getWorldDirection(baseDir);

    if (def.pellets) {
      for (let i = 0; i < def.pellets; i++) {
        const dir = baseDir.clone();
        dir.x += (Math.random() - 0.5) * 0.09;
        dir.y += (Math.random() - 0.5) * 0.09;
        dir.z += (Math.random() - 0.5) * 0.09;
        dir.normalize();
        this.hitscan(origin, dir, muzzle, zm, def.damage / def.pellets, false, true);
      }
    } else {
      this.hitscan(origin, baseDir, muzzle, zm, def.damage, def.pierce, false);
    }

    if (this.mag <= 0) this.startReload();
  }

  hitscan(origin, dir, muzzle, zm, damage, pierce, falloff) {
    this.raycaster.set(origin, dir);
    this.raycaster.far = 200;

    const targets = [];
    for (const z of zm.zombies) {
      if (z.dead) continue;
      z.hitbox.updateWorldMatrix(true, false);
      targets.push(z.hitbox);
    }
    const hits = this.raycaster.intersectObjects(targets, false);

    let endPoint = origin.clone().addScaledVector(dir, 120);

    if (hits.length > 0) {
      if (pierce) {
        const hitZombies = new Set();
        for (const h of hits) {
          const z = h.object.userData.zombie;
          if (hitZombies.has(z)) continue;
          hitZombies.add(z);
          z.takeDamage(damage, true);
          this.effects.blood(h.point, 7);
        }
        endPoint = hits[hits.length - 1].point.clone().addScaledVector(dir, 10);
      } else {
        const h = hits[0];
        const z = h.object.userData.zombie;
        let dmg = damage;
        if (falloff) {
          const d = h.distance;
          let mult;
          if (d <= 10) mult = 1;
          else if (d <= 30) mult = 1 - (d - 10) / 20 * 0.5;
          else if (d <= 50) mult = 0.5 - (d - 30) / 20 * 0.3;
          else mult = 0.2;
          dmg = damage * mult;
        }
        z.takeDamage(dmg, true);
        this.effects.blood(h.point, 4);
        endPoint = h.point;
      }
    }

    this.effects.tracer(muzzle, endPoint, this.current === 'sniper');
  }
}
