import * as THREE from 'three';
import { PLAYER, SAFE_HALF } from './config.js';

export class Player {
  constructor(camera, world) {
    this.camera = camera;
    this.world = world;
    this.pos = new THREE.Vector3(0, PLAYER.height, 10);
    this.yaw = Math.PI;
    this.pitch = 0;
    this.hp = PLAYER.maxHp;
    this.alive = true;
    this.timeSinceDamage = 99;
    this.keys = {};
    this.deathTimer = 0;
    this.velY = 0;
    this.grounded = true;

    document.addEventListener('keydown', e => { this.keys[e.code] = true; });
    document.addEventListener('keyup', e => { this.keys[e.code] = false; });
    document.addEventListener('mousemove', e => {
      if (document.pointerLockElement !== document.body && document.pointerLockElement !== document.querySelector('#canvas')) return;
      this.yaw -= e.movementX * 0.0022;
      this.pitch -= e.movementY * 0.0022;
      this.pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, this.pitch));
    });
  }

  get armorReduction() {
    return this._armorReduction || 0;
  }
  set armorReduction(v) { this._armorReduction = v; }

  takeDamage(amount) {
    if (!this.alive) return;
    const final = amount * (1 - this.armorReduction);
    this.hp -= final;
    this.timeSinceDamage = 0;
    const vig = document.getElementById('damage-vignette');
    vig.style.transition = 'none';
    vig.style.opacity = '1';
    requestAnimationFrame(() => {
      vig.style.transition = 'opacity 0.5s';
      vig.style.opacity = '0';
    });
    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
    }
  }

  die() {
    this.alive = false;
    this.deathTimer = 3;
    document.getElementById('death-screen').style.display = 'flex';
    document.exitPointerLock?.();
  }

  respawn() {
    this.alive = true;
    this.hp = PLAYER.maxHp;
    this.pos.set(0, PLAYER.height, 10);
    this.velY = 0;
    this.grounded = true;
    this.timeSinceDamage = 99;
    document.getElementById('death-screen').style.display = 'none';
    document.querySelector('#canvas').requestPointerLock?.();
  }

  update(dt, uiOpen) {
    if (!this.alive) {
      this.deathTimer -= dt;
      if (this.deathTimer <= 0) this.respawn();
      return;
    }

    this.timeSinceDamage += dt;
    if (this.timeSinceDamage > PLAYER.regenDelay && this.hp < PLAYER.maxHp) {
      this.hp = Math.min(PLAYER.maxHp, this.hp + PLAYER.regenRate * dt);
    }

    if (!uiOpen) {
      const forward = (this.keys['KeyW'] ? 1 : 0) - (this.keys['KeyS'] ? 1 : 0);
      const strafe = (this.keys['KeyD'] ? 1 : 0) - (this.keys['KeyA'] ? 1 : 0);
      const speed = (this.keys['ShiftLeft'] || this.keys['ShiftRight']) ? PLAYER.sprintSpeed : PLAYER.walkSpeed;
      if (forward || strafe) {
        const len = Math.sqrt(forward * forward + strafe * strafe);
        const f = forward / len, s = strafe / len;
        const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
        this.pos.x += (-sin * f + cos * s) * speed * dt;
        this.pos.z += (-cos * f - sin * s) * speed * dt;
      }

      if (this.keys['Space'] && this.grounded) {
        this.velY = PLAYER.jumpVel;
        this.grounded = false;
      }
      this.world.resolveCollision(this.pos, PLAYER.radius);
    }

    if (!this.grounded) {
      this.velY -= PLAYER.gravity * dt;
      this.pos.y += this.velY * dt;
      if (this.pos.y <= PLAYER.height) {
        this.pos.y = PLAYER.height;
        this.velY = 0;
        this.grounded = true;
      }
    }

    this.camera.position.copy(this.pos);
    this.camera.rotation.set(0, 0, 0);
    this.camera.rotateY(this.yaw);
    this.camera.rotateX(this.pitch);
  }
}
