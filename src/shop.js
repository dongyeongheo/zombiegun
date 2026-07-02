import { WEAPONS, WEAPON_ORDER, ARMORS, ARMOR_ORDER } from './config.js';

export class Shop {
  constructor(inventory) {
    this.inv = inventory;
  }

  render() {
    const grid = document.getElementById('shop-grid');
    grid.innerHTML = '';

    const wTitle = document.createElement('div');
    wTitle.className = 'shop-section-title';
    wTitle.textContent = '무기';
    grid.appendChild(wTitle);

    for (const key of WEAPON_ORDER) {
      const def = WEAPONS[key];
      if (def.price === 0) continue;
      const card = document.createElement('div');
      card.className = 'item-card';
      const stat = def.type === 'melee'
        ? `근접 · 데미지 ${def.damage} · 공격간격 ${def.interval}초`
        : `데미지 ${def.damage} · 탄창 ${def.mag}발 · 재장전 ${def.reload}초`;
      const extra = def.pellets ? ' · 산탄' : def.pierce ? ' · 관통' : def.auto ? ' · 자동연사' : '';
      card.innerHTML = `<div class="info"><div class="name">${def.name}</div><div class="desc">${stat}${extra}</div></div>`;
      const btn = document.createElement('button');
      if (this.inv.ownedWeapons.includes(key)) {
        btn.textContent = '보유중';
        btn.disabled = true;
      } else {
        btn.textContent = `${def.price.toLocaleString()} 코인`;
        btn.disabled = this.inv.coins < def.price;
        btn.onclick = () => {
          if (this.inv.buyWeapon(key)) this.render();
        };
      }
      card.appendChild(btn);
      grid.appendChild(card);
    }

    const aTitle = document.createElement('div');
    aTitle.className = 'shop-section-title';
    aTitle.textContent = '방어구';
    grid.appendChild(aTitle);

    for (const key of ARMOR_ORDER) {
      const def = ARMORS[key];
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `<div class="info"><div class="name">${def.name}</div><div class="desc">데미지 감소 ${Math.round(def.reduce * 100)}%</div></div>`;
      const btn = document.createElement('button');
      if (this.inv.ownedArmors.includes(key)) {
        btn.textContent = '보유중';
        btn.disabled = true;
      } else {
        btn.textContent = `${def.price.toLocaleString()} 코인`;
        btn.disabled = this.inv.coins < def.price;
        btn.onclick = () => {
          if (this.inv.buyArmor(key)) this.render();
        };
      }
      card.appendChild(btn);
      grid.appendChild(card);
    }
  }
}
