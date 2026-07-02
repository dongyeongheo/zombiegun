export const MAP_HALF = 300;
export const SAFE_HALF = 60;
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
  bow:     { name: '활',          price: 50,    type: 'ranged', damage: 20,   interval: 0.1, mag: 1,  reload: 0.7, auto: false },
  sword:   { name: '대검',        price: 200,   type: 'melee',  damage: 35,   interval: 1.2, range: 3.4 },
  pistol:  { name: '.22구경',     price: 1000,  type: 'ranged', damage: 15,   interval: 0.3, mag: 7,  reload: 2,   auto: false },
  shotgun: { name: '더블배럴샷건', price: 2000,  type: 'ranged', damage: 80,   interval: 0.5, mag: 2,  reload: 1.5, auto: false, pellets: 8 },
  rifle:   { name: '돌격소총',    price: 5000,  type: 'ranged', damage: 40,   interval: 0.1, mag: 30, reload: 3,   auto: true },
  sniper:  { name: '대물저격총',  price: 10000, type: 'ranged', damage: 1000, interval: 1,   mag: 5,  reload: 4,   auto: false, pierce: true },
};
export const WEAPON_ORDER = ['axe', 'bow', 'sword', 'pistol', 'shotgun', 'rifle', 'sniper'];

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
  walker:  { name: '워커',     hp: 70,  atkInterval: 1,   damage: 5,  speed: 3,   coin: [20, 40],  scale: 1.0,  color: 0x6a8f4d, sight: 35, fov: 110 },
  leader:  { name: '워커대장', hp: 80,  atkInterval: 0.7, damage: 10, speed: 4,   coin: [40, 60],  scale: 1.12, color: 0x4a6b35, sight: 40, fov: 120 },
  runner:  { name: '러너',     hp: 100, atkInterval: 0.6, damage: 7,  speed: 8,   coin: [30, 60],  scale: 0.95, color: 0xa8a34a, sight: 45, fov: 130 },
  alpha:   { name: '알파',     hp: 200, atkInterval: 0.6, damage: 15, speed: 9,   coin: [60, 100], scale: 1.18, color: 0x8f3d2e, sight: 50, fov: 140 },
  bruiser: { name: '브루저',   hp: 500, atkInterval: 1,   damage: 25, speed: 6,   coin: [80, 120], scale: 1.55, color: 0x5c4a6e, sight: 40, fov: 110 },
};

export const ZOMBIE_CAP = 60;
export const SPAWN_INTERVAL = 2;
export const INITIAL_SPAWNS = 14;
export const ATTACK_RANGE = 2.4;
export const LOSE_SIGHT_TIME = 4;

export const COIN_MAX = 90;
export const COIN_RESPAWN = 1.5;
export const COIN_PICKUP_RADIUS = 2.2;

export const SOLDIER = {
  arDamage: 40,
  arInterval: 0.13,
  arRange: 55,
  sniperDamage: 1000,
  sniperInterval: 1.2,
  sniperRange: 95,
  patrolSpeed: 3,
  deploySpeed: 9,
  alertDist: 30,
  clearDist: 45,
};
