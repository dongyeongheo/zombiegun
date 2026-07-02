import * as THREE from 'three';

export function rand(min, max) { return min + Math.random() * (max - min); }
export function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
export function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export function grassTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#4d6b35';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2200; i++) {
    const shade = Math.random();
    ctx.fillStyle = shade < 0.5 ? 'rgba(60,90,40,0.5)' : (shade < 0.8 ? 'rgba(95,125,60,0.45)' : 'rgba(120,140,70,0.35)');
    ctx.fillRect(Math.random() * 256, Math.random() * 256, rand(1, 3), rand(1, 4));
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function dirtTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#7a6a4e';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1600; i++) {
    const shade = Math.random();
    ctx.fillStyle = shade < 0.5 ? 'rgba(100,85,60,0.5)' : 'rgba(140,125,95,0.4)';
    ctx.beginPath();
    ctx.arc(Math.random() * 256, Math.random() * 256, rand(1, 3.5), 0, Math.PI * 2);
    ctx.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function chainlinkTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 128, 128);
  ctx.strokeStyle = 'rgba(190,195,200,0.95)';
  ctx.lineWidth = 2.5;
  const s = 16;
  for (let x = -s; x < 128 + s; x += s) {
    ctx.beginPath(); ctx.moveTo(x, -4); ctx.lineTo(x + 128, 132); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 128, -4); ctx.lineTo(x, 132); ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export function canvasTentTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#5c6b45';
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 400; i++) {
    ctx.fillStyle = Math.random() < 0.5 ? 'rgba(70,82,52,0.5)' : 'rgba(105,118,80,0.4)';
    ctx.fillRect(Math.random() * 128, Math.random() * 128, rand(2, 6), rand(1, 3));
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();

export function distXZ(a, b) {
  const dx = a.x - b.x, dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

export function angleToXZ(from, to) {
  return Math.atan2(to.x - from.x, to.z - from.z);
}

export function inFov(pos, facingYaw, target, fovDeg, maxDist) {
  const d = distXZ(pos, target);
  if (d > maxDist) return false;
  if (d < 6) return true;
  const ang = angleToXZ(pos, target);
  let diff = ang - facingYaw;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return Math.abs(diff) < (fovDeg * Math.PI / 180) / 2;
}
