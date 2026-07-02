import * as THREE from 'three';

export class Effects {
  constructor(scene) {
    this.scene = scene;
    this.tracers = [];
    this.particles = [];
    this.flashes = [];

    this.tracerMat = new THREE.LineBasicMaterial({ color: 0xffe28a, transparent: true, opacity: 0.9 });
    this.sniperTracerMat = new THREE.LineBasicMaterial({ color: 0x9ad4ff, transparent: true, opacity: 1 });
    this.bloodMat = new THREE.MeshBasicMaterial({ color: 0x9e1a1a });
    this.bloodGeo = new THREE.BoxGeometry(0.14, 0.14, 0.14);
  }

  tracer(from, to, sniper = false) {
    const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
    const line = new THREE.Line(geo, (sniper ? this.sniperTracerMat : this.tracerMat).clone());
    this.scene.add(line);
    this.tracers.push({ line, life: sniper ? 0.18 : 0.07 });
  }

  blood(pos, count = 6) {
    for (let i = 0; i < count; i++) {
      const m = new THREE.Mesh(this.bloodGeo, this.bloodMat);
      m.position.copy(pos);
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 5,
        Math.random() * 4 + 1,
        (Math.random() - 0.5) * 5
      );
      this.scene.add(m);
      this.particles.push({ mesh: m, vel, life: 0.6 });
    }
  }

  muzzleFlash(pos) {
    const light = new THREE.PointLight(0xffc860, 8, 8);
    light.position.copy(pos);
    this.scene.add(light);
    this.flashes.push({ light, life: 0.05 });
  }

  update(dt) {
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const t = this.tracers[i];
      t.life -= dt;
      t.line.material.opacity = Math.max(0, t.life / 0.07);
      if (t.life <= 0) {
        this.scene.remove(t.line);
        t.line.geometry.dispose();
        t.line.material.dispose();
        this.tracers.splice(i, 1);
      }
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.vel.y -= 12 * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      if (p.life <= 0 || p.mesh.position.y < 0) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
      }
    }
    for (let i = this.flashes.length - 1; i >= 0; i--) {
      const f = this.flashes[i];
      f.life -= dt;
      if (f.life <= 0) {
        this.scene.remove(f.light);
        this.flashes.splice(i, 1);
      }
    }
  }
}
