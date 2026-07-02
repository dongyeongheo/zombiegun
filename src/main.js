import * as THREE from 'three';
import { World } from './world.js';
import { Player } from './player.js';
import { WeaponSystem } from './weapons.js';
import { ZombieManager } from './zombies.js';
import { SoldierManager } from './soldiers.js';
import { CoinManager } from './coins.js';
import { Inventory } from './inventory.js';
import { Shop } from './shop.js';
import { HUD } from './hud.js';
import { Effects } from './effects.js';
import { WEAPON_ORDER } from './config.js';
import { randInt, distXZ } from './utils.js';

const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 800);
scene.add(camera);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const world = new World(scene);
const effects = new Effects(scene);
const player = new Player(camera, world);
const inventory = new Inventory();
const weapons = new WeaponSystem(camera, scene, effects);
const zombieManager = new ZombieManager(scene, world);
const soldierManager = new SoldierManager(scene, effects, world);
const coinManager = new CoinManager(scene);
const shop = new Shop(inventory);
const hud = new HUD();

player.armorReduction = inventory.armorReduction;
inventory.onEquipWeapon = key => weapons.equip(key);
weapons.equip(inventory.equippedWeapon);

zombieManager.onZombieKilled = z => {
  if (!z.lastHitByPlayer) return;
  const coins = randInt(z.def.coin[0], z.def.coin[1]);
  inventory.addCoins(coins);
  hud.killMessage(z.def.name, coins);
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
  if (invOpen) {
    inventory.renderInventoryUI();
    document.exitPointerLock?.();
  } else if (started && player.alive) {
    canvas.requestPointerLock?.();
  }
}

let nearShop = false;

document.addEventListener('keydown', e => {
  if (!started) return;
  if (e.code === 'Tab') {
    e.preventDefault();
    toggleInventory();
  } else if (e.code === 'KeyE') {
    if (shopOpen) toggleShop();
    else if (nearShop && !invOpen) toggleShop();
  } else if (e.code === 'Escape') {
    if (uiOpen()) closeAllUI();
  } else if (e.code.startsWith('Digit')) {
    const idx = parseInt(e.code.slice(5)) - 1;
    const key = WEAPON_ORDER[idx];
    if (key && inventory.ownedWeapons.includes(key)) {
      inventory.equipWeapon(key);
    }
  }
});

let started = false;
document.getElementById('start-btn').addEventListener('click', () => {
  started = true;
  document.getElementById('start-screen').style.display = 'none';
  canvas.requestPointerLock?.();
});

canvas.addEventListener('click', () => {
  if (started && player.alive && !uiOpen() && !document.pointerLockElement) {
    canvas.requestPointerLock?.();
  }
});

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
  weapons.update(dt, zombieManager, ui, player.alive, !!moving);

  const soldierCandidates = soldierManager.getVisibleSoldiers();
  const candidates = player.alive ? [playerCandidate, ...soldierCandidates] : soldierCandidates;
  zombieManager.update(dt, candidates, camera);
  soldierManager.update(dt, zombieManager.zombies);

  coinManager.update(dt, player.pos, n => {
    inventory.addCoins(n);
  });

  nearShop = distXZ(player.pos, world.shopPos) < 8;
  if (nearShop && !ui && player.alive) {
    hud.showHint('<b>E</b> 상점 열기');
  } else {
    hud.hideHint();
  }

  effects.update(dt);
  hud.update(player, inventory, weapons);

  renderer.render(scene, camera);
}

animate();
