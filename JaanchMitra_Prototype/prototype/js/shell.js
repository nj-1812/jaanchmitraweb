/* Shared page shell: header, navigation, language toggle, and the one shared analysis of the case. */
(function (root) {
  const { t } = root.JMI18N;

  // One analysis of the case, shared by every page and view (same data everywhere).
  function analyse() {
    const data = root.JM_CASE;
    const trail = root.JM.buildTrail(data);
    const alloc = { FIFO: root.JM.allocate(data, trail, 'FIFO'), LIFO: root.JM.allocate(data, trail, 'LIFO') };
    const rulesList = root.JM.evaluateAll(data, trail);
    const rules = {}; rulesList.forEach(r => { rules[r.account] = r; });
    const match = root.JM.crossTrailMatches(data);
    const timeline = root.JM.buildTimeline(data, trail);
    const A = { data, trail, alloc, rules, rulesList, match, timeline };
    A.places = root.JM.placesSummary && root.JM_DIRECTORY ? root.JM.placesSummary(A, root.JM_DIRECTORY) : [];
    return A;
  }

  function accountRole(A, id) {
    const base = root.JM.trailRole(A.trail, id);
    if (base === 'onTrail' && A.rules[id] && A.rules[id].suspected) return 'mule';
    return base;
  }
  function roleLabel(role) {
    return t({ victim: 'roleVictim', mule: 'roleMule', onTrail: 'roleOnTrail', cashout: 'roleCashout', unresolved: 'roleUnresolved' }[role] || 'roleOnTrail');
  }
  function masked(A, id) { return A.trail.accountsById[id].masked; }

  // Three interface languages; each button is labelled in its own language.
  const LANG_OPTS = [{ code: 'en', label: 'English', short: 'EN', htmlLang: 'en' }, { code: 'hi', label: 'हिंदी', short: 'हिं', htmlLang: 'hi' }, { code: 'hl', label: 'Hinglish', short: 'HL', htmlLang: 'hi-Latn' }];

  const NAV = [
    { key: 'navDashboard', href: 'index.html', page: 'dashboard' },
    { key: 'navComplaint', href: 'complaint.html', page: 'complaint' },
    { key: 'navStatements', href: 'statements.html', page: 'statements' },
    { key: 'navTrail', href: 'money-trail.html', page: 'trail' },
    { key: 'navWebsite', href: 'website.html', page: 'website' },
    { key: 'navReport', href: 'requests.html', page: 'report' }
  ];

  // Original JaanchMitra crest (not an official or government emblem). Large version: assets/jaanchmitra-crest.svg
  const LOGO = '<svg width="44" height="44" viewBox="0 0 120 120" role="img" aria-label="JaanchMitra crest"><circle cx="60" cy="60" r="57" fill="#0b1f3a" stroke="#c9a227" stroke-width="3"/><circle cx="60" cy="60" r="44" fill="#102a4c" stroke="#c9a227" stroke-width="1.2"/><path d="M60 24 L85 33 V57 C85 75 74 88 60 95 C46 88 35 75 35 57 V33 Z" fill="#0f766e" stroke="#ccfbf1" stroke-width="1.6"/><g stroke="#ffffff" stroke-linecap="round" fill="none"><circle cx="57" cy="55" r="13" stroke-width="3"/><path d="M66.5 64.5 L77 75" stroke-width="5"/><path d="M50 58 L56 49 L64 56" stroke-width="1.6"/></g><g fill="#ffffff"><circle cx="50" cy="58" r="2.4"/><circle cx="56" cy="49" r="2.4"/><circle cx="64" cy="56" r="2.4"/></g><g fill="#c9a227"><circle cx="60" cy="16" r="1.6"/><circle cx="60" cy="104" r="1.6"/><circle cx="16" cy="60" r="1.6"/><circle cx="104" cy="60" r="1.6"/></g></svg>';

  function renderShell(activePage, onLangChange) {
    const header = document.getElementById('app-header');
    header.innerHTML =
      '<div class="brand">' + LOGO + '<div><div class="brand-name">' + t('appName') + ' <span class="brand-alt">' + (root.JMI18N.getLang() === 'hi' ? 'JaanchMitra' : 'जांच-मित्र') + '</span></div>' +
      '<div class="brand-sub">' + t('appSub') + '</div></div></div>' +
      '<div class="proto-tag">' + t('protoTag') + '</div>' +
      '<div class="header-right"><span class="helpline">' + t('hlFraud') + ' <a href="tel:1930" aria-label="' + esc(t('hlCallAria', { n: '1930' })) + '">1930</a> · ' +
        t('hlEmergency') + ' <a href="tel:112" aria-label="' + esc(t('hlCallAria', { n: '112' })) + '">112</a></span>' +
      '<div class="lang-seg" role="group" aria-label="' + t('langLabel') + ' / Language">' +
        LANG_OPTS.map(o => '<button type="button" data-lang="' + o.code + '" lang="' + o.htmlLang + '" aria-pressed="' + (root.JMI18N.getLang() === o.code) + '"' +
          (root.JMI18N.getLang() === o.code ? ' class="on"' : '') + ' aria-label="' + o.label + '"><span class="l-full">' + o.label + '</span><span class="l-short" aria-hidden="true">' + o.short + '</span></button>').join('') + '</div></div>';

    const nav = document.getElementById('app-nav');
    nav.innerHTML = NAV.map(n => {
      if (!n.href) return '<span class="nav-item disabled" aria-disabled="true" title="' + t('nextBuild') + '">' + t(n.key) + ' <small>' + t('nextBuild') + '</small></span>';
      return '<a class="nav-item' + (n.page === activePage ? ' active' : '') + '" href="' + n.href + '"' + (n.page === activePage ? ' aria-current="page"' : '') + '>' + t(n.key) + '</a>';
    }).join('');

    // On narrow screens the steps scroll sideways: keep the current step in view.
    const act = nav.querySelector('.active');
    if (act && nav.scrollWidth > nav.clientWidth) nav.scrollLeft = Math.max(0, act.offsetLeft - (nav.clientWidth - act.offsetWidth) / 2);

    header.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => {
      if (b.getAttribute('data-lang') === root.JMI18N.getLang()) return;
      root.JMI18N.setLang(b.getAttribute('data-lang'));
      renderShell(activePage, onLangChange);
      root.JMI18N.applyStatic();
      onLangChange();
    });
    document.documentElement.lang = root.JMI18N.htmlLang();
  }

  // Opened from local files (file://), some browsers keep storage per file, so the chosen language is carried in the link.
  if (typeof document !== 'undefined' && typeof location !== 'undefined' && location.protocol === 'file:') {
    document.addEventListener('click', e => {
      const a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
      const href = a.getAttribute('href');
      if (!/^[\w-]+\.html(\?|#|$)|^\?/.test(href) || a.target === '_blank') return;
      const u = new URL(href, location.href); u.searchParams.set('lang', root.JMI18N.getLang()); a.setAttribute('href', u.href);
    }, true);
  }

  // Jargon explanations: hover shows the title on desktop; tap / Enter shows the same text as a small popover (touch screens have no hover).
  let jPop = null;
  function closeJargon() { if (jPop) { jPop.remove(); jPop = null; } }
  function openJargon(el) {
    closeJargon(); const text = el.getAttribute('title') || el.getAttribute('data-tip'); if (!text) return;
    jPop = document.createElement('div'); jPop.className = 'jargon-pop'; jPop.setAttribute('role', 'tooltip'); jPop.textContent = text;
    document.body.appendChild(jPop);
    const r = el.getBoundingClientRect(), w = Math.min(300, document.documentElement.clientWidth - 16);
    jPop.style.width = w + 'px';
    jPop.style.left = Math.max(8, Math.min(r.left, document.documentElement.clientWidth - w - 8)) + 'px';
    const below = r.bottom + 6, h = jPop.offsetHeight;
    jPop.style.top = (below + h > window.innerHeight - 8 ? Math.max(8, r.top - h - 6) : below) + 'px';
  }
  if (typeof document !== 'undefined') {
    document.addEventListener('click', e => { const j = e.target.closest && e.target.closest('.jargon'); if (j) { e.preventDefault(); if (jPop && jPop.dataset.for === j.textContent) closeJargon(); else { openJargon(j); if (jPop) jPop.dataset.for = j.textContent; } } else closeJargon(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeJargon(); if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('jargon')) { e.preventDefault(); openJargon(e.target); } });
    window.addEventListener('scroll', closeJargon, true); window.addEventListener('resize', closeJargon);
  }

  // When columns are stacked (tablet / phone), bring the opened details into view after a tap in a list.
  function revealOnSmall(el) {
    if (!el || typeof matchMedia !== 'function' || !matchMedia('(max-width: 1199px), (max-height: 619px)').matches) return;
    const r = el.getBoundingClientRect();
    if (r.top >= 0 && r.top < window.innerHeight * 0.6) return; // already in view
    const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
  }

  /* ---------- Tables ----------
   * table(heads, rows, opts): heads = [{ label, num?, cls? }] or strings; rows = [{ cells: [html...], href?, cls?, id? }] or arrays.
   * A row with href opens that page when clicked anywhere; its first link is the keyboard way in.
   */
  function table(heads, rows, opts) {
    const o = opts || {};
    const H = heads.map(h => typeof h === 'string' ? { label: h } : h);
    return '<table class="dt' + (o.cls ? ' ' + o.cls : '') + '">' + (o.caption ? '<caption class="sr">' + esc(o.caption) + '</caption>' : '') +
      '<thead><tr>' + H.map(h => '<th scope="col"' + (h.num ? ' class="num"' : h.cls ? ' class="' + h.cls + '"' : '') + '>' + h.label + '</th>').join('') + '</tr></thead><tbody>' +
      rows.map(r => { const R = Array.isArray(r) ? { cells: r } : r;
        return '<tr' + (R.href ? ' class="rowlink' + (R.cls ? ' ' + R.cls : '') + '" data-href="' + esc(R.href) + '"' : R.cls ? ' class="' + R.cls + '"' : '') + (R.id ? ' data-id="' + esc(R.id) + '"' : '') + '>' +
          R.cells.map((c, i) => '<td' + (H[i] && H[i].num ? ' class="num"' : H[i] && H[i].cls ? ' class="' + H[i].cls + '"' : '') + '>' + c + '</td>').join('') + '</tr>'; }).join('') +
      '</tbody></table>';
  }
  if (typeof document !== 'undefined') document.addEventListener('click', e => {
    const tr = e.target.closest && e.target.closest('tr.rowlink[data-href]');
    if (!tr || e.target.closest('a, button, input, select, label')) return;
    const a = tr.querySelector('a[href]'); if (a) a.click(); else location.href = tr.getAttribute('data-href');
  });
  // Place text helpers: "Piprali Road, Sikar · ATM SKR014" / "Sardarpura branch, Jodhpur".
  function placeText(p) {
    if (!p) return '—';
    const I = root.JMI18N;
    if (p.online) return t('plOnline', { rail: p.rail });
    return I.pick(p.area) + ', ' + I.pick(p.city) + ' · ' + (p.kind === 'atm' ? 'ATM ' : '') + p.code;
  }
  function branchText(b, withPin) {
    if (!b) return '—';
    const I = root.JMI18N;
    return t('plBranch', { b: I.pick(b.branch) }) + ', ' + I.pick(b.city) + (withPin ? ' ' + b.pin : '') + (b.state.en !== 'Rajasthan' ? ' (' + I.pick(b.state) + ')' : '');
  }

  // Floating hover card shared by graphs, Sankey and map (desktop hover; touch uses the details panel instead).
  const tip = { el: null,
    show(html, clientX, clientY) {
      if (!this.el) { this.el = document.createElement('div'); this.el.className = 'hover-tip'; this.el.setAttribute('role', 'tooltip'); document.body.appendChild(this.el); }
      this.el.innerHTML = html; this.el.style.display = 'block';
      const w = this.el.offsetWidth, h = this.el.offsetHeight, W = document.documentElement.clientWidth, H = window.innerHeight;
      let x = clientX + 14, y = clientY + 14; if (x + w > W - 8) x = clientX - w - 14; if (y + h > H - 8) y = clientY - h - 14;
      this.el.style.left = Math.max(8, x) + 'px'; this.el.style.top = Math.max(8, y) + 'px';
    },
    hide() { if (this.el) this.el.style.display = 'none'; }
  };
  if (typeof window !== 'undefined') window.addEventListener('scroll', () => tip.hide(), true);

  function esc(s) { return String(s === null || s === undefined ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }


  // Shared wording (money-trail page and case report use the same sentences).
  function linkLabel(c) { return t({ confirmed: 'linkConfirmed', probable: 'linkProbable', unresolved: 'linkUnresolved', strong: 'linkStrong', infra: 'linkWeak' }[c] || c); }
  function ruleWhy(h) {
    const F = root.JM; const p = Object.assign({}, h.params);
    ['in', 'out', 'amount', 'peak', 'closing'].forEach(k => { if (p[k] !== undefined) p[k] = F.formatINR(p[k]); });
    if (p.amountIn !== undefined) { p.in = F.formatINR(h.params.amountIn); p.out = F.formatINR(h.params.amountOut); }
    if (p.minutes !== undefined) p.min = p.minutes;
    return t(h.rule + 'why', p);
  }
  function eventText(A, e) {
    const F = root.JM; const m = id => esc(masked(A, id));
    switch (e.type) {
      case 'domainCreated': return t('evDomainCreated') + ': ' + esc(e.ref);
      case 'certValidFrom': return t('evCertValidFrom') + ': ' + esc(e.ref);
      case 'victimPayment': return t('evVictimPayment') + ': ' + F.formatINR(e.amount) + ' → ' + m(e.to);
      case 'transfer': return (e.linkClass === 'unresolved' ? t('evUnresolved') : t('evTransfer')) + ': ' + m(e.from) + ' → ' + m(e.to) + ' · ' + F.formatINR(e.amount);
      case 'cashOut': return t('evCashOut') + ': ' + F.formatINR(e.amount) + ' · ' + m(e.from);
      case 'dnsObserved': return t('evDnsObserved') + ': ' + esc(e.ref);
      default: return esc(e.type);
    }
  }

  // Helplines with real actions: tel: opens the dialler (the person places the call); sites open in a new tab.
  function helplinesHtml() {
    const H = root.JM_HELPLINES; if (!H) return '';
    const d = H.checkedOn.split('-').reverse().join('-');
    // Table: helpline · when to use it · call / open (real tel: and official-site links).
    return table([t('hlColName'), t('hlColWhen'), t('hlColAct')], H.list.map(h => ({ cls: 'hl-row' + (h.urgent ? ' urgent' : ''), cells: [
      '<b>' + esc(h.name) + '</b>', esc(t(h.desc)),
      '<div class="hl-acts">' + h.actions.map(a => a.kind === 'tel'
        ? '<a class="btn hl-call" href="tel:' + esc(a.value) + '" aria-label="' + esc(t('hlCallAria', { n: a.value })) + '"><span aria-hidden="true">📞</span> ' + esc(a.value) + '</a>'
        : '<a class="btn hl-web" href="' + esc(a.url) + '" target="_blank" rel="noopener noreferrer" aria-label="' + esc(t('hlOpenAria', { site: a.label })) + '">' + esc(a.label) + ' <span aria-hidden="true">↗</span></a>').join('') + '</div>'] })), { cls: 'compact stack hl-t', caption: t('cpHelp') }) +
      '<div class="small muted">' + esc(t('hlChecked', { d })) + '</div>';
  }

  // Sankey drawing shared by the money-trail page and the case report (model from JM.buildSankey + JM.layoutSankey).
  const SK_COLORS = { victim: '#1d4ed8', mule: '#b91c1c', onTrail: '#b45309', cashout: '#334155', unresolved: '#94a3b8', cash: '#334155', held: '#0f766e', unres: '#94a3b8' };
  const ROLE_SHORT = { victim: 'rsVictim', mule: 'rsMule', onTrail: 'rsOnTrail', cashout: 'rsCashout', unresolved: 'rsUnresolved' };
  function sankeySvg(A, model, W, H, label, withTable) {
    const F = root.JM;
    const sinkLabel = id => t({ cash: 'skCash', held: 'skHeld', unres: 'skUnres' }[id]);
    const nodeName = n => n.kind === 'sink' ? sinkLabel(n.id) : masked(A, n.id);
    const linkTitle = l => {
      const from = masked(A, l.source), amt = F.formatINR(l.value);
      if (l.kind === 'transfer') return l.id + ' · ' + from + ' → ' + masked(A, l.target) + ' · ' + amt + ' · ' + linkLabel(l.cls);
      return from + ' → ' + sinkLabel(l.target) + ' · ' + amt + (l.txnIds.length ? ' · ' + l.txnIds.join(', ') : '');
    };
    const byId = {}; model.nodes.forEach(n => { byId[n.id] = n; });
    const bandFill = l => l.kind === 'transfer' ? (l.cls === 'unresolved' ? SK_COLORS.unresolved : '#64748b') : SK_COLORS[l.kind];
    const links = model.links.map(l => '<path class="sk-band k-' + l.kind + ' c-' + l.cls + '" data-id="' + esc(l.kind === 'transfer' ? l.id : l.target) + '" data-src="' + esc(l.source) + '" data-cls="' + esc(l.cls) + '" d="' + l.path + '" fill="' + bandFill(l) + '"' +
      (l.cls === 'probable' ? ' style="fill:url(#sk-hatch)"' : '') + ' tabindex="0" role="button" aria-label="' + esc(linkTitle(l)) + '"><title>' + esc(linkTitle(l)) + '</title></path>').join('');
    // Label positions: start at each box's centre, then push apart within a column so text never overlaps (boxes stay put).
    const labelY = {};
    const byLevel = {}; model.nodes.forEach(n => { (byLevel[n.level] = byLevel[n.level] || []).push(n); });
    Object.keys(byLevel).forEach(lv => {
      const col = byLevel[lv].slice().sort((a, b) => (a.y + a.h / 2) - (b.y + b.h / 2));
      const half = n => (n.kind === 'sink' ? 2 : 3) * 7 + 2;
      col.forEach((n, i) => { let c = n.y + n.h / 2; if (i) { const p = col[i - 1]; c = Math.max(c, labelY[p.id] + half(p) + half(n)); } labelY[n.id] = c; });
      for (let i = col.length - 1; i >= 0; i--) { const n = col[i]; let c = Math.min(labelY[n.id], H - half(n));
        if (i < col.length - 1) { const nx = col[i + 1]; c = Math.min(c, labelY[nx.id] - half(nx) - half(n)); } labelY[n.id] = Math.max(half(n), c); }
    });
    const nodes = model.nodes.map(n => {
      const role = n.kind === 'sink' ? n.id : accountRole(A, n.id);
      const lx = n.x + n.w + 6, cy0 = labelY[n.id];
      const lines = [nodeName(n), F.formatINR(n.value)].concat(n.kind === 'sink' ? [] : [t(ROLE_SHORT[role] || 'rsOnTrail')]);
      const top = cy0 - (lines.length - 1) * 7;
      return '<g class="sk-node" data-id="' + esc(n.id) + '" data-level="' + n.level + '" tabindex="0" role="button" aria-label="' + esc(lines.join(', ')) + '">' +
        '<rect x="' + n.x + '" y="' + n.y + '" width="' + n.w + '" height="' + n.h + '" rx="2" fill="' + (SK_COLORS[role] || '#475569') + '"' + (role === 'unresolved' || role === 'unres' ? ' stroke="#334155" stroke-dasharray="3 2"' : '') + '></rect>' +
        lines.map((ln, i) => '<text x="' + lx + '" y="' + (top + i * 14) + '" class="' + (i === 0 ? 'sk-l1' : i === 1 ? 'sk-l2' : 'sk-l3') + '" dominant-baseline="middle">' + esc(ln) + '</text>').join('') +
        '<title>' + esc(lines.join(' · ')) + '</title></g>';
    }).join('');
    const table = '<table class="sr"><caption>' + esc(t('skTableCap')) + '</caption><tr><th>' + esc(t('skFrom')) + '</th><th>' + esc(t('skTo')) + '</th><th>' + esc(t('amount')) + '</th></tr>' +
      model.links.map(l => '<tr><td>' + esc(nodeName(byId[l.source])) + '</td><td>' + esc(nodeName(byId[l.target])) + '</td><td>' + F.formatINR(l.value) + '</td></tr>').join('') + '</table>';
    return '<svg class="sk-svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="' + esc(label) + '">' +
      '<defs><pattern id="sk-hatch" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)"><rect width="7" height="7" fill="#94a3b8"/><line x1="0" y1="0" x2="0" y2="7" stroke="#475569" stroke-width="3"/></pattern></defs>' +
      '<g class="sk-links">' + links + '</g><g class="sk-nodes">' + nodes + '</g></svg>' + (withTable ? table : '');
  }
  root.JMShell = { analyse, renderShell, accountRole, roleLabel, masked, esc, linkLabel, ruleWhy, eventText, helplinesHtml, revealOnSmall, sankeySvg, SK_COLORS, table, placeText, branchText, tip };
})(typeof self !== 'undefined' ? self : this);
