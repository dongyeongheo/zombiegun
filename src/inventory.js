import { WEAPONS, WEAPON_ORDER, WEAPON_SHORT, ARMORS, ARMOR_ORDER } from './config.js';

const SAVE_KEY = 'zombiegun_save_v1';

export class Inventory {
  constructor() {
    this.coins = 0;
    this.ownedWeapons = ['axe'];
    this.ownedArmors = [];
    this.equippedWeapon = 'axe';
    this.equippedBody = null;
    this.equippedHead = null;
    this.hotbar = [...WEAPON_ORDER];
    this.onEquipWeapon = null;
    this.swapIdx = null;
    this.isUIOpen = () => false;
    this.load();
    this.initHotbar();
  }

  initHotbar() {
    const bar = document.getElementById('hotbar');
    this.slotEls = [];
    for (let i = 0; i < WEAPON_ORDER.length; i++) {
      const slot = document.createElement('div');
      slot.className = 'hotbar-slot';
      slot.innerHTML = `<span class="num">${i + 1}</span><span class="label"></span>`;
      slot.addEventListener('click', () => this.hotbarClick(i));
      bar.appendChild(slot);
      this.slotEls.push(slot);
    }
    this.renderHotbar();
  }

  hotbarClick(i) {
    if (!this.isUIOpen()) return;
    if (this.swapIdx === null) {
      this.swapIdx = i;
    } else {
      const tmp = this.hotbar[this.swapIdx];
      this.hotbar[this.swapIdx] = this.hotbar[i];
      this.hotbar[i] = tmp;
      this.swapIdx = null;
      this.save();
    }
    this.renderHotbar();
  }

  renderHotbar() {
    for (let i = 0; i < this.slotEls.length; i++) {
      const key = this.hotbar[i];
      const el = this.slotEls[i];
      el.querySelector('.label').textContent = key ? WEAPON_SHORT[key] : '';
      el.classList.toggle('active', key === this.equippedWeapon);
      el.classList.toggle('unowned', !key || !this.ownedWeapons.includes(key));
      el.classList.toggle('swap-src', this.swapIdx === i);
    }
  }

  slotWeapon(i) {
    const key = this.hotbar[i];
    return key && this.ownedWeapons.includes(key) ? key : null;
  }

  cycleSlot(dirSign) {
    const cur = this.hotbar.indexOf(this.equippedWeapon);
    const n = this.hotbar.length;
    for (let step = 1; step <= n; step++) {
      const idx = ((cur + dirSign * step) % n + n) % n;
      const key = this.slotWeapon(idx);
      if (key) { this.equipWeapon(key); return; }
    }
  }

  save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      coins: this.coins,
      ownedWeapons: this.ownedWeapons,
      ownedArmors: this.ownedArmors,
      equippedWeapon: this.equippedWeapon,
      equippedBody: this.equippedBody,
      equippedHead: this.equippedHead,
      hotbar: this.hotbar,
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
      if (Array.isArray(data.hotbar)) {
        this.hotbar = WEAPON_ORDER.map((k, i) =>
          data.hotbar[i] && WEAPONS[data.hotbar[i]] ? data.hotbar[i] : null
        );
        for (const k of WEAPON_ORDER) {
          if (!this.hotbar.includes(k)) {
            const empty = this.hotbar.indexOf(null);
            if (empty >= 0) this.hotbar[empty] = k;
          }
        }
      }
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
    this.renderHotbar();
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
    this.renderHotbar();
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
