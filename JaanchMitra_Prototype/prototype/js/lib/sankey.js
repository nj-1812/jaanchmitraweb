/*
 * Sankey flow of the victim's money: built only from the allocation (FIFO or LIFO) — no new figures.
 * Every rupee that left the victim ends in exactly one of three places:
 *   cash  — withdrawn as cash (from the statements)
 *   held  — estimated still in an account (analytical estimate, not a recovery guarantee)
 *   unres — reached an account whose statement is not available (unresolved)
 * buildSankey() makes the model; layoutSankey() places it in a box. Both are deterministic.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.JM = Object.assign(root.JM || {}, factory());
})(typeof self !== 'undefined' ? self : this, function () {

  const SINKS = ['cash', 'held', 'unres'];

  function buildSankey(data, trail, alloc) {
    const share = alloc.victimShare, per = alloc.perAccount;
    const victim = trail.rootTxn.from;
    const nodes = new Map(); const links = [];
    const addNode = (id, kind, level) => { if (!nodes.has(id)) nodes.set(id, { id, kind, level, in: 0, out: 0 }); return nodes.get(id); };
    const unresolvedIds = new Set(trail.unresolved.map(u => u.account));
    addNode(victim, 'victim', 0);

    // Money moved between accounts (only the victim's share; zero-share transfers are not drawn).
    trail.edges.forEach(e => {
      const v = share[e.txn.id] || 0; if (v <= 0) return;
      addNode(e.txn.from, 'account', trail.levels[e.txn.from]);
      addNode(e.txn.to, unresolvedIds.has(e.txn.to) ? 'unresolvedAcct' : 'account', trail.levels[e.txn.to]);
      links.push({ id: e.txn.id, source: e.txn.from, target: e.txn.to, value: v, kind: 'transfer', cls: e.link.cls, txnIds: [e.txn.id] });
    });
    // Cash withdrawals, grouped per account.
    const cashBy = {};
    trail.cashOuts.forEach(c => { const v = share[c.txn.id] || 0; if (v <= 0) return; (cashBy[c.account] = cashBy[c.account] || { v: 0, ids: [] }); cashBy[c.account].v += v; cashBy[c.account].ids.push(c.txn.id); });
    Object.keys(cashBy).forEach(a => links.push({ id: 'cash:' + a, source: a, target: 'cash', value: cashBy[a].v, kind: 'cash', cls: 'confirmed', txnIds: cashBy[a].ids }));
    // Estimated still in an account.
    Object.keys(per).forEach(a => { if (per[a].estTraceable > 0 && nodes.has(a)) links.push({ id: 'held:' + a, source: a, target: 'held', value: per[a].estTraceable, kind: 'held', cls: 'estimate', txnIds: [] }); });
    // Unresolved: everything that reached an account without a statement.
    unresolvedIds.forEach(a => { const v = per[a] ? per[a].victimAttributed : 0; if (v > 0) links.push({ id: 'unres:' + a, source: a, target: 'unres', value: v, kind: 'unres', cls: 'unresolved', txnIds: [] }); });

    const maxLevel = Math.max.apply(null, Array.from(nodes.values()).map(n => n.level));
    SINKS.forEach(s => addNode(s, 'sink', maxLevel + 1));
    links.forEach(l => { nodes.get(l.source).out += l.value; nodes.get(l.target).in += l.value; });
    nodes.forEach(n => { n.value = Math.max(n.in, n.out); });
    // Keep only sinks that receive money.
    SINKS.forEach(s => { if (nodes.get(s).in === 0) nodes.delete(s); });

    // Conservation check per account: what came in = what went on + cash + held + unresolved (to the rupee).
    const imbalance = [];
    nodes.forEach(n => { if (n.kind === 'account' && Math.abs(n.in - n.out) > 0.5) imbalance.push({ id: n.id, in: n.in, out: n.out }); });
    const sinkTotal = SINKS.reduce((s, k) => s + (nodes.has(k) ? nodes.get(k).in : 0), 0);
    return { nodes: Array.from(nodes.values()), links, columns: maxLevel + 2, victim, victimLoss: alloc.totals.victimLoss, sinkTotal, imbalance };
  }

  // Place nodes in columns (depth = hop level) and stack bands. Box is width x height; labels need `labelRoom` on the right.
  function layoutSankey(model, opts) {
    const o = Object.assign({ width: 900, height: 480, nodeW: 14, gap: 16, padTop: 14, padBottom: 14, padLeft: 8, labelRoom: 150 }, opts || {});
    const cols = []; for (let i = 0; i < model.columns; i++) cols.push([]);
    model.nodes.forEach(n => cols[n.level].push(n));
    const maxCount = Math.max.apply(null, cols.map(c => c.length));
    const maxTotal = Math.max.apply(null, cols.map(c => c.reduce((s, n) => s + n.value, 0)));
    const usable = o.height - o.padTop - o.padBottom - o.gap * (maxCount - 1);
    const k = usable / maxTotal; // pixels per rupee (same in every column, so widths compare honestly)
    const span = o.width - o.padLeft - o.labelRoom - o.nodeW;
    const byId = {}; model.nodes.forEach(n => { byId[n.id] = n; });
    const incoming = id => model.links.filter(l => l.target === id);
    const center = n => n.y + n.h / 2;
    cols.forEach((col, ci) => {
      // Order: sinks fixed (cash, held, unresolved); others by the weighted centre of where their money came from.
      if (ci === model.columns - 1) col.sort((a, b) => SINKS.indexOf(a.id) - SINKS.indexOf(b.id));
      else if (ci > 0) col.sort((a, b) => bary(a) - bary(b) || (a.id < b.id ? -1 : 1));
      function bary(n) { const inc = incoming(n.id); const tot = inc.reduce((s, l) => s + l.value, 0) || 1; return inc.reduce((s, l) => s + center(byId[l.source]) * l.value, 0) / tot; }
      const total = col.reduce((s, n) => s + n.value * k, 0) + o.gap * (col.length - 1);
      let y = o.padTop + (o.height - o.padTop - o.padBottom - total) / 2;
      col.forEach(n => { n.x = o.padLeft + (model.columns === 1 ? 0 : span * ci / (model.columns - 1)); n.y = y; n.h = Math.max(2, n.value * k); n.w = o.nodeW; y += n.h + o.gap; });
    });
    // Stack bands at each end, ordered by the other end's position to reduce crossings.
    const outOff = {}, inOff = {};
    model.nodes.forEach(n => { outOff[n.id] = n.y; inOff[n.id] = n.y; });
    const order = model.links.slice().sort((a, b) => center(byId[a.target]) - center(byId[b.target]));
    order.forEach(l => { const s = byId[l.source]; l.sy = outOff[l.source]; l.th = l.value * k; outOff[l.source] += l.th; l.sx = s.x + s.w; });
    model.links.slice().sort((a, b) => center(byId[a.source]) - center(byId[b.source])).forEach(l => { const t = byId[l.target]; l.ty = inOff[l.target]; inOff[l.target] += l.value * k; l.tx = t.x; });
    model.links.forEach(l => {
      const mx = (l.sx + l.tx) / 2;
      l.path = 'M' + r(l.sx) + ',' + r(l.sy) + ' C' + r(mx) + ',' + r(l.sy) + ' ' + r(mx) + ',' + r(l.ty) + ' ' + r(l.tx) + ',' + r(l.ty) +
        ' L' + r(l.tx) + ',' + r(l.ty + l.th) + ' C' + r(mx) + ',' + r(l.ty + l.th) + ' ' + r(mx) + ',' + r(l.sy + l.th) + ' ' + r(l.sx) + ',' + r(l.sy + l.th) + ' Z';
    });
    return { k, width: o.width, height: o.height };
  }
  const r = v => Math.round(v * 10) / 10;

  return { buildSankey, layoutSankey, SANKEY_SINKS: SINKS };
});
