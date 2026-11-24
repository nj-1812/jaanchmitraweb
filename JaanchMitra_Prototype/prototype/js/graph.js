/*
 * Graph rendering (Cytoscape.js). One case analysis -> different views.
 * Positions are computed deterministically (no random layouts), so the picture is the same every time.
 * Meaning is never carried by colour alone: every node has a shape, an icon and a text label;
 * every link has a line style and a text label.
 */
(function (root) {
  const { t } = root.JMI18N;
  const { accountRole, roleLabel } = root.JMShell;
  const { formatINR, istShortTime } = root.JM;

  function svgIcon(path) {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>');
  }
  const ICONS = {
    victim: svgIcon('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>'),
    account: svgIcon('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>'),
    cashout: svgIcon('<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 9v6M18 9v6"/>'),
    unresolved: svgIcon('<path d="M9 9a3 3 0 1 1 4 2.8c-.7.3-1 .9-1 1.7V15"/><circle cx="12" cy="18.5" r=".6"/>'),
    vpa: svgIcon('<circle cx="12" cy="12" r="4"/><path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.5 7.1"/>'),
    website: svgIcon('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><circle cx="7" cy="6.5" r=".6"/>'),
    domain: svgIcon('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>'),
    server: svgIcon('<rect x="4" y="4" width="16" height="7" rx="1.5"/><rect x="4" y="13" width="16" height="7" rx="1.5"/><path d="M8 7.5h.01M8 16.5h.01"/>')
  };
  const ROLE_ICON = { victim: 'victim', mule: 'account', onTrail: 'account', cashout: 'cashout', unresolved: 'unresolved' };

  function trailNodeOrder(A) {
    const byLevel = {};
    const seen = {};
    function add(id) { if (seen[id]) return; seen[id] = true; const l = A.trail.levels[id]; (byLevel[l] = byLevel[l] || []).push(id); }
    add(A.trail.rootTxn.from);
    A.trail.edges.forEach(e => { add(e.txn.from); add(e.txn.to); });
    return byLevel;
  }

  function layeredPositions(A, colW, rowH) {
    const byLevel = trailNodeOrder(A);
    const pos = {};
    Object.keys(byLevel).forEach(l => {
      const ids = byLevel[l];
      ids.forEach((id, i) => { pos[id] = { x: Number(l) * colW, y: (i - (ids.length - 1) / 2) * rowH }; });
    });
    return pos;
  }

  function accountNodes(A, method, compact, pos) {
    const alloc = A.alloc[method].perAccount;
    return Object.keys(pos).map(id => {
      const role = accountRole(A, id);
      const acct = A.trail.accountsById[id];
      const lines = [acct.masked, roleLabel(role)];
      if (role === 'cashout') {
        const cash = A.trail.cashOuts.filter(c => c.account === id).reduce((s, c) => s + c.txn.amount, 0);
        lines.push(t('cashShort') + ' ' + formatINR(cash));
      } else if (alloc[id] && alloc[id].estTraceable > 0) {
        lines.push(t('estShort') + ' ' + formatINR(alloc[id].estTraceable));
      }
      return { group: 'nodes', data: { id, label: lines.join('\n'), role, icon: ICONS[ROLE_ICON[role]], level: A.trail.levels[id], kind: 'account' },
        position: pos[id], classes: role };
    });
  }

  function moneyEdges(A, compact) {
    const max = Math.max.apply(null, A.trail.edges.map(e => e.txn.amount));
    return A.trail.edges.map(e => ({ group: 'edges', classes: e.link.cls,
      data: { id: e.txn.id, source: e.txn.from, target: e.txn.to, cls: e.link.cls, kind: 'money',
        label: formatINR(e.txn.amount) + (compact ? '' : ' · ' + istShortTime(e.txn.time)),
        width: 1.5 + 4.5 * (e.txn.amount / max) } }));
  }

  function elementsFor(A, mode, method, compact) {
    const colW = compact ? 165 : 205;
    const rowH = compact ? 118 : 132;
    const pos = layeredPositions(A, colW, rowH);
    const els = accountNodes(A, method, compact, pos).concat(moneyEdges(A, compact));
    if (mode !== 'relationship') return els;

    // Relationship view: add the digital trail, placed above the account it connects to.
    const d = A.data.digital;
    const m = A.match.matches[0];
    if (!m) return els;
    const anchor = pos[m.account];
    const top = Math.min.apply(null, Object.values(pos).map(p => p.y)) - 150;
    const vpaId = 'vpa:' + root.JM.normVpa(m.accountValue);
    const add = (id, label, icon, x, y, cls) => els.push({ group: 'nodes', data: { id, label, icon, kind: cls }, position: { x, y }, classes: 'digital ' + cls });
    add(vpaId, 'UPI ID\n' + m.accountValue, ICONS.vpa, anchor.x, top + 40, 'vpa');
    add('website', t('nodeWebsite') + '\n' + d.websiteEvidence.file, ICONS.website, anchor.x + colW, top - 40, 'website');
    add('domain', t('nodeDomain') + '\n' + d.domain.name, ICONS.domain, anchor.x + colW * 2, top - 40, 'domain');
    add('ip', t('nodeIp') + '\n' + d.ip.address + '\n' + d.ip.asn, ICONS.server, anchor.x + colW * 3, top - 40, 'ip');
    add('ns', 'NS\n' + d.domain.nameservers[0], ICONS.server, anchor.x + colW * 2, top - 170, 'ns');
    const edge = (id, s, tg, label, cls) => els.push({ group: 'edges', classes: cls, data: { id, source: s, target: tg, label, kind: 'link', cls, width: 2 } });
    edge('L-acct-vpa', m.account, vpaId, 'VPA · ' + t('linkStrong'), 'strong');
    edge('L-web-vpa', 'website', vpaId, t('linkStrong') + ' · ' + t('onScreenshot'), 'strong');
    edge('L-web-domain', 'website', 'domain', t('siteLabel'), 'infra');
    edge('L-domain-ip', 'domain', 'ip', 'DNS · ' + t('observed') + ' ' + root.JM.istDate(d.dns[0].observedAt), 'infra');
    edge('L-domain-ns', 'domain', 'ns', 'NS', 'infra');
    return els;
  }

  function style(compact) {
    const fs = compact ? 12 : 12.5;
    return [
      { selector: 'node', style: { 'width': compact ? 40 : 48, 'height': compact ? 40 : 48, 'background-color': '#475569',
        'background-image': 'data(icon)', 'background-width': '55%', 'background-height': '55%',
        'label': 'data(label)', 'text-wrap': 'wrap', 'text-valign': 'bottom', 'text-margin-y': 5, 'font-size': fs,
        'font-family': 'Noto Sans, Noto Sans Devanagari, Nirmala UI, Segoe UI, Arial, sans-serif', 'color': '#0f172a',
        'text-background-color': '#ffffff', 'text-background-opacity': 0.9, 'text-background-padding': 2, 'text-background-shape': 'roundrectangle',
        'border-width': 2, 'border-color': '#ffffff' } },
      { selector: 'node.victim', style: { 'shape': 'ellipse', 'background-color': '#1d4ed8' } },
      { selector: 'node.mule', style: { 'shape': 'round-rectangle', 'background-color': '#b91c1c' } },
      { selector: 'node.onTrail', style: { 'shape': 'round-rectangle', 'background-color': '#b45309' } },
      { selector: 'node.cashout', style: { 'shape': 'hexagon', 'background-color': '#334155' } },
      { selector: 'node.unresolved', style: { 'shape': 'diamond', 'background-color': '#94a3b8', 'border-style': 'dashed', 'border-color': '#334155' } },
      { selector: 'node.digital', style: { 'shape': 'round-rectangle', 'background-color': '#0f766e' } },
      { selector: 'node.ip, node.ns', style: { 'background-color': '#64748b' } },
      { selector: 'edge', style: { 'curve-style': 'bezier', 'target-arrow-shape': 'triangle', 'arrow-scale': 1.1,
        'width': 'data(width)', 'line-color': '#1e293b', 'target-arrow-color': '#1e293b', 'label': 'data(label)',
        'font-size': compact ? 11.5 : 11.5, 'color': '#0f172a', 'text-background-color': '#f8fafc', 'text-background-opacity': 1,
        'text-background-padding': 2, 'text-border-width': 1, 'text-border-color': '#cbd5e1', 'text-border-opacity': 1,
        'font-family': 'Noto Sans, Noto Sans Devanagari, Nirmala UI, Segoe UI, Arial, sans-serif' } },
      { selector: 'edge.probable', style: { 'line-style': 'dashed', 'line-dash-pattern': [8, 5], 'line-color': '#475569', 'target-arrow-color': '#475569' } },
      { selector: 'edge.unresolved', style: { 'line-style': 'dotted', 'line-color': '#64748b', 'target-arrow-color': '#64748b' } },
      { selector: 'edge.strong', style: { 'width': 3.5, 'line-color': '#0f766e', 'target-arrow-color': '#0f766e', 'target-arrow-shape': 'none' } },
      { selector: 'edge.infra', style: { 'width': 1.5, 'line-color': '#94a3b8', 'target-arrow-color': '#94a3b8' } },
      { selector: '.faded', style: { 'opacity': 0.15 } },
      { selector: '.hl-dim', style: { 'opacity': 0.18 } },
      { selector: 'edge.hl-path', style: { 'line-color': '#0d9488', 'target-arrow-color': '#0d9488', 'z-index': 9 } },
      { selector: 'node.hl-path', style: { 'border-color': '#0d9488', 'border-width': 3 } },
      { selector: 'node.kbd', style: { 'border-color': '#f59e0b', 'border-width': 5 } },
      { selector: 'node.coin', style: { 'width': 16, 'height': 16, 'shape': 'ellipse', 'background-color': '#f59e0b', 'background-image': 'none', 'border-width': 2,
        'border-color': '#92400e', 'label': '₹', 'text-valign': 'center', 'text-margin-y': 0, 'font-size': 10, 'font-weight': 800, 'color': '#451a03',
        'text-background-opacity': 0, 'events': 'no', 'z-index': 20 } },
      { selector: ':selected, .focus', style: { 'border-width': 4, 'border-color': '#0d9488', 'line-color': '#0d9488', 'target-arrow-color': '#0d9488' } }
    ];
  }

  function render(container, A, opts) {
    const o = Object.assign({ mode: 'layered', method: 'FIFO', compact: false, onSelect: null }, opts || {});
    const cy = root.cytoscape({
      container, elements: elementsFor(A, o.mode, o.method, o.compact), style: style(o.compact),
      layout: { name: 'preset', fit: true, padding: o.compact ? 42 : 46 },
      minZoom: 0.3, maxZoom: 2.5, boxSelectionEnabled: false, autoungrabify: true
    });
    // Canvas labels are measured once; redraw them after the bundled Noto fonts finish loading.
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { if (!cy.destroyed()) cy.style().update(); });
    }
    container.__cy = cy; // lets automated checks inspect the drawn graph
    cy.nodes().forEach(n => n.scratch('_orig', { x: n.position('x'), y: n.position('y') }));
    if (!o.compact) cy.autoungrabify(false); // drag accounts to untangle; the reset button restores the computed layout
    // Tall, narrow boxes (phones held upright): draw the trail top-to-bottom instead of left-to-right so labels stay readable.
    function orient() {
      const portrait = container.clientHeight > container.clientWidth * 1.15;
      if (portrait === cy.scratch('_portrait')) return false;
      cy.scratch('_portrait', portrait);
      cy.batch(() => cy.nodes().forEach(n => {
        let p0 = n.scratch('_orig'); if (!p0) { p0 = { x: n.position('x'), y: n.position('y') }; n.scratch('_orig', p0); }
        n.position(portrait ? { x: p0.y, y: p0.x } : { x: p0.x, y: p0.y });
      }));
      return true;
    }
    if (orient()) cy.fit(undefined, o.compact ? 42 : 46);
    // Mouse wheel: when the page itself scrolls (tablet/narrow layout) or this is the small dashboard preview,
    // the wheel scrolls the page instead of zooming the graph. Ctrl/Cmd + wheel (and trackpad pinch) still zoom.
    const flowQ = typeof matchMedia === 'function' ? matchMedia('(max-width: 1199px), (max-height: 619px)') : null;
    // Real browsers also send legacy wheel events (mousewheel, DOMMouseScroll) that Cytoscape listens to — block them all.
    if (container.parentElement) ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'].forEach(type =>
      container.parentElement.addEventListener(type, e => {
        if ((o.compact || (flowQ && flowQ.matches)) && !e.ctrlKey && !e.metaKey) e.stopPropagation();
      }, { capture: true, passive: true }));
    // Touch screens: the small dashboard preview must not trap page scrolling (tap still opens the trail).
    const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
    if (o.compact && coarse) { cy.userPanningEnabled(false); cy.userZoomingEnabled(false); }
    // Re-fit when the box changes size (rotation, window resize, layout switching between laptop and tablet).
    if (typeof ResizeObserver === 'function') {
      let last = container.clientWidth + 'x' + container.clientHeight, tmr = null;
      const ro = new ResizeObserver(() => {
        if (cy.destroyed()) { ro.disconnect(); return; }
        const now = container.clientWidth + 'x' + container.clientHeight; if (now === last) return; last = now;
        clearTimeout(tmr); tmr = setTimeout(() => { if (!cy.destroyed()) { cy.resize(); orient(); cy.fit(undefined, o.compact ? 42 : 46); } }, 120);
      });
      ro.observe(container);
    }
    if (o.onSelect) {
      cy.on('tap', 'node, edge', evt => { if (!evt.target.hasClass('coin')) o.onSelect(evt.target); });
      cy.on('tap', evt => { if (evt.target === cy) o.onSelect(null); });
    }

    /* ---- Hover: a card with the facts, and the money's whole path through that point lit up ---- */
    const fine = typeof matchMedia === 'function' && matchMedia('(hover: hover) and (pointer: fine)').matches;
    function pathOf(el) {
      if (el.isNode()) return el.predecessors().union(el.successors()).union(el).filter(x => !x.hasClass('coin'));
      return el.source().predecessors().union(el.target().successors()).union(el).union(el.source()).union(el.target());
    }
    function hoverOn(el) {
      if (el.hasClass('coin')) return;
      const p = pathOf(el).filter(x => x.isNode() || x.data('kind') !== 'link' || x === el);
      cy.batch(() => { cy.elements().not(p).not('.coin').addClass('hl-dim'); p.addClass('hl-path'); });
    }
    function hoverOff() { cy.batch(() => cy.elements().removeClass('hl-dim hl-path')); root.JMShell.tip.hide(); }
    cy.on('mouseover', 'node, edge', evt => {
      if (!fine || evt.target.hasClass('coin')) return;
      hoverOn(evt.target);
      const html = tipFor(A, evt.target, o.method); if (html) root.JMShell.tip.show(html, evt.originalEvent.clientX, evt.originalEvent.clientY);
    });
    cy.on('mousemove', 'node, edge', evt => { if (fine && root.JMShell.tip.el && root.JMShell.tip.el.style.display === 'block') root.JMShell.tip.show(root.JMShell.tip.el.innerHTML, evt.originalEvent.clientX, evt.originalEvent.clientY); });
    cy.on('mouseout', 'node, edge', hoverOff);
    cy.on('grab', 'node', () => root.JMShell.tip.hide());
    cy.on('free', 'node', hoverOff);
    container.addEventListener('mouseleave', hoverOff);
    cy.clearHover = hoverOff;
    cy.on('viewport', () => root.JMShell.tip.hide());

    /* ---- Reset: computed positions (respecting phone orientation) and fit ---- */
    cy.resetLayout = () => { hoverOff(); cy.scratch('_portrait', null); cy.batch(() => cy.nodes().not('.coin').forEach(n => { const p0 = n.scratch('_orig'); if (p0) n.position({ x: p0.x, y: p0.y }); })); orient(); cy.fit(cy.nodes().not('.coin'), o.compact ? 42 : 46); };

    /* ---- Keyboard: Tab into the graph, arrows move between accounts by hop, Enter opens details, Esc clears ---- */
    if (!o.compact) {
      container.tabIndex = 0; container.setAttribute('role', 'application');
      container.setAttribute('aria-label', root.JMI18N.t('graphKbdHelp'));
      let cur = null;
      const accts = () => cy.nodes('[kind = "account"]').not('.hidden');
      const lvl = n => n.data('level');
      function mark(n) { cy.nodes().removeClass('kbd'); cur = n; if (!n) return; n.addClass('kbd'); hoverOff(); hoverOn(n);
        const bb = n.renderedBoundingBox(), r = container.getBoundingClientRect(); const html = tipFor(A, n, o.method); if (html) root.JMShell.tip.show(html, r.left + bb.x2, r.top + bb.y1); }
      container.addEventListener('keydown', e => {
        const list = accts(); if (!list.length) return;
        if (!cur || cur.removed()) cur = null;
        const by = (a, b) => a.position('y') - b.position('y');
        let next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          const L = cur ? lvl(cur) + (e.key === 'ArrowRight' ? 1 : -1) : 0;
          const cand = list.filter(n => lvl(n) === L); if (cand.length) next = cand.sort((a, b) => Math.abs(a.position('y') - (cur ? cur.position('y') : 0)) - Math.abs(b.position('y') - (cur ? cur.position('y') : 0)))[0];
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          if (!cur) next = list.filter(n => lvl(n) === 0)[0];
          else { const same = list.filter(n => lvl(n) === lvl(cur)).sort(by); const i = same.indexOf(cur) + (e.key === 'ArrowDown' ? 1 : -1); next = same[Math.max(0, Math.min(same.length - 1, i))]; }
        } else if (e.key === 'Enter' || e.key === ' ') { if (cur && o.onSelect) { e.preventDefault(); o.onSelect(cur); } return; }
        else if (e.key === 'Escape') { mark(null); hoverOff(); if (o.onSelect) o.onSelect(null); return; }
        else return;
        e.preventDefault(); if (next) mark(next);
      });
      container.addEventListener('blur', () => { cy.nodes().removeClass('kbd'); hoverOff(); });
    }

    /* ---- "Show money moving": ₹ coins travel each transfer, hop by hop, in time order (off when reduced motion is asked for) ---- */
    let raf = null;
    cy.flowAnimation = on => {
      hoverOff(); cy.remove('.coin'); if (raf) { cancelAnimationFrame(raf); raf = null; }
      if (!on) return false;
      if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
      const money = cy.edges().filter(e => e.data('kind') !== 'link' && !e.hasClass('hidden') && e.source().data('kind') === 'account' && e.target().data('kind') === 'account');
      const maxL = Math.max.apply(null, money.map(e => e.source().data('level') || 0).concat([0]));
      const coins = money.map(e => ({ e, n: cy.add({ group: 'nodes', data: { id: 'coin-' + e.id() }, classes: 'coin', position: Object.assign({}, e.source().position()), grabbable: false, selectable: false }), L: e.source().data('level') || 0 }));
      const step = 900, cycle = (maxL + 2) * step; const t0 = performance.now();
      const tick = now => {
        if (cy.destroyed()) return;
        const tt = (now - t0) % cycle;
        cy.batch(() => coins.forEach(c => {
          if (c.e.removed() || c.n.removed()) return;
          const k = (tt - c.L * step) / step; const s = c.e.source().position(), d = c.e.target().position();
          if (k < 0 || k > 1) { c.n.style('opacity', 0); return; }
          c.n.style('opacity', 1); c.n.position({ x: s.x + (d.x - s.x) * k, y: s.y + (d.y - s.y) * k });
        }));
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return true;
    };
    cy.on('destroy', () => { if (raf) cancelAnimationFrame(raf); root.JMShell.tip.hide(); });

    /* ---- Download the current view as a PNG ---- */
    cy.downloadPng = name => {
      const url = cy.png({ full: true, scale: 2, bg: '#ffffff' });
      const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    };
    return cy;
  }

  // Hover card text for an account or a transfer (facts only, from the analysis).
  function tipFor(A, el, method) {
    const F = root.JM, I = root.JMI18N, S = root.JMShell, esc = S.esc;
    if (el.isNode()) {
      const id = el.id(); const acct = A.trail.accountsById[id]; if (!acct) return '<b>' + esc(el.data('label') || id) + '</b>';
      const role = accountRole(A, id), r = A.rules[id], al = A.alloc[method || 'FIFO'].perAccount[id];
      const br = F.branchOf ? F.branchOf(root.JM_DIRECTORY, acct.ifsc) : null;
      const cash = A.trail.cashOuts.filter(c => c.account === id);
      return '<b>' + esc(acct.masked) + '</b> · ' + esc(roleLabel(role)) +
        '<div>' + esc(acct.bank) + (br ? ' · ' + esc(S.branchText(br)) : '') + '</div>' +
        (r ? '<div>' + esc(t('risk')) + ': ' + r.score + '/100 · ' + r.hits.map(h => h.rule).join(' ') + '</div>' : '') +
        (al && role !== 'victim' ? '<div>' + esc(t('estTraceable')) + ' (' + (method || 'FIFO') + '): <b>' + F.formatINR(al.estTraceable) + '</b></div>' : '') +
        (cash.length ? '<div>' + esc(t('plCashHere')) + ': ' + cash.map(c => F.formatINR(c.txn.amount) + (c.txn.place ? ' @ ' + esc(I.pick(c.txn.place.area)) + ', ' + esc(I.pick(c.txn.place.city)) : '')).join('; ') + '</div>' : '') +
        '<div class="tip-hint">' + esc(t('tipClick')) + '</div>';
    }
    const e = A.trail.edges.find(x => x.txn.id === el.id());
    if (!e) return el.data('label') ? '<b>' + esc(String(el.data('label')).split('\n')[0]) + '</b>' : '';
    const x = e.txn;
    return '<b>' + esc(x.id) + ' · ' + F.formatINR(x.amount) + '</b> · ' + esc(x.rail) +
      '<div>' + esc(A.trail.accountsById[x.from].masked) + ' → ' + esc(A.trail.accountsById[x.to].masked) + ' · ' + F.istShortTime(x.time) + ' IST</div>' +
      '<div>' + esc(t('linkClass')) + ': <b>' + esc(S.linkLabel(e.link.cls)) + '</b></div>' +
      '<div>UTR/RRN ' + esc(x.senderRow.rrn || '—') + '</div><div class="tip-hint">' + esc(t('tipClick')) + '</div>';
  }

  function legendHtml(includeDigital) {
    const sw = (cls, txt) => '<span class="lg"><i class="lg-node ' + cls + '"></i>' + txt + '</span>';
    const ln = (cls, txt) => '<span class="lg"><i class="lg-line ' + cls + '"></i>' + txt + '</span>';
    return sw('victim', t('roleVictim')) + sw('mule', t('roleMule')) + sw('onTrail', t('roleOnTrail')) + sw('cashout', t('roleCashout')) +
      sw('unresolved', t('roleUnresolved')) + (includeDigital ? sw('digital', t('nodeWebsite') + ' / UPI') : '') +
      ln('confirmed', t('linkConfirmed')) + ln('probable', t('linkProbable')) + ln('unresolved', t('linkUnresolved')) +
      (includeDigital ? ln('strong', t('linkStrong')) + ln('infra', 'DNS/NS') : '');
  }

  root.JMGraph = { render, legendHtml, elementsFor };
})(typeof self !== 'undefined' ? self : this);
