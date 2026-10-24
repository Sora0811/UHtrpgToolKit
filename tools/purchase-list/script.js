import { $, on } from '../../shared/common.js';

let items = [];

// 頧?閬?嚗??=C, 3?=B, 3?=A, 3?=S
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
    if (dRem > 0) result.push(`${dRem}D蝑嬋);
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
          <option value="" ${item.category === '' ? 'selected' : ''}>??/option>
          <option value="撅祆? ${item.category === '撅祆? ? 'selected' : ''}>撅祆?/option>
          <option value="??? ${item.category === '??? ? 'selected' : ''}>???/option>
          <option value="撠" ${item.category === '撠' ? 'selected' : ''}>撠</option>
          <option value="銵蝯? ${item.category === '銵蝯? ? 'selected' : ''}>銵蝯?/option>
          <option value="?寥? ${item.category === '?寥? ? 'selected' : ''}>?寥?/option>
          <option value="?唾?" ${item.category === '?唾?' ? 'selected' : ''}>?唾?</option>
          <option value="靽桃?" ${item.category === '靽桃?' ? 'selected' : ''}>靽桃?</option>
          <option value="擳??? ${item.category === '擳??? ? 'selected' : ''}>擳???/option>
          <option value="蝔梯?" ${item.category === '蝔梯?' ? 'selected' : ''}>蝔梯?</option>
          <option value="?賡?瘙? ${item.category === '?賡?瘙? ? 'selected' : ''}>?賡?瘙?/option>
          <option value="??? ${item.category === '??? ? 'selected' : ''}>???/option>
          <option value="??" ${item.category === '??' ? 'selected' : ''}>??</option>
          <option value="瘜?" ${item.category === '瘜?' ? 'selected' : ''}>瘜?</option>
          <option value="?拙?" ${item.category === '?拙?' ? 'selected' : ''}>?拙?</option>
        </select>
      </td>
      <td><input type="text" data-idx="${idx}" data-field="name" value="${item.name || ''}" placeholder="憒???"></td>
      <td><input type="text" data-idx="${idx}" data-field="target" value="${item.target || ''}" placeholder="憒?1>5"></td>
      <td><input type="text" data-idx="${idx}" data-field="branch" value="${item.branch || ''}" placeholder="D"></td>
      <td><input type="number" data-idx="${idx}" data-field="points" value="${item.points || 0}" min="0"></td>
      <td><input type="number" data-idx="${idx}" data-field="xp" value="${item.xp || 0}" min="0"></td>
      <td><button class="danger" data-remove="${idx}">??/button></td>
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
    $('#subtotal-branch').textContent = valueToBranchStr(Math.abs(remBranchVal)) + ' (蝻箏?)';
  } else if (remBranchVal !== null) {
    $('#subtotal-branch').textContent = valueToBranchStr(remBranchVal) + ' (?拚?)';
  } else {
    $('#subtotal-branch').textContent = '??;
  }
  $('#subtotal-points').textContent = remPoints;
  $('#subtotal-xp').textContent = remXp;

  const shortBranch = (remBranchVal !== null && remBranchVal < 0) ? valueToBranchStr(Math.abs(remBranchVal)) : null;
  const shortPoints = remPoints < 0 ? Math.abs(remPoints) : 0;
  const shortXp = remXp < 0 ? Math.abs(remXp) : 0;

  const bal = $('#balance');
  if (remBranchVal !== null && remBranchVal >= 0 && remPoints >= 0 && remXp >= 0) {
    bal.textContent = '擗??雲';
    bal.className = 'note';
  } else {
    let msg = '擗?銝雲嚗?蝻綽?';
    if (shortBranch) msg += ` ?舐? ${shortBranch}`;
    if (shortPoints > 0) msg += ` ? ${shortPoints}`;
    if (shortXp > 0) msg += ` XP ${shortXp}`;
    bal.textContent = msg;
    bal.className = 'note';
  }
}

function saveBranch() {
  try {
    const name = $('#branch-name').value.trim();
    if (!name) { alert('隢撓?亙??臬?蝔?); return; }
    const branches = JSON.parse(localStorage.getItem('purchase-branches') || '{}');
    branches[name] = JSON.parse(JSON.stringify(items));
    localStorage.setItem('purchase-branches', JSON.stringify(branches));
    $('#branch-name').value = '';
    renderBranches();
    alert('撌脣摮??胯? + name + '??);
  } catch (e) {
    alert('?脣?憭望?嚗? + e.message);
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
            <strong>${name}</strong> (${branchItems.length} ??<br>
            <span class="note">???臬嚗蝺?${valueToBranchStr(totalBranchVal)}????${totalPoints}?P ${totalXp}</span>
          </div>
          <div style="flex:0 0 auto;">
            <button class="secondary" data-load="${name}">頛</button>
            <button class="danger" data-del="${name}">??/button>
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
        if (confirm('?芷??? + name + '??')) {
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
  let text = '????蝺?' + ownBranch + ' ?:' + ownPoints + ' XP:' + ownXp + '\n\n??閮頃鞎琿??柴n';
  items.forEach((item, i) => {
    text += (i+1) + '. [' + (item.category || '??) + '] ' + (item.name || '??) + ' ?格?:' + (item.target || '??) + ' ?舐?:' + (item.branch || '??) + ' ?:' + (item.points || 0) + ' XP:' + (item.xp || 0) + '\n';
  });
  const bv = branchStrToValue(ownBranch);
  let totalBranchVal = 0, totalPoints = 0, totalXp = 0;
  items.forEach(item => {
    const v = branchStrToValue(item.branch);
    if (v !== null) totalBranchVal += v;
    totalPoints += parseInt(item.points) || 0;
    totalXp += parseInt(item.xp) || 0;
  });
  text += '\n??閮擗蝺?' + valueToBranchStr((bv||0)-totalBranchVal) + ' ?:' + ((parseInt(ownPoints)||0)-totalPoints) + ' XP:' + ((parseInt(ownXp)||0)-totalXp);
  try {
    await navigator.clipboard.writeText(text);
    alert('撌脰?鋆賢?芾票蝪?);
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    alert('撌脰?鋆賢?芾票蝪?);
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
on($('#save'), 'click', () => { save(); alert('撌脣摮?); });
on($('#clear'), 'click', () => {
  if (confirm('蝣箏?皜?券嚗?)) {
    items = [];
    save();
    renderItems();
    updateSubtotal();
  }
});

['own-branch','own-points','own-xp'].forEach(id => on($('#'+id), 'input', () => { save(); updateSubtotal(); }));

load();
try {
  load();
  renderItems();
  updateSubtotal();
  renderBranches();
} catch (e) {
  console.error('Init error:', e);
}

on($('#add-item'), 'click', () => {
  try {
    items.push({ category: '', name: '', target: '', branch: '', points: 0, xp: 0 });
    save();
    renderItems();
    updateSubtotal();
  } catch (e) {
    console.error('Add item error:', e);
  }
});
