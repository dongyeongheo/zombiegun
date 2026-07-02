import * as THREE from 'three';
import { WEAPONS } from './config.js';

const M = {
  steel: new THREE.MeshLambertMaterial({ color: 0x9aa0a8 }),
  brightSteel: new THREE.MeshLambertMaterial({ color: 0xc8ccd2 }),
  gunmetal: new THREE.MeshLambertMaterial({ color: 0x3a3e45 }),
  darkSteel: new THREE.MeshLambertMaterial({ color: 0x26292e }),
  black: new THREE.MeshLambertMaterial({ color: 0x1a1c20 }),
  wood: new THREE.MeshLambertMaterial({ color: 0x7a5230 }),
  darkWood: new THREE.MeshLambertMaterial({ color: 0x4e3620 }),
  brass: new THREE.MeshLambertMaterial({ color: 0xc9a227, emissive: 0x2a1f05 }),
  leather: new THREE.MeshLambertMaterial({ color: 0x5a4028 }),
  scopeGlass: new THREE.MeshBasicMaterial({ color: 0x66aaff }),
  edge: new THREE.MeshLambertMaterial({ color: 0xe8ecf2, emissive: 0x222428 }),
};

function box(w, h, d, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  return m;
}
function cyl(rTop, rBot, h, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, seg = 8) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, seg), mat);
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  return m;
}

function buildAxe() {
  const g = new THREE.Group();
  g.add(cyl(0.026, 0.034, 0.72, M.darkWood, 0, 0.05, 0));
  g.add(cyl(0.036, 0.036, 0.06, M.leather, 0, -0.2, 0));
  g.add(cyl(0.036, 0.036, 0.06, M.leather, 0, -0.28, 0));
  g.add(cyl(0.04, 0.04, 0.03, M.darkSteel, 0, -0.33, 0));

  g.add(box(0.05, 0.15, 0.1, M.gunmetal, 0, 0.38, 0));
  g.add(box(0.026, 0.1, 0.24, M.steel, 0, 0.38, -0.1));
  g.add(box(0.01, 0.035, 0.3, M.edge, 0, 0.38, -0.155));
  const spike = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.12, 4), M.gunmetal);
  spike.rotation.x = Math.PI / 2;
  spike.rotation.z = Math.PI / 4;
  spike.position.set(0, 0.38, 0.1);
  g.add(spike);
  g.add(cyl(0.03, 0.03, 0.05, M.darkSteel, 0, 0.47, 0));

  g.scale.setScalar(0.78);
  g.userData.baseZ = 0;
  return g;
}

function buildBow() {
  const g = new THREE.Group();

  const limbMat = M.darkWood;
  for (const s of [1, -1]) {
    const limb1 = cyl(0.02, 0.026, 0.34, limbMat, 0, s * 0.19, -0.02, 0, 0, s * 0.28);
    g.add(limb1);
    const limb2 = cyl(0.014, 0.02, 0.24, limbMat, 0, s * 0.42, -0.09, 0, 0, s * 0.75);
    g.add(limb2);
    const tip = cyl(0.02, 0.02, 0.05, M.brass, 0, s * 0.5, -0.16, 0, 0, s * 0.75);
    g.add(tip);
  }

  g.add(box(0.05, 0.18, 0.06, M.wood, 0, 0, 0.01));
  g.add(cyl(0.032, 0.032, 0.1, M.leather, 0, 0, 0.01));
  g.add(box(0.07, 0.02, 0.05, M.wood, -0.02, 0.1, 0));

  const stringGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0.49, -0.14),
    new THREE.Vector3(0, 0, 0.16),
    new THREE.Vector3(0, -0.49, -0.14),
  ]);
  g.add(new THREE.Line(stringGeo, new THREE.LineBasicMaterial({ color: 0xe8e4d8 })));

  const arrow = new THREE.Group();
  arrow.add(cyl(0.007, 0.007, 0.62, M.wood, 0, 0, -0.08, Math.PI / 2));
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.09, 4), M.brightSteel);
  tip.rotation.x = -Math.PI / 2;
  tip.position.z = -0.43;
  arrow.add(tip);
  const fletchMat = new THREE.MeshLambertMaterial({ color: 0xe8e4d8, side: THREE.DoubleSide });
  for (let i = 0; i < 3; i++) {
    const ang = (i / 3) * Math.PI * 2;
    const f = box(0.001, 0.02, 0.04, fletchMat, Math.sin(ang) * 0.012, Math.cos(ang) * 0.012, 0.2);
    f.rotation.z = ang;
    arrow.add(f);
  }
  arrow.position.set(0, 0.02, -0.1);
  g.add(arrow);

  g.scale.setScalar(0.85);
  return g;
}

function buildSword() {
  const g = new THREE.Group();

  g.add(box(0.02, 0.1, 1.0, M.steel, 0, 0, -0.64));
  g.add(box(0.024, 0.032, 0.86, M.gunmetal, 0, 0, -0.57));
  g.add(box(0.008, 0.11, 0.98, M.edge, 0, 0, -0.64));
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.16, 4), M.steel);
  tip.rotation.x = -Math.PI / 2;
  tip.rotation.y = Math.PI / 4;
  tip.scale.set(0.32, 1, 0.9);
  tip.position.z = -1.2;
  g.add(tip);

  g.add(box(0.26, 0.04, 0.05, M.brass, 0, 0, -0.13));
  for (const s of [-1, 1]) {
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), M.brass);
    ball.position.set(s * 0.14, 0, -0.13);
    g.add(ball);
  }

  for (let i = 0; i < 4; i++) {
    g.add(cyl(0.027, 0.027, 0.038, i % 2 ? M.leather : M.darkWood, 0, 0, -0.05 + i * 0.045, Math.PI / 2));
  }
  const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 8), M.brass);
  pommel.position.z = 0.15;
  g.add(pommel);

  g.userData.baseZ = 0.12;
  return g;
}

function buildPistol() {
  const g = new THREE.Group();

  g.add(box(0.052, 0.055, 0.32, M.gunmetal, 0, 0.045, -0.18));
  for (let i = 0; i < 4; i++) {
    g.add(box(0.056, 0.04, 0.008, M.darkSteel, 0, 0.05, -0.05 - i * 0.018));
  }
  g.add(box(0.03, 0.03, 0.06, M.brightSteel, 0, 0.045, -0.3));
  g.add(cyl(0.013, 0.013, 0.06, M.steel, 0, 0.045, -0.37, Math.PI / 2));
  g.add(box(0.008, 0.018, 0.015, M.darkSteel, 0, 0.082, -0.33));
  g.add(box(0.03, 0.014, 0.02, M.darkSteel, 0, 0.08, -0.04));

  g.add(box(0.048, 0.09, 0.14, M.darkSteel, 0, -0.01, -0.14));
  const guard = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.007, 6, 10, Math.PI), M.darkSteel);
  guard.rotation.y = Math.PI / 2;
  guard.rotation.z = Math.PI;
  guard.position.set(0, -0.035, -0.15);
  g.add(guard);
  g.add(box(0.01, 0.03, 0.008, M.steel, 0, -0.03, -0.14, 0.3));

  const grip = box(0.046, 0.15, 0.065, M.black, 0, -0.085, -0.045, 0.22);
  g.add(grip);
  for (const s of [-1, 1]) {
    g.add(box(0.006, 0.11, 0.05, M.wood, s * 0.026, -0.085, -0.045, 0.22));
  }
  g.add(box(0.02, 0.04, 0.02, M.darkSteel, 0, 0.06, 0.0, -0.5));

  return g;
}

function buildShotgun() {
  const g = new THREE.Group();

  for (const dx of [-0.025, 0.025]) {
    g.add(cyl(0.021, 0.021, 0.74, M.darkSteel, dx, 0.035, -0.48, Math.PI / 2));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.021, 0.005, 6, 10), M.steel);
    ring.position.set(dx, 0.035, -0.845);
    g.add(ring);
  }
  g.add(box(0.02, 0.012, 0.7, M.gunmetal, 0, 0.055, -0.48));
  const bead = new THREE.Mesh(new THREE.SphereGeometry(0.007, 6, 6), M.brass);
  bead.position.set(0, 0.065, -0.83);
  g.add(bead);
  g.add(cyl(0.055, 0.055, 0.045, M.darkSteel, 0, 0.035, -0.16, Math.PI / 2, 0, 0, 12));

  g.add(box(0.085, 0.085, 0.2, M.gunmetal, 0, 0.02, -0.05));
  for (const s of [-1, 1]) {
    g.add(box(0.004, 0.06, 0.14, M.brass, s * 0.045, 0.02, -0.05));
  }
  for (const dx of [-0.02, 0.02]) {
    g.add(box(0.014, 0.035, 0.02, M.steel, dx, 0.075, 0.03, -0.5));
  }

  const guard = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.008, 6, 10, Math.PI), M.darkSteel);
  guard.rotation.y = Math.PI / 2;
  guard.rotation.z = Math.PI;
  guard.position.set(0, -0.045, -0.02);
  g.add(guard);

  const stock = box(0.06, 0.095, 0.34, M.wood, 0, -0.025, 0.2, 0.14);
  g.add(stock);
  g.add(box(0.065, 0.1, 0.03, M.black, 0, -0.05, 0.37, 0.14));
  const gripSwell = box(0.062, 0.07, 0.1, M.darkWood, 0, -0.02, 0.06, 0.3);
  g.add(gripSwell);

  const fore = box(0.075, 0.055, 0.3, M.wood, 0, -0.005, -0.42);
  g.add(fore);
  for (let i = 0; i < 3; i++) {
    g.add(box(0.077, 0.008, 0.02, M.darkWood, 0, -0.02, -0.34 - i * 0.07));
  }

  return g;
}

function buildRifle() {
  const g = new THREE.Group();

  g.add(box(0.055, 0.07, 0.3, M.gunmetal, 0, 0.03, -0.18));
  g.add(box(0.05, 0.06, 0.24, M.darkSteel, 0, -0.015, -0.1));
  g.add(box(0.05, 0.014, 0.36, M.black, 0, 0.075, -0.2));
  for (let i = 0; i < 6; i++) {
    g.add(box(0.054, 0.008, 0.018, M.gunmetal, 0, 0.085, -0.06 - i * 0.055));
  }

  g.add(cyl(0.015, 0.015, 0.34, M.darkSteel, 0, 0.035, -0.56, Math.PI / 2));
  g.add(cyl(0.02, 0.02, 0.09, M.black, 0, 0.035, -0.75, Math.PI / 2));
  g.add(box(0.006, 0.05, 0.01, M.darkSteel, 0, 0.09, -0.66));
  g.add(box(0.03, 0.012, 0.03, M.darkSteel, 0, 0.11, -0.66));

  const handguard = box(0.06, 0.06, 0.3, M.black, 0, 0.03, -0.42);
  g.add(handguard);
  for (const s of [-1, 1]) {
    g.add(box(0.005, 0.04, 0.26, M.gunmetal, s * 0.033, 0.03, -0.42));
  }
  g.add(box(0.03, 0.09, 0.045, M.black, 0, -0.04, -0.46, -0.15));

  const mag1 = box(0.042, 0.11, 0.09, M.gunmetal, 0, -0.1, -0.13, 0.18);
  const mag2 = box(0.042, 0.1, 0.09, M.gunmetal, 0, -0.19, -0.1, 0.42);
  g.add(mag1, mag2);
  g.add(box(0.046, 0.02, 0.094, M.brass, 0, -0.24, -0.08, 0.42));

  g.add(cyl(0.022, 0.022, 0.2, M.black, 0, 0.025, 0.08, Math.PI / 2));
  g.add(box(0.045, 0.11, 0.06, M.black, 0, -0.01, 0.2));
  g.add(box(0.045, 0.03, 0.14, M.black, 0, 0.045, 0.15));

  g.add(box(0.04, 0.1, 0.05, M.black, 0, -0.08, 0.02, 0.35));
  g.add(box(0.02, 0.035, 0.03, M.gunmetal, 0, 0.065, 0.02));

  return g;
}

function buildSniper() {
  const g = new THREE.Group();

  g.add(box(0.08, 0.1, 0.55, M.gunmetal, 0, 0.02, -0.12));
  g.add(box(0.06, 0.016, 0.5, M.black, 0, 0.085, -0.15));
  for (let i = 0; i < 7; i++) {
    g.add(box(0.064, 0.01, 0.02, M.gunmetal, 0, 0.095, 0.02 - i * 0.06));
  }

  g.add(cyl(0.03, 0.03, 0.55, M.darkSteel, 0, 0.035, -0.65, Math.PI / 2));
  g.add(cyl(0.045, 0.045, 0.3, M.gunmetal, 0, 0.035, -0.5, Math.PI / 2, 0, 0, 10));

  const brake = new THREE.Group();
  brake.add(box(0.1, 0.08, 0.16, M.black));
  for (const s of [-1, 1]) {
    brake.add(box(0.03, 0.06, 0.12, M.darkSteel, s * 0.06, 0));
  }
  for (let i = 0; i < 3; i++) {
    brake.add(box(0.104, 0.05, 0.014, M.gunmetal, 0, 0, -0.05 + i * 0.045));
  }
  brake.position.set(0, 0.035, -1.0);
  g.add(brake);

  const scope = new THREE.Group();
  scope.add(cyl(0.036, 0.036, 0.3, M.black, 0, 0, 0, Math.PI / 2));
  scope.add(cyl(0.052, 0.045, 0.1, M.black, 0, 0, -0.19, Math.PI / 2));
  scope.add(cyl(0.04, 0.04, 0.06, M.black, 0, 0, 0.17, Math.PI / 2));
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.048, 12), M.scopeGlass);
  lens.position.z = -0.241;
  scope.add(lens);
  scope.add(cyl(0.018, 0.018, 0.03, M.gunmetal, 0, 0.045, 0));
  scope.add(cyl(0.018, 0.018, 0.03, M.gunmetal, 0.045, 0, 0, 0, 0, Math.PI / 2));
  for (const dz of [-0.08, 0.1]) {
    scope.add(box(0.02, 0.05, 0.03, M.gunmetal, 0, -0.05, dz));
  }
  scope.position.set(0, 0.16, -0.14);
  g.add(scope);

  g.add(box(0.055, 0.16, 0.14, M.gunmetal, 0, -0.11, -0.06, 0.1));
  g.add(box(0.06, 0.02, 0.15, M.brass, 0, -0.19, -0.05, 0.1));

  g.add(box(0.05, 0.05, 0.32, M.gunmetal, 0, 0.02, 0.3));
  g.add(box(0.05, 0.14, 0.07, M.black, 0, -0.03, 0.44));
  g.add(box(0.05, 0.04, 0.2, M.black, 0, 0.075, 0.38));
  g.add(box(0.04, 0.1, 0.05, M.black, 0, -0.08, 0.1, 0.35));
  g.add(cyl(0.012, 0.012, 0.1, M.darkSteel, 0, -0.13, 0.44));

  for (const s of [-1, 1]) {
    const leg = cyl(0.009, 0.009, 0.22, M.darkSteel, s * 0.06, -0.09, -0.75, 0, 0, s * 0.35);
    g.add(leg);
    g.add(box(0.02, 0.02, 0.03, M.black, s * 0.135, -0.19, -0.75));
  }

  return g;
}

function buildRPG() {
  const g = new THREE.Group();

  g.add(cyl(0.05, 0.05, 0.85, M.gunmetal, 0, 0.03, -0.15, Math.PI / 2, 0, 0, 10));
  g.add(cyl(0.065, 0.05, 0.16, M.darkSteel, 0, 0.03, 0.33, Math.PI / 2, 0, 0, 10));
  g.add(cyl(0.055, 0.055, 0.05, M.black, 0, 0.03, -0.6, Math.PI / 2, 0, 0, 10));

  const warhead = new THREE.Group();
  warhead.add(cyl(0.075, 0.05, 0.18, M.black, 0, 0, 0, Math.PI / 2, 0, 0, 10));
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.22, 10), M.darkSteel);
  nose.rotation.x = -Math.PI / 2;
  nose.position.z = -0.2;
  warhead.add(nose);
  warhead.position.set(0, 0.03, -0.72);
  g.add(warhead);

  g.add(box(0.035, 0.09, 0.05, M.black, 0, -0.05, -0.05, 0.3));
  g.add(box(0.035, 0.09, 0.05, M.black, 0, -0.05, -0.3, 0.15));
  g.add(box(0.04, 0.05, 0.12, M.gunmetal, 0, 0.1, -0.1));
  g.add(box(0.012, 0.05, 0.01, M.darkSteel, 0, 0.13, -0.35));
  g.add(box(0.06, 0.03, 0.2, M.leather, 0, 0.085, 0.12));

  return g;
}

const BUILDERS = {
  axe: buildAxe, bow: buildBow, sword: buildSword,
  pistol: buildPistol, shotgun: buildShotgun, rifle: buildRifle, rpg: buildRPG, sniper: buildSniper,
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
    this.arrows = [];

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
    this.updateArrows(dt, zombieManager);

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

    const origin = this.camera.position.clone();
    const baseDir = new THREE.Vector3();
    this.camera.getWorldDirection(baseDir);

    if (def.projectile) {
      if (def.rocket) {
        this.spawnRocket(muzzle, baseDir, def);
        this.effects.muzzleFlash(muzzle);
      } else {
        this.spawnArrow(muzzle, baseDir, def);
      }
      if (this.mag <= 0) this.startReload();
      return;
    }

    this.effects.muzzleFlash(muzzle);

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

  spawnArrow(pos, dir, def) {
    const g = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.75, 5), M.wood);
    shaft.rotation.x = Math.PI / 2;
    g.add(shaft);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.12, 4), M.brightSteel);
    tip.rotation.x = -Math.PI / 2;
    tip.position.z = -0.42;
    g.add(tip);
    const fletchMat = new THREE.MeshLambertMaterial({ color: 0xe8e4d8, side: THREE.DoubleSide });
    for (let i = 0; i < 3; i++) {
      const ang = (i / 3) * Math.PI * 2;
      const f = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.09), fletchMat);
      f.position.set(Math.sin(ang) * 0.02, Math.cos(ang) * 0.02, 0.32);
      f.rotation.z = ang;
      g.add(f);
    }
    g.position.copy(pos);
    const vel = dir.clone().multiplyScalar(def.arrowSpeed);
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), dir);
    this.scene.add(g);
    this.arrows.push({ mesh: g, vel, damage: def.damage, life: 5, stuck: 0 });
  }

  spawnRocket(pos, dir, def) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8), M.gunmetal);
    body.rotation.x = Math.PI / 2;
    g.add(body);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 8), M.darkSteel);
    nose.rotation.x = -Math.PI / 2;
    nose.position.z = -0.3;
    g.add(nose);
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.25, 6), new THREE.MeshBasicMaterial({ color: 0xffa33a }));
    flame.rotation.x = Math.PI / 2;
    flame.position.z = 0.3;
    g.add(flame);
    g.position.copy(pos);
    const vel = dir.clone().multiplyScalar(def.arrowSpeed);
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), dir);
    this.scene.add(g);
    this.arrows.push({ mesh: g, vel, damage: def.damage, life: 6, stuck: 0, rocket: true, blastRadius: def.blastRadius });
  }

  explode(pos, damage, radius, zm) {
    this.effects.explosion(pos, radius);
    for (const z of zm.zombies) {
      if (z.dead) continue;
      const zp = z.group.position;
      const dx = pos.x - zp.x, dz = pos.z - zp.z;
      const d = Math.sqrt(dx * dx + dz * dz);
      if (d < radius + 0.8 * z.def.scale) {
        const mult = Math.max(0.35, 1 - d / (radius + 0.8));
        z.takeDamage(damage * mult, true);
        this.effects.blood(zp.clone().setY(1.3), 3);
      }
    }
  }

  updateArrows(dt, zm) {
    const fwd = new THREE.Vector3(0, 0, -1);
    for (let i = this.arrows.length - 1; i >= 0; i--) {
      const a = this.arrows[i];

      if (a.stuck > 0) {
        a.stuck -= dt;
        if (a.stuck <= 0) {
          this.scene.remove(a.mesh);
          this.arrows.splice(i, 1);
        }
        continue;
      }

      a.life -= dt;
      a.vel.y -= (a.rocket ? 1.5 : 3.5) * dt;
      a.mesh.position.addScaledVector(a.vel, dt);
      a.mesh.quaternion.setFromUnitVectors(fwd, a.vel.clone().normalize());

      let hit = false;
      for (const z of zm.zombies) {
        if (z.dead) continue;
        const zp = z.group.position;
        const dy = a.mesh.position.y - 1.2 * z.def.scale;
        const dx = a.mesh.position.x - zp.x;
        const dz = a.mesh.position.z - zp.z;
        if (dx * dx + dz * dz < (0.75 * z.def.scale) ** 2 && Math.abs(dy) < 1.3 * z.def.scale) {
          if (a.rocket) {
            this.explode(a.mesh.position.clone(), a.damage, a.blastRadius, zm);
          } else {
            z.takeDamage(a.damage, true);
            this.effects.blood(a.mesh.position, 5);
          }
          hit = true;
          break;
        }
      }

      if (hit || a.life <= 0) {
        this.scene.remove(a.mesh);
        this.arrows.splice(i, 1);
      } else if (a.mesh.position.y <= 0.05) {
        if (a.rocket) {
          this.explode(a.mesh.position.clone(), a.damage, a.blastRadius, zm);
          this.scene.remove(a.mesh);
          this.arrows.splice(i, 1);
        } else {
          a.mesh.position.y = 0.05;
          a.stuck = 2.5;
        }
      }
    }
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
