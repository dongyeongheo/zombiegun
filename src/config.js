export const MAP_HALF = 420;
export const SAFE_HALF = 36;
export const GATE_WIDTH = 14;
export const GATE_Z = SAFE_HALF;
export const FENCE_HEIGHT = 4;

export const PLAYER = {
  maxHp: 100,
  walkSpeed: 5,
  sprintSpeed: 10,
  jumpVel: 8,
  gravity: 24,
  height: 1.7,
  radius: 0.6,
  regenDelay: 5,
  regenRate: 3,
};

export const WEAPONS = {
  axe:     { name: '도끼',        price: 0,     type: 'melee',  damage: 15,   interval: 0.8, range: 3.0 },
  bow:     { name: '활',          price: 50,    type: 'ranged', damage: 20,   interval: 0.1, mag: 1,  reload: 0.7, auto: false, projectile: true, arrowSpeed: 42 },
  sword:   { name: '대검',        price: 200,   type: 'melee',  damage: 35,   interval: 1.2, range: 3.4 },
  pistol:  { name: '.22구경',     price: 1000,  type: 'ranged', damage: 15,   interval: 0.3, mag: 7,  reload: 2,   auto: false },
  shotgun: { name: '더블배럴샷건', price: 2000,  type: 'ranged', damage: 80,   interval: 0.5, mag: 2,  reload: 1.5, auto: false, pellets: 8 },
  rifle:   { name: '돌격소총',    price: 5000,  type: 'ranged', damage: 40,   interval: 0.1, mag: 30, reload: 3,   auto: true },
  rpg:     { name: 'RPG',        price: 7500,  type: 'ranged', damage: 200,  interval: 1,   mag: 1,  reload: 3,   auto: false, projectile: true, rocket: true, arrowSpeed: 30, blastRadius: 6 },
  sniper:  { name: '대물저격총',  price: 10000, type: 'ranged', damage: 1000, interval: 1,   mag: 5,  reload: 4,   auto: false, pierce: true },
};
export const WEAPON_ORDER = ['axe', 'bow', 'sword', 'pistol', 'shotgun', 'rifle', 'rpg', 'sniper'];
export const WEAPON_SHORT = { axe: '도끼', bow: '활', sword: '대검', pistol: '권총', shotgun: '샷건', rifle: '소총', rpg: 'RPG', sniper: '저격' };

export const ARMORS = {
  normal_body: { name: '일반 갑옷',   slot: 'body', reduce: 0.05, price: 100 },
  normal_head: { name: '일반 투구',   slot: 'head', reduce: 0.05, price: 100 },
  iron_body:   { name: '쇠 갑옷',     slot: 'body', reduce: 0.10, price: 200 },
  iron_head:   { name: '쇠 투구',     slot: 'head', reduce: 0.10, price: 200 },
  mil_body:    { name: '현대 군 갑옷', slot: 'body', reduce: 0.20, price: 1000 },
  mil_head:    { name: '현대 군 투구', slot: 'head', reduce: 0.20, price: 1000 },
};
export const ARMOR_ORDER = ['normal_body', 'normal_head', 'iron_body', 'iron_head', 'mil_body', 'mil_head'];

export const ZOMBIES = {
  walker:  { name: '워커',     hp: 70,   atkInterval: 1,   damage: 5,  speed: 3,   coin: [40, 80],   scale: 1.0,  color: 0x6a8f4d, sight: 35, fov: 110 },
  leader:  { name: '워커대장', hp: 80,   atkInterval: 0.7, damage: 10, speed: 4,   coin: [80, 120],  scale: 1.12, color: 0x4a6b35, sight: 40, fov: 120 },
  runner:  { name: '러너',     hp: 100,  atkInterval: 0.6, damage: 7,  speed: 8,   coin: [60, 120],  scale: 0.95, color: 0xa8a34a, sight: 45, fov: 130 },
  alpha:   { name: '알파',     hp: 200,  atkInterval: 0.6, damage: 15, speed: 9,   coin: [120, 200], scale: 1.18, color: 0x8f3d2e, sight: 50, fov: 140 },
  bruiser: { name: '브루저',   hp: 500,  atkInterval: 1,   damage: 25, speed: 6,   coin: [160, 240], scale: 1.55, color: 0x5c4a6e, sight: 40, fov: 110 },
  super:   { name: '슈퍼좀비', hp: 1200, atkInterval: 0.3, damage: 30, speed: 12,  coin: [300, 500], scale: 1.4,  color: 0x8a1f1f, sight: 55, fov: 150 },
};

export const ZOMBIE_CAP = 500;
export const SPAWN_INTERVAL = 0.8;
export const SPAWNS_PER_TICK = 2;
export const INITIAL_SPAWNS = 60;
export const ZOMBIE_CULL_DIST = 320;
export const ATTACK_RANGE = 2.4;
export const LOSE_SIGHT_TIME = 4;

export const COIN_MAX = 120;
export const COIN_RESPAWN = 1.5;
export const COIN_PICKUP_RADIUS = 2.2;
export const FIELD_COIN_VALUE = 2;

export const CHEST_COUNT = 30;
export const CHEST_COIN_MIN = 1000;
export const CHEST_COIN_MAX = 3000;

export const SOLDIER = {
  arDamage: 2,
  arInterval: 0.18,
  arRange: 32,
  sniperDamage: 50,
  sniperInterval: 1.8,
  sniperRange: 60,
  patrolSpeed: 3,
  deploySpeed: 9,
  alertDist: 30,
  clearDist: 45,
};
