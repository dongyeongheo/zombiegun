import { WEAPONS, WEAPON_ORDER, ARMORS, ARMOR_ORDER } from './config.js';

const SAVE_KEY = 'zombiegun_save_v1';

export class Inventory {
  constructor() {
    this.coins = 0;
    this.ownedWeapons = ['axe'];
    this.ownedArmors = [];
    this.equippedWeapon = 'axe';
    this.equippedBody = null;
    this.equippedHead = null;
    this.onEquipWeapon = null;
    this.load();
  }

  save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      coins: this.coins,
      ownedWeapons: this.ownedWeapons,
      ownedArmors: this.ownedArmors,
      equippedWeapon: this.equippedWeapon,
      equippedBody: this.equippedBody,
      equippedHead: this.equippedHead,
    }));
  }

  load() {
    try {
      const data = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (!data) return;
      this.coins = data.coins || 0;
      this.ownedWeapons = data.ownedWeapons || ['axe'];
      this.ownedArmors = data.ownedArmors || [];
      this.equippedWeapon = data.equippedWeapon || 'axe';
      this.equippedBody = data.equippedBody || null;
      this.equippedHead = data.equippedHead || null;
    } catch (e) { /* corrupt save */ }
  }

  addCoins(n) {
    this.coins += n;
    this.save();
  }

  get armorReduction() {
    let r = 0;
    if (this.equippedBody) r += ARMORS[this.equippedBody].reduce;
    if (this.equippedHead) r += ARMORS[this.equippedHead].reduce;
    return r;
  }

  buyWeapon(key) {
    const def = WEAPONS[key];
    if (this.ownedWeapons.includes(key) || this.coins < def.price) return false;
    this.coins -= def.price;
    this.ownedWeapons.push(key);
    this.save();
    return true;
  }

  buyArmor(key) {
    const def = ARMORS[key];
    if (this.ownedArmors.includes(key) || this.coins < def.price) return false;
    this.coins -= def.price;
    this.ownedArmors.push(key);
    this.save();
    return true;
  }

  equipWeapon(key) {
    if (!this.ownedWeapons.includes(key)) return;
    this.equippedWeapon = key;
    if (this.onEquipWeapon) this.onEquipWeapon(key);
    this.save();
  }

  equipArmor(key) {
    if (!this.ownedArmors.includes(key)) return;
    const def = ARMORS[key];
    if (def.slot === 'body') {
      this.equippedBody = this.equippedBody === key ? null : key;
    } else {
      this.equippedHead = this.equippedHead === key ? null : key;
    }
    this.save();
  }

  renderInventoryUI() {
    const grid = document.getElementById('inv-grid');
    grid.innerHTML = '';

    const wTitle = document.createElement('div');
    wTitle.className = 'shop-section-title';
    wTitle.textContent = '무기';
    grid.appendChild(wTitle);

    for (const key of WEAPON_ORDER) {
      if (!this.ownedWeapons.includes(key)) continue;
      const def = WEAPONS[key];
      const card = document.createElement('div');
      card.className = 'item-card';
      const stat = def.type === 'melee'
        ? `근접 · 데미지 ${def.damage} · ${def.interval}초`
        : `원거리 · 데미지 ${def.damage} · 탄창 ${def.mag}발`;
      card.innerHTML = `<div class="info"><div class="name">${def.name}</div><div class="desc">${stat}</div></div>`;
      const btn = document.createElement('button');
      if (this.equippedWeapon === key) {
        btn.textContent = '장착중';
        btn.className = 'equipped';
      } else {
        btn.textContent = '장착';
        btn.className = 'equip-btn';
        btn.onclick = () => { this.equipWeapon(key); this.renderInventoryUI(); };
      }
      card.appendChild(btn);
      grid.appendChild(card);
    }

    const aTitle = document.createElement('div');
    aTitle.className = 'shop-section-title';
    aTitle.textContent = '방어구';
    grid.appendChild(aTitle);

    if (this.ownedArmors.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'grid-column: 1/-1; opacity: 0.5; font-size: 13px; padding: 8px;';
      empty.textContent = '보유한 방어구가 없습니다';
      grid.appendChild(empty);
    }

    for (const key of ARMOR_ORDER) {
      if (!this.ownedArmors.includes(key)) continue;
      const def = ARMORS[key];
      const equipped = this.equippedBody === key || this.equippedHead === key;
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `<div class="info"><div class="name">${def.name}</div><div class="desc">데미지 감소 ${Math.round(def.reduce * 100)}%</div></div>`;
      const btn = document.createElement('button');
      if (equipped) {
        btn.textContent = '착용중 (해제)';
        btn.className = 'equipped';
      } else {
        btn.textContent = '착용';
        btn.className = 'equip-btn';
      }
      btn.onclick = () => { this.equipArmor(key); this.renderInventoryUI(); };
      card.appendChild(btn);
      grid.appendChild(card);
    }
  }
}
