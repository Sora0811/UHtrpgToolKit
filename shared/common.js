// Shared helpers for UH TRPG Tool Library tools.
// Keep minimal; add only when reuse is real.
export function $(sel, root = document) { return root.querySelector(sel); }
export function $all(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }
export function on(el, ev, fn) { if (el) el.addEventListener(ev, fn); }
export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
