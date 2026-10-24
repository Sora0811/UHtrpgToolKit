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
  try {
    const saved = localStorage.getItem('purchase-list');
    if (saved) items = JSON.parse(saved) || [];
  } catch (e) {
    items = [];
    localStorage.removeItem('purchase-list');
  }
  try {
    const own = localStorage.getItem('purchase-own');
    if (own) {
      const o = JSON.parse(own);
      $('#own-branch').value = o.branch || '';
      $('#own-points').value = o.points || 0;
      $('#own-xp').value = o.xp || 0;
    }
  } catch (e) {
    localStorage.removeItem('purchase-own');
  }
}

function renderItems() {
  const tbody = $('#items-body');
  tbody.innerHTML = '';
  items.forEach((item, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <select data-idx="${idx}" data-field="category">
          <option value="" ${item.category === '' ? 'selected' : ''}>—</option>
          <option value="屬性" ${item.category === '屬性' ? 'selected' : ''}>屬性</option>
          <option value="技能" ${item.category === '技能' ? 'selected' : ''}>技能</option>
          <option value="專長" ${item.category === '專長' ? 'selected' : ''}>專長</option>
          <option value="血統" ${item.category === '血統' ? 'selected' : ''}>血統</option>
          <option value="改造" ${item.category === '改造' ? 'selected' : ''}>改造</option>
          <option value="瞳術" ${item.category === '瞳術' ? 'selected' : ''}>瞳術</option>
          <option value="修真" ${item.category === '修真' ? 'selected' : ''}>修真</option>
          <option value="魔導書" ${item.category === '魔導書' ? 'selected' : ''}>魔導書</option>
          <option value="稱號" ${item.category === '稱號' ? 'selected' : ''}>稱號</option>
          <option value="能量池" ${item.category === '能量池' ? 'selected' : ''}>能量池</option>
          <option value="技藝" ${item.category === '技藝' ? 'selected' : ''}>技藝</option>
          <option value="招式" ${item.category === '招式' ? 'selected' : ''}>招式</option>
          <option value="法術" ${item.category === '法術' ? 'selected' : ''}>法術</option>
          <option value="物品" ${item.category === '物品' ? 'selected' : ''}>物品</option>
        </select>
      </td>
      <td><input type="text" data-idx="${idx}" data-field="name" value="${item.name || ''}" placeholder="如 力量"></td>
      <td><input type="text" data-idx="${idx}" data-field="target" value="${item.target || ''}" placeholder="如 1>5"></td>
      <td><input type="text" data-idx="${idx}" data-field="branch" value="${item.branch || ''}" placeholder="D"></td>
      <td><input type="number" data-idx="${idx}" data-field="points" value="${item.points || 0}" min="0"></td>
      <td><input type="number" data-idx="${idx}" data-field="xp" value="${item.xp || 0}" min="0"></td>
      <td><button class="danger" data-remove="${idx}">−</button></td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('input[data-idx], select[data-idx]').forEach(inp => {
    on(inp, inp.tagName === 'SELECT' ? 'change' : 'input', e => {
      const idx = parseInt(e.target.dataset.idx);
      const field = e.target.dataset.field;
      items[idx][field] = e.target.value;
      save();
      updateSubtotal();
    });
  });
  tbody.querySelectorAll('button[data-remove]').forEach(btn => {
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

  if (remBranchVal !== null && remBranchVal < 0) {
    $('#subtotal-branch').textContent = valueToBranchStr(Math.abs(remBranchVal)) + ' (缺少)';
  } else if (remBranchVal !== null) {
    $('#subtotal-branch').textContent = valueToBranchStr(remBranchVal) + ' (剩餘)';
  } else {
    $('#subtotal-branch').textContent = '—';
  }
  $('#subtotal-points').textContent = remPoints;
  $('#subtotal-xp').textContent = remXp;

  const shortBranch = (remBranchVal !== null && remBranchVal < 0) ? valueToBranchStr(Math.abs(remBranchVal)) : null;
  const shortPoints = remPoints < 0 ? Math.abs(remPoints) : 0;
  const shortXp = remXp < 0 ? Math.abs(remXp) : 0;

  const bal = $('#balance');
  if (remBranchVal !== null && remBranchVal >= 0 && remPoints >= 0 && remXp >= 0) {
    bal.textContent = '餘額充足';
    bal.className = 'note';
  } else {
    let msg = '餘額不足，還缺：';
    if (shortBranch) msg += ` 支線 ${shortBranch}`;
    if (shortPoints > 0) msg += ` 分數 ${shortPoints}`;
    if (shortXp > 0) msg += ` XP ${shortXp}`;
    bal.textContent = msg;
    bal.className = 'note';
  }
}

function saveBranch() {
  try {
    const name = $('#branch-name').value.trim();
    if (!name) { alert('請輸入分支名稱'); return; }
    const branches = JSON.parse(localStorage.getItem('purchase-branches') || '{}');
    branches[name] = JSON.parse(JSON.stringify(items));
    localStorage.setItem('purchase-branches', JSON.stringify(branches));
    $('#branch-name').value = '';
    renderBranches();
    alert('已儲存分支「' + name + '」');
  } catch (e) {
    alert('儲存失敗：' + e.message);
    console.error(e);
  }
}

function renderBranches() {
  try {
    const branches = JSON.parse(localStorage.getItem('purchase-branches') || '{}');
    const container = $('#branches-list');
    if (!container) return;
    container.innerHTML = '';
    Object.keys(branches).forEach(name => {
      const branchItems = branches[name] || [];
      let totalBranchVal = 0, totalPoints = 0, totalXp = 0;
      branchItems.forEach(item => {
        const bv = branchStrToValue(item.branch);
        if (bv !== null) totalBranchVal += bv;
        totalPoints += parseInt(item.points) || 0;
        totalXp += parseInt(item.xp) || 0;
      });
      const div = document.createElement('div');
      div.className = 'item-card';
      div.innerHTML = `
        <div class="item-row" style="align-items:center;">
          <div style="flex:1;">
            <strong>${name}</strong> (${branchItems.length} 項)<br>
            <span class="note">預計支出：支線 ${valueToBranchStr(totalBranchVal)}、分數 ${totalPoints}、XP ${totalXp}</span>
          </div>
          <div style="flex:0 0 auto;">
            <button class="secondary" data-load="${name}">載入</button>
            <button class="danger" data-del="${name}">−</button>
          </div>
        </div>
      `;
      container.appendChild(div);
    });
    container.querySelectorAll('button[data-load]').forEach(btn => {
      on(btn, 'click', e => {
        const name = e.target.dataset.load;
        const branches = JSON.parse(localStorage.getItem('purchase-branches') || '{}');
        items = JSON.parse(JSON.stringify(branches[name]));
        save();
        renderItems();
        updateSubtotal();
        document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.hidden = true);
        document.querySelector('.tab[data-tab="list"]').classList.add('active');
        document.getElementById('list').hidden = false;
      });
    });
    container.querySelectorAll('button[data-del]').forEach(btn => {
      on(btn, 'click', e => {
        const name = e.target.dataset.del;
        if (confirm('刪除分支「' + name + '」？')) {
          const branches = JSON.parse(localStorage.getItem('purchase-branches') || '{}');
          delete branches[name];
          localStorage.setItem('purchase-branches', JSON.stringify(branches));
          renderBranches();
        }
      });
    });
  } catch (e) {
    console.error('renderBranches error:', e);
  }
}

on($('#copy-clipboard'), 'click', async () => {
  const ownBranch = $('#own-branch').value;
  const ownPoints = $('#own-points').value;
  const ownXp = $('#own-xp').value;
  let text = '【目前擁有】支線:' + ownBranch + ' 分數:' + ownPoints + ' XP:' + ownXp + '\n\n【預計購買項目】\n';
  items.forEach((item, i) => {
    text += (i+1) + '. [' + (item.category || '—') + '] ' + (item.name || '—') + ' 目標:' + (item.target || '—') + ' 支線:' + (item.branch || '—') + ' 分數:' + (item.points || 0) + ' XP:' + (item.xp || 0) + '\n';
  });
  const bv = branchStrToValue(ownBranch);
  let totalBranchVal = 0, totalPoints = 0, totalXp = 0;
  items.forEach(item => {
    const v = branchStrToValue(item.branch);
    if (v !== null) totalBranchVal += v;
    totalPoints += parseInt(item.points) || 0;
    totalXp += parseInt(item.xp) || 0;
  });
  text += '\n【小計】剩餘支線:' + valueToBranchStr((bv||0)-totalBranchVal) + ' 分數:' + ((parseInt(ownPoints)||0)-totalPoints) + ' XP:' + ((parseInt(ownXp)||0)-totalXp);
  try {
    await navigator.clipboard.writeText(text);
    alert('已複製到剪貼簿');
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    alert('已複製到剪貼簿');
  }
});

on($('#add-item'), 'click', () => {
  items.push({ category: '', name: '', target: '', branch: '', points: 0, xp: 0 });
  save();
  renderItems();
  updateSubtotal();
});

document.querySelectorAll('.tab').forEach(btn => {
  on(btn, 'click', () => {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.hidden = true);
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).hidden = false;
  });
});

on($('#save-branch'), 'click', saveBranch);
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
renderBranches();
