import * as THREE from 'three';
import { MAP_HALF, SAFE_HALF, GATE_WIDTH, GATE_Z, FENCE_HEIGHT } from './config.js';
import { rand, grassTexture, dirtTexture, chainlinkTexture, canvasTentTexture } from './utils.js';

export class World {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
    this.tentDoors = [];
    this.shopPos = new THREE.Vector3(-30, 0, -30);

    this.buildLights();
    this.buildGround();
    this.buildFence();
    this.buildTents();
    this.buildShop();
    this.buildNature();
  }

  buildLights() {
    const hemi = new THREE.HemisphereLight(0xcfe8ff, 0x3a4a2a, 0.9);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff2dc, 1.6);
    sun.position.set(80, 120, 60);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -110;
    sun.shadow.camera.right = 110;
    sun.shadow.camera.top = 110;
    sun.shadow.camera.bottom = -110;
    sun.shadow.camera.far = 400;
    sun.shadow.bias = -0.0004;
    this.scene.add(sun);
    this.scene.add(sun.target);
    this.sun = sun;

    this.scene.fog = new THREE.Fog(0xb8c9d4, 120, 420);
    this.scene.background = new THREE.Color(0x9fb8cc);
  }

  updateSun(playerPos) {
    this.sun.position.set(playerPos.x + 80, 120, playerPos.z + 60);
    this.sun.target.position.set(playerPos.x, 0, playerPos.z);
  }

  buildGround() {
    const gtex = grassTexture();
    gtex.repeat.set(60, 60);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(MAP_HALF * 2, MAP_HALF * 2),
      new THREE.MeshLambertMaterial({ map: gtex })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const dtex = dirtTexture();
    dtex.repeat.set(12, 12);
    const safeGround = new THREE.Mesh(
      new THREE.PlaneGeometry(SAFE_HALF * 2 - 2, SAFE_HALF * 2 - 2),
      new THREE.MeshLambertMaterial({ map: dtex })
    );
    safeGround.rotation.x = -Math.PI / 2;
    safeGround.position.y = 0.02;
    safeGround.receiveShadow = true;
    this.scene.add(safeGround);

    const pathTex = dirtTexture();
    pathTex.repeat.set(1.5, 10);
    const path = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 60),
      new THREE.MeshLambertMaterial({ map: pathTex })
    );
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, 0.015, SAFE_HALF + 30);
    this.scene.add(path);
  }

  buildFence() {
    const postMat = new THREE.MeshLambertMaterial({ color: 0x5a5f66 });
    const meshTex = chainlinkTexture();
    const railMat = new THREE.MeshLambertMaterial({ color: 0x6b7178 });

    const half = SAFE_HALF;
    const segs = [
      { from: [-half, -half], to: [half, -half] },
      { from: [-half, -half], to: [-half, half] },
      { from: [half, -half], to: [half, half] },
      { from: [-half, half], to: [-GATE_WIDTH / 2, half] },
      { from: [GATE_WIDTH / 2, half], to: [half, half] },
    ];

    for (const seg of segs) {
      const dx = seg.to[0] - seg.from[0];
      const dz = seg.to[1] - seg.from[1];
      const len = Math.sqrt(dx * dx + dz * dz);
      const cx = (seg.from[0] + seg.to[0]) / 2;
      const cz = (seg.from[1] + seg.to[1]) / 2;
      const yaw = Math.atan2(dx, dz);

      const tex = meshTex.clone();
      tex.needsUpdate = true;
      tex.repeat.set(len / 4, FENCE_HEIGHT / 4);
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(len, FENCE_HEIGHT),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false })
      );
      mesh.position.set(cx, FENCE_HEIGHT / 2, cz);
      mesh.rotation.y = yaw + Math.PI / 2;
      this.scene.add(mesh);

      for (const yOff of [0.15, FENCE_HEIGHT - 0.08]) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, len), railMat);
        rail.position.set(cx, yOff + 0.06, cz);
        rail.rotation.y = yaw;
        this.scene.add(rail);
      }

      const postCount = Math.max(2, Math.round(len / 8) + 1);
      for (let i = 0; i < postCount; i++) {
        const t = i / (postCount - 1);
        const px = seg.from[0] + dx * t;
        const pz = seg.from[1] + dz * t;
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, FENCE_HEIGHT + 0.4, 6), postMat);
        post.position.set(px, (FENCE_HEIGHT + 0.4) / 2, pz);
        post.castShadow = true;
        this.scene.add(post);
      }
    }

    for (const sx of [-1, 1]) {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.6, FENCE_HEIGHT + 1.2, 0.6), postMat);
      pillar.position.set(sx * GATE_WIDTH / 2, (FENCE_HEIGHT + 1.2) / 2, GATE_Z);
      pillar.castShadow = true;
      this.scene.add(pillar);
    }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(GATE_WIDTH + 1, 0.5, 0.5), postMat);
    beam.position.set(0, FENCE_HEIGHT + 0.9, GATE_Z);
    this.scene.add(beam);

    const signC = document.createElement('canvas');
    signC.width = 256; signC.height = 64;
    const sctx = signC.getContext('2d');
    sctx.fillStyle = '#2a2e24'; sctx.fillRect(0, 0, 256, 64);
    sctx.fillStyle = '#ffd24a'; sctx.font = 'bold 34px sans-serif'; sctx.textAlign = 'center';
    sctx.fillText('SAFE ZONE', 128, 44);
    const signTex = new THREE.CanvasTexture(signC);
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 2),
      new THREE.MeshBasicMaterial({ map: signTex })
    );
    sign.position.set(0, FENCE_HEIGHT + 0.9, GATE_Z + 0.3);
    this.scene.add(sign);
  }

  buildTents() {
    const tentTex = canvasTentTexture();
    const tentMat = new THREE.MeshLambertMaterial({ map: tentTex });
    const darkMat = new THREE.MeshLambertMaterial({ color: 0x3a4230 });

    const positions = [
      [-38, 18], [-38, 0], [-38, -18],
      [38, 18], [38, 0], [38, -18],
    ];

    for (const [x, z] of positions) {
      const tent = new THREE.Group();

      const body = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 7, 3, 1), tentMat);
      body.rotation.z = Math.PI / 2;
      body.rotation.x = Math.PI / 2;
      body.position.y = 1.7;
      body.scale.set(1, 1, 0.72);
      body.castShadow = true;
      tent.add(body);

      const back = new THREE.Mesh(new THREE.CircleGeometry(3.4, 3), darkMat);
      back.position.set(0, 1.7, -3.5);
      back.scale.y = 0.72;
      back.rotation.z = Math.PI;
      tent.add(back);

      const doorFrame = new THREE.Mesh(new THREE.RingGeometry(1.2, 3.4, 3, 1), darkMat);
      doorFrame.position.set(0, 1.7, 3.5);
      doorFrame.scale.y = 0.72;
      doorFrame.rotation.z = Math.PI;
      tent.add(doorFrame);

      const doorHole = new THREE.Mesh(
        new THREE.CircleGeometry(1.2, 3),
        new THREE.MeshBasicMaterial({ color: 0x14170f })
      );
      doorHole.position.set(0, 1.7, 3.49);
      doorHole.scale.y = 0.72;
      doorHole.rotation.z = Math.PI;
      tent.add(doorHole);

      tent.position.set(x, 0, z);
      tent.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
      this.scene.add(tent);

      const doorDir = x < 0 ? 1 : -1;
      this.tentDoors.push(new THREE.Vector3(x + doorDir * 4.5, 0, z));
      this.colliders.push({ x, z, r: 4.2 });
    }
  }

  buildShop() {
    const { x, z } = { x: this.shopPos.x, z: this.shopPos.z };
    const shop = new THREE.Group();

    const wallMat = new THREE.MeshLambertMaterial({ color: 0x8a7355 });
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x4a3826 });
    const counterMat = new THREE.MeshLambertMaterial({ color: 0x6e5a3e });

    const back = new THREE.Mesh(new THREE.BoxGeometry(10, 4.5, 0.4), wallMat);
    back.position.set(0, 2.25, -3);
    back.castShadow = true;
    shop.add(back);

    for (const sx of [-1, 1]) {
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.5, 6), wallMat);
      side.position.set(sx * 4.8, 2.25, 0);
      side.castShadow = true;
      shop.add(side);
    }

    const roof = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.4, 8), roofMat);
    roof.position.set(0, 4.7, 0.4);
    roof.rotation.x = -0.08;
    roof.castShadow = true;
    shop.add(roof);

    const counter = new THREE.Mesh(new THREE.BoxGeometry(9, 1.1, 1), counterMat);
    counter.position.set(0, 0.55, 2.6);
    counter.castShadow = true;
    shop.add(counter);

    const signC = document.createElement('canvas');
    signC.width = 256; signC.height = 64;
    const ctx = signC.getContext('2d');
    ctx.fillStyle = '#3a2c1a'; ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = '#ffd24a'; ctx.font = 'bold 40px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('상 점', 128, 47);
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 1.5),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(signC) })
    );
    sign.position.set(0, 5.4, 2.5);
    shop.add(sign);

    const crateMat = new THREE.MeshLambertMaterial({ color: 0x7a6544 });
    for (const [cx, cz, s] of [[-3, -1, 1.2], [-1.6, -1.2, 0.9], [3, -0.8, 1.1]]) {
      const crate = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), crateMat);
      crate.position.set(cx, s / 2, cz);
      crate.castShadow = true;
      shop.add(crate);
    }

    shop.position.set(x, 0, z);
    shop.rotation.y = Math.PI / 4;
    this.scene.add(shop);

    this.colliders.push({ x, z, r: 5.5 });
  }

  buildNature() {
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5e4630 });
    const leafMats = [
      new THREE.MeshLambertMaterial({ color: 0x3e6b2f }),
      new THREE.MeshLambertMaterial({ color: 0x4d7a38 }),
      new THREE.MeshLambertMaterial({ color: 0x35592a }),
    ];
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x7d7f82, flatShading: true });

    for (let i = 0; i < 120; i++) {
      let x, z;
      do {
        x = rand(-MAP_HALF + 15, MAP_HALF - 15);
        z = rand(-MAP_HALF + 15, MAP_HALF - 15);
      } while (Math.abs(x) < SAFE_HALF + 12 && Math.abs(z) < SAFE_HALF + 12);

      if (Math.random() < 0.7) {
        const h = rand(4, 7);
        const tree = new THREE.Group();
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, h * 0.45, 6), trunkMat);
        trunk.position.y = h * 0.225;
        trunk.castShadow = true;
        tree.add(trunk);
        const mat = leafMats[i % 3];
        let ly = h * 0.42;
        for (let l = 0; l < 3; l++) {
          const r = (3 - l) * 0.9 * (h / 6);
          const cone = new THREE.Mesh(new THREE.ConeGeometry(r, h * 0.32, 7), mat);
          cone.position.y = ly + h * 0.13;
          cone.castShadow = true;
          tree.add(cone);
          ly += h * 0.2;
        }
        tree.position.set(x, 0, z);
        tree.rotation.y = rand(0, Math.PI * 2);
        this.scene.add(tree);
        this.colliders.push({ x, z, r: 0.8 });
      } else {
        const s = rand(0.7, 2.2);
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), rockMat);
        rock.position.set(x, s * 0.5, z);
        rock.rotation.set(rand(0, 3), rand(0, 3), rand(0, 3));
        rock.castShadow = true;
        this.scene.add(rock);
        this.colliders.push({ x, z, r: s * 0.9 });
      }
    }
  }

  resolveCollision(pos, radius) {
    for (const c of this.colliders) {
      const dx = pos.x - c.x;
      const dz = pos.z - c.z;
      const d = Math.sqrt(dx * dx + dz * dz);
      const minD = c.r + radius;
      if (d < minD && d > 0.001) {
        pos.x = c.x + (dx / d) * minD;
        pos.z = c.z + (dz / d) * minD;
      }
    }

    const half = SAFE_HALF;
    const m = radius + 0.3;
    const inGateX = Math.abs(pos.x) < GATE_WIDTH / 2 - 0.5;
    const wasInside = Math.abs(pos.x) < half && Math.abs(pos.z) < half;

    if (Math.abs(pos.z - half) < m && Math.abs(pos.x) < half + m && !inGateX) {
      pos.z = pos.z > half ? half + m : half - m;
    }
    if (Math.abs(pos.z + half) < m && Math.abs(pos.x) < half + m) {
      pos.z = pos.z > -half ? -half + m : -half - m;
    }
    if (Math.abs(pos.x - half) < m && Math.abs(pos.z) < half + m) {
      pos.x = pos.x > half ? half + m : half - m;
    }
    if (Math.abs(pos.x + half) < m && Math.abs(pos.z) < half + m) {
      pos.x = pos.x > -half ? -half + m : -half - m;
    }

    pos.x = Math.max(-MAP_HALF + 2, Math.min(MAP_HALF - 2, pos.x));
    pos.z = Math.max(-MAP_HALF + 2, Math.min(MAP_HALF - 2, pos.z));
  }
}

export function isInsideSafeZone(pos, margin = 0) {
  return Math.abs(pos.x) < SAFE_HALF - margin && Math.abs(pos.z) < SAFE_HALF - margin;
}

export function distToSafeZone(pos) {
  const dx = Math.max(Math.abs(pos.x) - SAFE_HALF, 0);
  const dz = Math.max(Math.abs(pos.z) - SAFE_HALF, 0);
  return Math.sqrt(dx * dx + dz * dz);
}
