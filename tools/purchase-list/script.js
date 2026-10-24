import { $, on } from '../../shared/common.js';

let items = [];

// 轉換規則：3個D=C, 3個C=B, 3個B=A, 3個A=S
const BRANCH_CHAIN = ['D', 'C', 'B', 'A', 'S'];
const BRANCH_VALUE = {};
BRANCH_CHAIN.forEach((b, i) => { BRANCH_VALUE[b] = Math.pow(3, i); });
BRANCH_VALUE['S'] = BRANCH_VALUE['A'] * 3;
['D','C','B','A'].forEach(b => { BRANCH_VALUE[b+b] = BRANCH_VALUE[b] * 2; });
BRANCH_VALUE['SS'] = BRANCH_VALUE['S'] * 2;
BRANCH_VALUE['AAA'] = BRANCH_VALUE['S'];
BRANCH_VALUE['AA'] = BRANCH_VALUE['A'] * 2;

function parseBranchStr(str) {
  str = (str || '').trim().toUpperCase().replace(/\s+/g, '');
  if (!str) return [];
  const result = [];
  let i = 0;
  while (i < str.length) {
    let matched = false;
    for (const len of [3, 2, 1]) {
      const sub = str.slice(i, i + len);
      if (BRANCH_VALUE[sub] !== undefined) {
        result.push(sub);
        i += len;
        matched = true;
        break;
      }
    }
    if (!matched) return null;
  }
  return result;
}

function branchStrToValue(str) {
  const parsed = parseBranchStr(str);
  if (parsed === null) return null;
  return parsed.reduce((sum, b) => sum + BRANCH_VALUE[b], 0);
}

function valueToBranchStr(val) {
  if (val <= 0) return '0';
  const result = [];
  let remaining = val;
  const sVal = BRANCH_VALUE['S'];
  while (remaining >= sVal - 0.001) {
    result.push('S');
    remaining -= sVal;
    if (remaining < 0.001) break;
  }
  const sorted = [...BRANCH_CHAIN].filter(b => b !== 'S').sort((a, b) => BRANCH_VALUE[b] - BRANCH_VALUE[a]);
  for (const b of sorted) {
    const v = BRANCH_VALUE[b];
    while (remaining >= v - 0.001) {
      result.push(b);
      remaining -= v;
      if (remaining < 0.001) break;
    }
    if (remaining < 0.001) break;
  }
  if (remaining > 0.001) {
    const dRem = Math.round(remaining * 10) / 10;
    if (dRem > 0) result.push(`${dRem}D等值`);
  }
  return result.length ? result.join('') : '0';
}

function save() {
  localStorage.setItem('purchase-list', JSON.stringify(items));
  localStorage.setItem('purchase-own', JSON.stringify({
    branch: $('#own-branch').value,
    points: $('#own-points').value,
    xp: $('#own-xp').value,
  }));
}

function load() {
  const saved = localStorage.getItem('purchase-list');
  if (saved) items = JSON.parse(saved);
  const own = localStorage.getItem('purchase-own');
  if (own) {
    const o = JSON.parse(own);
    $('#own-branch').value = o.branch || '';
    $('#own-points').value = o.points || 0;
    $('#own-xp').value = o.xp || 0;
  }
}

function renderItems() {
  const container = $('#items-container');
  container.innerHTML = '';
  items.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-row">
        <div>
          <label>分類</label>
          <input type="text" data-idx="${idx}" data-field="category" value="${item.category || ''}" placeholder="如 屬性">
        </div>
        <div>
          <label>項目</label>
          <input type="text" data-idx="${idx}" data-field="name" value="${item.name || ''}" placeholder="如 力量">
        </div>
        <div>
          <label>購買目標</label>
          <input type="text" data-idx="${idx}" data-field="target" value="${item.target || ''}" placeholder="如 1>5">
        </div>
        <div>
          <label>支線</label>
          <input type="text" data-idx="${idx}" data-field="branch" value="${item.branch || ''}" placeholder="D">
        </div>
        <div>
          <label>分數</label>
          <input type="number" data-idx="${idx}" data-field="points" value="${item.points || 0}" min="0">
        </div>
        <div>
          <label>經驗 (XP)</label>
          <input type="number" data-idx="${idx}" data-field="xp" value="${item.xp || 0}" min="0">
        </div>
        <div style="flex:0 0 auto;">
          <button class="danger" data-remove="${idx}" style="margin-top:1.2rem;">−</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll('input[data-idx]').forEach(inp => {
    on(inp, 'input', e => {
      const idx = parseInt(e.target.dataset.idx);
      const field = e.target.dataset.field;
      items[idx][field] = e.target.value;
      save();
      updateSubtotal();
    });
  });
  container.querySelectorAll('button[data-remove]').forEach(btn => {
    on(btn, 'click', e => {
      items.splice(parseInt(e.target.dataset.remove), 1);
      save();
      renderItems();
      updateSubtotal();
    });
  });
}

function updateSubtotal() {
  let totalBranchVal = 0, totalPoints = 0, totalXp = 0;
  items.forEach(item => {
    const bv = branchStrToValue(item.branch);
    if (bv !== null) totalBranchVal += bv;
    totalPoints += parseInt(item.points) || 0;
    totalXp += parseInt(item.xp) || 0;
  });

  const ownBranchStr = $('#own-branch').value;
  const ownBranchVal = branchStrToValue(ownBranchStr);
  const ownPoints = parseInt($('#own-points').value) || 0;
  const ownXp = parseInt($('#own-xp').value) || 0;

  const remBranchVal = (ownBranchVal !== null) ? ownBranchVal - totalBranchVal : null;
  const remPoints = ownPoints - totalPoints;
  const remXp = ownXp - totalXp;

  // 小計顯示剩餘（擁有 - 預計）
  $('#subtotal-branch').textContent = (remBranchVal !== null)
    ? `${valueToBranchStr(remBranchVal)} (剩餘)`
    : '—';
  $('#subtotal-points').textContent = remPoints;
  $('#subtotal-xp').textContent = remXp;

  // 差額（不足時顯示還缺多少）
  const shortBranch = (remBranchVal !== null && remBranchVal < 0) ? valueToBranchStr(Math.abs(remBranchVal)) : null;
  const shortPoints = remPoints < 0 ? Math.abs(remPoints) : 0;
  const shortXp = remXp < 0 ? Math.abs(remXp) : 0;

  const bal = $('#balance');
  if (remBranchVal !== null && remBranchVal >= 0 && remPoints >= 0 && remXp >= 0) {
    bal.textContent = '餘額充足';
    bal.className = 'note balance-ok';
  } else {
    let msg = '餘額不足，還缺：';
    if (shortBranch) msg += ` 支線 ${shortBranch}`;
    if (shortPoints > 0) msg += ` 分數 ${shortPoints}`;
    if (shortXp > 0) msg += ` XP ${shortXp}`;
    bal.textContent = msg;
    bal.className = 'note balance-bad';
  }
}

on($('#add-item'), 'click', () => {
  items.push({ category: '', name: '', target: '', branch: '', points: 0, xp: 0 });
  save();
  renderItems();
  updateSubtotal();
});

on($('#save'), 'click', () => { save(); alert('已儲存'); });

on($('#clear'), 'click', () => {
  if (confirm('確定清除全部？')) {
    items = [];
    save();
    renderItems();
    updateSubtotal();
  }
});

['own-branch','own-points','own-xp'].forEach(id => on($('#'+id), 'input', () => { save(); updateSubtotal(); }));

load();
renderItems();
updateSubtotal();
