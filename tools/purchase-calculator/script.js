import { $, on } from '../../shared/common.js';

function ceil(n) { return Math.ceil(n); }

const BRANCH_MAP = { D: 1, C: 2, B: 3, A: 4, S: 5 };

function parseBranch(str) {
  str = (str || '').trim().toUpperCase();
  if (!str) return null;
  // 支援雙支線如 DD, CC 等
  let total = 0;
  for (const ch of str) {
    if (!BRANCH_MAP[ch]) return null;
    total += BRANCH_MAP[ch];
  }
  // 雙支線 +0.5（DD=1.5, CC=2.5 ...）
  if (str.length === 2 && str[0] === str[1]) total += 0.5;
  return total;
}

// 屬性
function updateAttr() {
  const cur = parseInt($('#attr-current').value) || 0;
  const tgt = parseInt($('#attr-target').value) || 0;
  $('#attr-current-num').value = cur;
  $('#attr-target-num').value = tgt;
  const warn = $('#attr-warn');
  if (tgt <= cur) { warn.hidden = false; $('#attr-result').textContent = '—'; return; }
  warn.hidden = true;
  const mode = $('#attr-mode').value;
  let total = 0;
  for (let i = cur; i < tgt; i++) total += (mode === 'points') ? (i === 0 ? 1 : i) * 200 : (i === 0 ? 1 : i) * 4;
  $('#attr-result').textContent = `需 ${total} ${mode === 'points' ? '分' : 'XP'}`;
}
['attr-current','attr-target','attr-mode'].forEach(id => on($('#'+id), 'input', updateAttr));
['attr-current-num','attr-target-num'].forEach(id => on($('#'+id), 'input', e => {
  const v = Math.max(0, Math.min(99, parseInt(e.target.value) || 0));
  e.target.value = v;
  $('#'+id.replace('-num','')).value = v;
  updateAttr();
}));
updateAttr();

// 技能
function updateSkill() {
  const cur = parseInt($('#skill-current').value) || 0;
  const tgt = parseInt($('#skill-target').value) || 0;
  $('#skill-current-num').value = cur;
  $('#skill-target-num').value = tgt;
  const warn = $('#skill-warn');
  if (tgt <= cur) { warn.hidden = false; $('#skill-result').textContent = '—'; return; }
  warn.hidden = true;
  let total = 0;
  for (let i = cur; i < tgt; i++) {
    if (i === 0) total += 3;
    else if (i === 1) total += 1;
    else total += (i - 1) * 2;
  }
  $('#skill-result').textContent = `需 ${total} XP`;
}
['skill-current','skill-target'].forEach(id => on($('#'+id), 'input', updateSkill));
['skill-current-num','skill-target-num'].forEach(id => on($('#'+id), 'input', e => {
  const v = Math.max(0, Math.min(15, parseInt(e.target.value) || 0));
  e.target.value = v;
  $('#'+id.replace('-num','')).value = v;
  updateSkill();
}));
updateSkill();

// 資源
function updateRes() {
  const branchStr = $('#res-branch').value;
  const branch = parseBranch(branchStr);
  const points = parseInt($('#res-points').value) || 0;
  const warn = $('#res-warn');
  if (branch === null) { warn.hidden = false; $('#res-result').textContent = '轉換成經驗：—'; return; }
  warn.hidden = true;
  const xp = branch * branch * 4 + branch * 6 + points / 400;
  $('#res-result').textContent = `轉換成經驗：${ceil(xp)} XP (支線 ${branchStr.toUpperCase()})`;
}
['res-branch','res-points'].forEach(id => on($('#'+id), 'input', updateRes));
updateRes();

// 專長
function updateFeat() {
  const level = parseInt($('#feat-level').value) || 1;
  const type = $('#feat-type').value;
  const mult = (type === 'team') ? 6 : 3;
  $('#feat-level-num').value = level;
  $('#feat-result').textContent = `需 ${level * mult} XP`;
}
['feat-level','feat-type'].forEach(id => on($('#'+id), 'input', updateFeat));
on($('#feat-level-num'), 'input', e => {
  const v = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
  e.target.value = v;
  $('#feat-level').value = v;
  updateFeat();
});
updateFeat();

// 造物
function updateCraft() {
  const branchStr = $('#craft-branch').value;
  const branch = parseBranch(branchStr);
  const points = parseInt($('#craft-points').value) || 0;
  const warn = $('#craft-warn');
  if (branch === null) { warn.hidden = false; $('#craft-result').textContent = '—'; return; }
  warn.hidden = true;
  const paperPrice = ceil(branch * points / 100);
  const materialPrice = ceil(points / 3);
  const dc = ceil(branch * points / 100);
  $('#craft-result').textContent = `圖紙: ${paperPrice} XP | 材料分數: ${materialPrice} | 製造 DC: ${dc}`;
}
['craft-branch','craft-points'].forEach(id => on($('#'+id), 'input', updateCraft));
// Tab switching
document.querySelectorAll('.tab').forEach(btn => {
  on(btn, 'click', () => {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.hidden = true);
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).hidden = false;
  });
});

// Log
let logEntries = JSON.parse(localStorage.getItem('calc-log') || '[]');

function renderLog() {
  const container = $('#log-list');
  container.innerHTML = '';
  logEntries.forEach((entry, idx) => {
    const div = document.createElement('div');
    div.className = 'item-card';
    div.innerHTML = `<div class="item-row" style="align-items:center;"><div style="flex:1;">${entry}</div><div style="flex:0 0 auto;"><button class="danger" data-del="${idx}">−</button></div></div>`;
    container.appendChild(div);
  });
  container.querySelectorAll('button[data-del]').forEach(btn => {
    on(btn, 'click', e => {
      logEntries.splice(parseInt(e.target.dataset.del), 1);
      localStorage.setItem('calc-log', JSON.stringify(logEntries));
      renderLog();
    });
  });
}

function addLog(text) {
  logEntries.push(text);
  localStorage.setItem('calc-log', JSON.stringify(logEntries));
  renderLog();
}

on($('#attr-log'), 'click', () => addLog('屬性：' + $('#attr-result').textContent));
on($('#skill-log'), 'click', () => addLog('技能：' + $('#skill-result').textContent));
on($('#res-log'), 'click', () => addLog('資源：' + $('#res-result').textContent));
on($('#feat-log'), 'click', () => addLog('專長：' + $('#feat-result').textContent));
on($('#craft-log'), 'click', () => addLog('造物：' + $('#craft-result').textContent));
on($('#log-clear'), 'click', () => {
  if (confirm('確定清除全部紀錄？')) {
    logEntries = [];
    localStorage.setItem('calc-log', JSON.stringify(logEntries));
    renderLog();
  }
});

renderLog();
