import { WEAPONS, PLAYER } from './config.js';

export class HUD {
  constructor() {
    this.hpBar = document.getElementById('hp-bar');
    this.hpNum = document.getElementById('hp-num');
    this.coinCount = document.getElementById('coin-count');
    this.weaponName = document.getElementById('weapon-name');
    this.ammoDisplay = document.getElementById('ammo-display');
    this.reloadWrap = document.getElementById('reload-wrap');
    this.reloadBar = document.getElementById('reload-bar');
    this.armorLabel = document.getElementById('armor-label');
    this.killFeed = document.getElementById('kill-feed');
    this.interactHint = document.getElementById('interact-hint');
    this.compassArrow = document.getElementById('compass-arrow');
    this.compassLabel = document.getElementById('compass-label');
  }

  updateCompass(player, gateX, gateZ, insideSafe) {
    const dx = gateX - player.pos.x;
    const dz = gateZ - player.pos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const bearing = Math.atan2(dx, dz);
    const facing = player.yaw + Math.PI;
    let rel = bearing - facing;
    while (rel > Math.PI) rel -= Math.PI * 2;
    while (rel < -Math.PI) rel += Math.PI * 2;
    this.compassArrow.style.transform = `rotate(${-rel * 180 / Math.PI}deg)`;
    this.compassLabel.textContent = insideSafe ? '안전구역 내부' : `안전구역 입구 ${Math.round(dist)}m`;
  }

  update(player, inv, weapons) {
    this.hpBar.style.width = `${(player.hp / PLAYER.maxHp) * 100}%`;
    this.hpNum.textContent = Math.ceil(player.hp);
    this.coinCount.textContent = inv.coins.toLocaleString();
    this.armorLabel.textContent = `방어 ${Math.round(inv.armorReduction * 100)}%`;

    const def = WEAPONS[weapons.current];
    this.weaponName.textContent = def.name;
    if (def.type === 'melee') {
      this.ammoDisplay.innerHTML = '<span class="mag">—</span>';
    } else {
      this.ammoDisplay.innerHTML = `<span class="mag">${weapons.mag}</span> <span class="inf">/ ${def.mag}</span>`;
    }

    if (weapons.reloading) {
      this.reloadWrap.style.display = 'block';
      const pct = Math.min(100, (weapons.reloadTimer / def.reload) * 100);
      this.reloadBar.style.width = `${pct}%`;
    } else {
      this.reloadWrap.style.display = 'none';
    }
  }

  killMessage(name, coins) {
    const el = document.createElement('div');
    el.className = 'kill-msg';
    el.textContent = `${name} 처치 +${coins} 코인`;
    this.killFeed.appendChild(el);
    setTimeout(() => el.remove(), 2600);
    while (this.killFeed.children.length > 6) this.killFeed.firstChild.remove();
  }

  showHint(text) {
    this.interactHint.innerHTML = text;
    this.interactHint.style.display = 'block';
  }

  hideHint() {
    this.interactHint.style.display = 'none';
  }
}
