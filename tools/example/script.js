import { $, on, escapeHtml } from '../../shared/common.js';

const input = $('#input');
const out = $('#out');
on($('#go'), 'click', () => {
  const v = input.value.trim();
  out.textContent = v ? `You typed: ${escapeHtml(v)}` : 'Nothing typed.';
});
