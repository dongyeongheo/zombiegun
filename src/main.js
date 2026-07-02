import * as THREE from 'three';
import { World } from './world.js';
import { Player } from './player.js';
import { WeaponSystem } from './weapons.js';
import { ZombieManager } from './zombies.js';
import { SoldierManager } from './soldiers.js';
import { CoinManager } from './coins.js';
import { ChestManager } from './chests.js';
import { VillagerManager } from './villagers.js';
import { Inventory } from './inventory.js';
import { Shop } from './shop.js';
import { HUD } from './hud.js';
import { Effects } from './effects.js';
import { GATE_Z } from './config.js';
import { randInt, distXZ } from './utils.js';
import { isInsideSafeZone } from './world.js';

const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 340);
scene.add(camera);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const world = new World(scene);
world.freezeStatics(camera);
const effects = new Effects(scene);
const player = new Player(camera, world);
const inventory = new Inventory();
const weapons = new WeaponSystem(camera, scene, effects);
const zombieManager = new ZombieManager(scene, world);
const soldierManager = new SoldierManager(scene, effects, world);
const coinManager = new CoinManager(scene);
const chestManager = new ChestManager(scene);
const villagerManager = new VillagerManager(scene, world);
const shop = new Shop(inventory);
const hud = new HUD();

player.armorReduction = inventory.armorReduction;
inventory.onEquipWeapon = key => weapons.equip(key);
weapons.equip(inventory.equippedWeapon);

zombieManager.onZombieKilled = z => {
  const total = randInt(z.def.coin[0], z.def.coin[1]);
  coinManager.dropBurst(z.group.position, total);
  if (z.lastHitByPlayer) hud.killMessage(z.def.name, total);
};

const playerCandidate = {
  isPlayer: true,
  ref: player,
  removed: false,
  pos: () => player.pos,
  damage: amt => player.takeDamage(amt),
};

let shopOpen = false;
let invOpen = false;
const shopModal = document.getElementById('shop-modal');
const invModal = document.getElementById('inv-modal');

function uiOpen() { return shopOpen || invOpen; }
inventory.isUIOpen = () => invOpen;

function closeAllUI() {
  shopOpen = false;
  invOpen = false;
  shopModal.style.display = 'none';
  invModal.style.display = 'none';
  if (started && player.alive) canvas.requestPointerLock?.();
}

function toggleShop() {
  if (invOpen) { invOpen = false; invModal.style.display = 'none'; }
  shopOpen = !shopOpen;
  shopModal.style.display = shopOpen ? 'block' : 'none';
  if (shopOpen) {
    shop.render();
    document.exitPointerLock?.();
  } else if (started && player.alive) {
    canvas.requestPointerLock?.();
  }
}

function toggleInventory() {
  if (shopOpen) { shopOpen = false; shopModal.style.display = 'none'; }
  invOpen = !invOpen;
  invModal.style.display = invOpen ? 'block' : 'none';
  document.body.classList.toggle('inv-open', invOpen);
  if (invOpen) {
    inventory.renderInventoryUI();
    document.exitPointerLock?.();
  } else {
    inventory.swapIdx = null;
    inventory.renderHotbar();
    if (started && player.alive) canvas.requestPointerLock?.();
  }
}

let nearShop = false;
let nearChest = null;

document.addEventListener('keydown', e => {
  if (!started) return;
  if (e.code === 'Tab' || e.code === 'KeyI') {
    e.preventDefault();
    toggleInventory();
  } else if (e.code === 'KeyE') {
    if (shopOpen) toggleShop();
    else if (nearChest && !uiOpen()) {
      const total = chestManager.open(nearChest, coinManager);
      if (total > 0) hud.notify(`상자 오픈! 코인 ${total}개`);
    }
    else if (nearShop && !invOpen) toggleShop();
  } else if (e.code === 'Escape') {
    if (uiOpen()) closeAllUI();
  } else if (e.code.startsWith('Digit')) {
    const idx = parseInt(e.code.slice(5)) - 1;
    const key = inventory.slotWeapon(idx);
    if (key) inventory.equipWeapon(key);
  }
});

document.addEventListener('wheel', e => {
  if (!started || uiOpen() || !player.alive) return;
  inventory.cycleSlot(e.deltaY > 0 ? 1 : -1);
});

let started = false;
document.getElementById('start-btn').addEventListener('click', () => {
  started = true;
  document.getElementById('start-screen').style.display = 'none';
  zombieManager.warmup(player.pos);
  canvas.requestPointerLock?.();
});

canvas.addEventListener('click', () => {
  if (started && player.alive && !uiOpen() && !document.pointerLockElement) {
    canvas.requestPointerLock?.();
  }
});

window.__debug = { player, zombieManager };

const frustum = new THREE.Frustum();
const projScreenMatrix = new THREE.Matrix4();
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  if (!started) {
    renderer.render(scene, camera);
    return;
  }

  const ui = uiOpen();

  player.armorReduction = inventory.armorReduction;
  player.update(dt, ui);
  world.updateSun(player.pos);

  const moving = !ui && (player.keys['KeyW'] || player.keys['KeyA'] || player.keys['KeyS'] || player.keys['KeyD']);
  const sprinting = moving && (player.keys['ShiftLeft'] || player.keys['ShiftRight']);
  const targetFov = sprinting ? 82 : 75;
  if (Math.abs(camera.fov - targetFov) > 0.1) {
    camera.fov += (targetFov - camera.fov) * Math.min(1, dt * 8);
    camera.updateProjectionMatrix();
  }
  weapons.update(dt, zombieManager, ui, player.alive, !!moving);

  projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  frustum.setFromProjectionMatrix(projScreenMatrix);

  const soldierCandidates = soldierManager.getVisibleSoldiers();
  const candidates = player.alive ? [playerCandidate, ...soldierCandidates] : soldierCandidates;
  zombieManager.update(dt, candidates, player.pos, frustum);
  soldierManager.update(dt, zombieManager.zombies);

  coinManager.update(dt, player.pos, n => {
    inventory.addCoins(n);
  });
  chestManager.update(dt, player.pos);
  villagerManager.update(dt);

  nearShop = distXZ(player.pos, world.shopPos) < 8;
  nearChest = chestManager.nearestUnopened(player.pos);
  if (nearChest && !ui && player.alive) {
    hud.showHint('<b>E</b> 상자 열기');
  } else if (nearShop && !ui && player.alive) {
    hud.showHint('<b>E</b> 상점 열기');
  } else {
    hud.hideHint();
  }

  effects.update(dt);
  hud.update(player, inventory, weapons);
  hud.updateCompass(player, 0, GATE_Z + 4, isInsideSafeZone(player.pos));

  renderer.render(scene, camera);
}

animate();
