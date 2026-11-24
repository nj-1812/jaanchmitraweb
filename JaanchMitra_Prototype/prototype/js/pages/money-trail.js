/* Money Trail page: full graph with view switcher, filters, search and an evidence panel. */
(function (root) {
  const I = root.JMI18N; const t = I.t;
  const S = root.JMShell; const esc = S.esc;
  const F = root.JM;
  const A = S.analyse();

  const params = new URLSearchParams(location.search);
  const levelsPresent = Array.from(new Set(Object.values(A.trail.levels))).sort();
  const state = {
    view: ['relationship', 'timeline', 'sankey', 'places'].indexOf(params.get('view')) !== -1 ? params.get('view') : 'layered',
    step: 0,
    method: 'FIFO',
    levels: new Set(levelsPresent),
    classes: new Set(['confirmed', 'probable', 'unresolved']),
    search: '',
    selected: params.get('focus') || null
  };
  let cy = null;
  let timer = null;
  const EVENTS = A.timeline;

  function levelCount(l) { return Object.values(A.trail.levels).filter(v => v === l).length; }
  function classCount(c) { return A.trail.edges.filter(e => e.link.cls === c).length; }
  const linkLabel = S.linkLabel;
  function rowText(r) { return r ? esc(r.file) + ' · ' + t('page') + ' ' + r.page + ' · ' + t('row') + ' ' + r.row : t('notAvailable'); }

  function leftPanel() {
    const opt = (name, value, checked, label, disabled, count) =>
      '<label class="opt' + (disabled ? ' disabled' : '') + '"><input type="' + (name === 'view' ? 'radio' : 'checkbox') + '" name="' + name + '" value="' + value + '"' +
      (checked ? ' checked' : '') + (disabled ? ' disabled' : '') + '> ' + label + (count !== undefined ? '<span class="count">' + count + '</span>' : '') + '</label>';
    return '<section class="card panel" aria-label="Controls">' +
      '<div><h3>' + t('viewLabel') + '</h3>' +
        opt('view', 'layered', state.view === 'layered', t('viewLayered')) +
        opt('view', 'relationship', state.view === 'relationship', t('viewRelationship')) +
        opt('view', 'sankey', state.view === 'sankey', t('viewSankey')) +
        opt('view', 'places', state.view === 'places', t('viewPlaces')) +
        opt('view', 'timeline', state.view === 'timeline', t('viewTimeline')) + '</div>' +
      '<div><h3>' + t('method') + '</h3><div class="seg" role="group"><button type="button" data-method="FIFO" class="' + (state.method === 'FIFO' ? 'on' : '') + '">FIFO</button>' +
        '<button type="button" data-method="LIFO" class="' + (state.method === 'LIFO' ? 'on' : '') + '">LIFO</button></div></div>' +
      '<div><h3>' + t('filterHops') + '</h3>' + levelsPresent.map(l => opt('level', l, state.levels.has(l), 'L' + l + (l === 0 ? ' · ' + t('roleVictim') : ''), false, levelCount(l))).join('') + '</div>' +
      '<div><h3>' + t('filterLinks') + '</h3>' + ['confirmed', 'probable', 'unresolved'].map(c => opt('cls', c, state.classes.has(c), linkLabel(c), false, classCount(c))).join('') + '</div>' +
      '<div><input class="search" id="search" type="search" placeholder="' + esc(t('search')) + '" value="' + esc(state.search) + '"></div>' +
      '<div><button class="btn" id="reset" type="button">' + t('reset') + '</button></div>' +
    '</section>';
  }

  function caption() {
    if (state.view === 'relationship') return t('relCaption');
    if (state.view === 'places') { const cp = A.places.filter(p => p.cashTotal > 0);
      return t('plCaption', { n: A.places.length, cash: F.formatINR(cp.reduce((a, p) => a + p.cashTotal, 0)), cities: cp.map(p => I.pick(p.city)).join(', ') }); }
    if (state.view === 'sankey') { const tt = A.alloc[state.method].totals;
      return t('skCaption', { loss: F.formatINR(tt.victimLoss), cash: F.formatINR(tt.withdrawn), held: F.formatINR(tt.estTraceable), unres: F.formatINR(tt.unresolved), method: state.method }); }
    const tot = A.alloc[state.method].totals;
    return t('caption', { loss: F.formatINR(tot.victimLoss), hops: A.trail.maxLevel, accounts: Object.keys(A.trail.levels).length - 1,
      est: F.formatINR(tot.estTraceable), method: state.method, unres: F.formatINR(tot.unresolved) });
  }

  function accountDetails(id) {
    const acct = A.trail.accountsById[id];
    const role = S.accountRole(A, id);
    const r = A.rules[id];
    const al = A.alloc[state.method].perAccount[id];
    const other = state.method === 'FIFO' ? 'LIFO' : 'FIFO';
    const alOther = A.alloc[other].perAccount[id];
    let html = '<h2 style="margin:0;font-size:17px">' + esc(acct.masked) + ' <span class="pill ' + (r ? r.band : 'low') + '">' + esc(S.roleLabel(role)) + '</span></h2>' +
      '<dl class="kv">' +
      '<dt>' + t('bank') + '</dt><dd>' + esc(acct.bank) + '</dd>' +
      '<dt><span class="jargon" data-jargon="IFSC">IFSC</span></dt><dd>' + esc(acct.ifsc) + '</dd>' +
      '<dt><span class="jargon" data-jargon="VPA">VPA</span></dt><dd>' + esc(acct.vpa || '—') + '</dd>' +
      '<dt>' + t('hop') + '</dt><dd>L' + A.trail.levels[id] + '</dd>' +
      '<dt>' + t('stHomeBranch') + '</dt><dd>' + esc(S.branchText(F.branchOf(root.JM_DIRECTORY, acct.ifsc), true)) + '</dd>' +
      (r ? '<dt>' + t('risk') + '</dt><dd>' + t('band' + r.band.charAt(0).toUpperCase() + r.band.slice(1)) + ' · ' + r.score + '/100</dd>' : '') +
      '</dl>';
    if (role === 'unresolved') {
      html += '<div class="note">' + esc(t('reasonNoReceiverStatement')) + '. ' + esc(t('unresolvedNext2', { bank: acct.bank })) + ' <a href="requests.html?id=REQ-STMT-' + acct.masked.slice(-4) + '">' + t('stRequest') + '</a>' + '</div>';
      html += '<div class="fig3"><div><b>' + F.formatINR(al.victimAttributed) + '</b><span>' + t('victimAttributed') + '</span></div></div>';
      return html;
    }
    if (role !== 'victim') {
      html += '<div class="fig3"><div><b>' + F.formatINR(al.observedBalance) + '</b><span>' + t('observedBalance') + '</span></div>' +
        '<div><b>' + F.formatINR(al.victimAttributed) + '</b><span>' + t('victimAttributed') + '</span></div>' +
        '<div><b>' + F.formatINR(al.estTraceable) + '</b><span>' + t('estTraceable') + ' (' + state.method + ')</span></div></div>' +
        '<div class="ev">' + other + ': ' + F.formatINR(alOther.estTraceable) + ' · ' + t('estimateNote') + '</div>';
    }
    // Cash taken out from this account: when, how much, and where (ATM / branch from the statement narration).
    const cash = A.trail.cashOuts.filter(c => c.account === id);
    if (cash.length) {
      html += '<h3 class="d-h">' + t('mtCashWhere') + '</h3>' + S.table([t('time'), { label: t('amount'), num: true }, t('stPlace')],
        cash.map(c => { const p = c.txn.place; return [F.istShortTime(c.txn.time), F.formatINR(c.txn.amount),
          p ? '<b>' + esc(I.pick(p.area)) + '</b><div class="sub">' + esc(I.pick(p.city)) + ' · ' + (p.kind === 'atm' ? 'ATM ' : '') + esc(p.code) + '</div>' : '—']; }), { cls: 'compact' });
    }
    // Why flagged, as a table: rule · what was seen (with the statement rows) · points.
    if (r) {
      html += '<h3 class="d-h">' + t('whyFlagged') + ' · ' + r.score + '/100</h3>' + (r.hits.length ? S.table([t('rpColRules'), t('mtColSeen'), { label: t('mtColPts'), num: true }],
        r.hits.map(h => ['<b>' + h.rule + '</b><div class="sub">' + esc(t(h.rule)) + '</div>', esc(S.ruleWhy(h)) +
          '<div class="sub">' + h.evidence.slice(0, 2).map(e => e.file ? esc(e.file) + ' ' + t('row') + ' ' + e.row : esc(e.txn)).join('; ') + (h.evidence.length > 2 ? ' …' : '') + '</div>', '+' + h.weight]),
        { cls: 'compact rules-t' }) : '<div class="muted small">' + t('noRules') + '</div>');
    }
    return html;
  }

  function edgeDetails(id) {
    const e = A.trail.edges.find(x => x.txn.id === id);
    if (!e) return linkDetails(id);
    const x = e.txn;
    const reason = e.link.reason === 'rrnInBoth' ? t('reasonRrnInBoth') : e.link.reason === 'amountAndTime' ? t('reasonAmountAndTime', { sec: Math.round(e.link.seconds) }) : t('reasonNoReceiverStatement');
    return '<h2 style="margin:0;font-size:17px">' + esc(S.masked(A, x.from)) + ' → ' + esc(S.masked(A, x.to)) + '</h2>' +
      '<dl class="kv">' +
      '<dt>' + t('amount') + '</dt><dd>' + F.formatINR(x.amount) + '</dd>' +
      '<dt>' + t('time') + '</dt><dd>' + F.istDateTime(x.time) + '<br><span class="ev">' + F.utcString(x.time) + '</span></dd>' +
      '<dt><span class="jargon" data-jargon="RRN">UTR/RRN</span></dt><dd>' + esc(x.senderRow.rrn || '—') + '</dd>' +
      '<dt>' + t('rail') + '</dt><dd>' + esc(x.rail) + '</dd>' +
      '<dt>' + t('stPlace') + '</dt><dd>' + esc(t('plOnline', { rail: x.rail })) + '<div class="ev">' +
        esc(S.branchText(F.branchOf(root.JM_DIRECTORY, A.trail.accountsById[x.from].ifsc))) + ' → ' + esc(S.branchText(F.branchOf(root.JM_DIRECTORY, A.trail.accountsById[x.to].ifsc))) + ' · ' + esc(t('plHomeNote')) + '</div></dd>' +
      '<dt>' + t('linkClass') + '</dt><dd><span class="pill ' + e.link.cls + '">' + linkLabel(e.link.cls) + '</span><br><span class="small">' + esc(reason) + '</span></dd>' +
      '<dt>' + t('senderRow') + '</dt><dd class="small">' + rowText(x.senderRow) + '</dd>' +
      '<dt>' + t('receiverRow') + '</dt><dd class="small">' + rowText(x.receiverRow) + '</dd>' +
      '<dt>' + t('victimShare') + '</dt><dd>' + F.formatINR(A.alloc[state.method].victimShare[x.id]) + ' (' + state.method + ')</dd>' +
      '</dl><div class="ev">' + esc(x.narration) + '</div>';
  }

  function linkDetails(id) {
    const d = A.data.digital;
    const m = A.match.matches[0];
    if (id === 'L-acct-vpa' || id === 'L-web-vpa') {
      return '<h2 style="margin:0;font-size:17px">' + t('findMatch', { acct: S.masked(A, m.account) }) + '</h2>' +
        '<dl class="kv"><dt>' + t('linkClass') + '</dt><dd><span class="pill strong">' + t('linkStrong') + '</span></dd>' +
        '<dt>' + t('nodeWebsite') + '</dt><dd>' + esc(m.evidenceValue) + '<br><span class="ev">' + esc(d.websiteEvidence.file) + ' · ' + esc(I.pick(d.websiteEvidence.suppliedBy)) + '</span></dd>' +
        '<dt>' + t('senderRow') + '</dt><dd>' + esc(m.accountValue) + '<br><span class="ev">' + esc(A.trail.accountsById[m.account].statement.file) + '</span></dd></dl>' +
        '<div class="note">' + esc(t('noteLowercase')) + '</div>';
    }
    if (id === 'L-domain-ip') {
      return '<h2 style="margin:0;font-size:17px">' + esc(d.domain.name) + ' → ' + esc(d.ip.address) + '</h2>' +
        '<dl class="kv"><dt><span class="jargon" data-jargon="DNS">DNS</span></dt><dd>' + esc(t('evDnsObserved')) + '<br>' + F.istDateTime(d.dns[0].observedAt) + '</dd>' +
        '<dt>Source</dt><dd>' + esc(d.dns[0].source) + '</dd></dl>' +
        '<div class="note">' + esc(t('noteDnsObserved')) + '</div>';
    }
    return '<div class="muted small">' + esc(id) + '</div>';
  }

  function digitalDetails(id) {
    const d = A.data.digital;
    if (id === 'domain') return '<h2 style="margin:0;font-size:17px">' + esc(d.domain.name) + '</h2><dl class="kv">' +
      '<dt><span class="jargon" data-jargon="RDAP">RDAP</span></dt><dd>' + esc(d.domain.registrar) + ' · ' + esc(d.domain.reseller) + '</dd>' +
      '<dt>Created</dt><dd>' + F.istDateTime(d.domain.created.value) + '</dd>' +
      '<dt>Expires</dt><dd>' + F.istDateTime(d.domain.expires.value) + '</dd>' +
      '<dt>NS</dt><dd>' + d.domain.nameservers.map(esc).join('<br>') + '</dd>' +
      '<dt><span class="jargon" data-jargon="CT">CT</span></dt><dd>' + esc(d.certificate.issuer) + ' · valid from ' + F.istDateTime(d.certificate.validFrom.value) + '<br>' + d.certificate.sans.map(esc).join(', ') + '</dd>' +
      '<dt>Abuse</dt><dd>' + esc(d.domain.abuseContact) + '</dd>' +
      '<dt>Looked up</dt><dd>' + F.istDateTime(d.domain.lookedUpAt) + '</dd></dl>' +
      '<div class="note">' + esc(t('notePassive')) + '</div>';
    if (id === 'ip') return '<h2 style="margin:0;font-size:17px">' + esc(d.ip.address) + '</h2><dl class="kv">' +
      '<dt><span class="jargon" data-jargon="ASN">ASN</span></dt><dd>' + esc(d.ip.asn) + ' · ' + esc(d.ip.asnName) + '</dd>' +
      '<dt>Type</dt><dd>' + esc(d.ip.type) + ' · Tor: ' + (d.ip.tor ? 'yes' : 'no') + ' · VPN: ' + (d.ip.vpn ? 'yes' : 'no') + '</dd>' +
      '<dt>rDNS</dt><dd>' + esc(d.ip.reverseDns) + '</dd>' +
      '<dt>' + t('indicativeLoc') + '</dt><dd>' + esc(I.pick(d.ip.indicativeLocation.value)) + '<br><span class="ev">source: ' + esc(d.ip.indicativeLocation.source) + '</span></dd>' +
      '<dt>Abuse</dt><dd>' + esc(d.ip.abuseContact) + '</dd></dl>' +
      '<div class="note">' + esc(t('noteIpNotPerson')) + '</div>';
    if (id === 'website') return '<h2 style="margin:0;font-size:17px">' + t('nodeWebsite') + '</h2><dl class="kv">' +
      '<dt>File</dt><dd>' + esc(d.websiteEvidence.file) + '</dd><dt>By</dt><dd>' + esc(I.pick(d.websiteEvidence.suppliedBy)) + '</dd>' +
      '<dt>UPI ID</dt><dd>' + d.websiteEvidence.vpas.map(esc).join(', ') + '</dd><dt>Phone</dt><dd>' + d.websiteEvidence.phones.map(esc).join(', ') + '</dd></dl>' +
      '<div class="note">' + esc(t('noteChakshu')) + '</div>';
    return '<h2 style="margin:0;font-size:17px">' + esc(cy.getElementById(id).data('label')) + '</h2>';
  }

  function renderDetails() {
    const box = document.getElementById('details');
    if (state.view === 'places') {
      const id = state.selected; let html = null;
      if (id && /^city:/.test(id)) html = cityDetails(id.slice(5));
      else if (id && A.trail.accountsById[id]) html = accountDetails(id);
      box.innerHTML = '<h3>' + t('detailsTitle') + '</h3>' + (html || '<div class="muted">' + t('plHint') + '</div>');
      I.applyStatic(box); return;
    }
    if (state.view === 'sankey') {
      const id = state.selected; let html = null;
      if (id && A.trail.accountsById[id]) html = accountDetails(id);
      else if (id && A.trail.edges.some(e => e.txn.id === id)) html = edgeDetails(id);
      else if (id && /^(cash|held|unres)(:|$)/.test(id)) html = sinkDetails(id.split(':')[0]);
      box.innerHTML = '<h3>' + t('detailsTitle') + '</h3>' + (html || '<div class="muted">' + t('skHint') + '</div>');
      I.applyStatic(box); return;
    }
    if (!state.selected || !cy || cy.getElementById(state.selected).empty()) {
      box.innerHTML = '<h3>' + t('detailsTitle') + '</h3><div class="muted">' + t('detailsHint') + '</div>';
      return;
    }
    const el = cy.getElementById(state.selected);
    let html;
    if (el.isEdge()) html = edgeDetails(state.selected);
    else if (el.data('kind') === 'account') html = accountDetails(state.selected);
    else html = digitalDetails(state.selected);
    box.innerHTML = '<h3>' + t('detailsTitle') + '</h3>' + html;
    I.applyStatic(box);
  }

  function applyFilters() {
    if (state.view === 'sankey') return applySankeyFilters();
    if (state.view === 'places') return applyPlacesHighlight();
    if (!cy) return;
    cy.batch(() => {
      cy.elements().removeClass('hidden faded focus');
      cy.nodes('[kind = "account"]').forEach(n => { if (!state.levels.has(n.data('level'))) n.addClass('hidden'); });
      cy.edges('[kind = "money"]').forEach(e => {
        if (!state.classes.has(e.data('cls')) || e.source().hasClass('hidden') || e.target().hasClass('hidden')) e.addClass('hidden');
      });
      cy.edges('[kind = "link"]').forEach(e => { if (e.source().hasClass('hidden') || e.target().hasClass('hidden')) e.addClass('hidden'); });
      const q = state.search.trim().toLowerCase();
      if (q) {
        const hits = cy.elements().filter(el => {
          if (el.isNode()) {
            const a = A.trail.accountsById[el.id()];
            return (el.data('label') || '').toLowerCase().includes(q) || (a && a.vpa && a.vpa.toLowerCase().includes(q));
          }
          const e = A.trail.edges.find(x => x.txn.id === el.id());
          return !!(e && e.txn.senderRow && e.txn.senderRow.rrn && e.txn.senderRow.rrn.includes(q));
        });
        if (hits.length) { cy.elements().not(hits).not(hits.connectedNodes()).addClass('faded'); hits.addClass('focus'); }
      }
      if (state.selected && !cy.getElementById(state.selected).empty()) {
        const el = cy.getElementById(state.selected);
        el.addClass('focus');
        if (!q) cy.elements().not(el.closedNeighborhood()).not(el.connectedNodes()).not('.digital').not('[kind = "link"]').addClass('faded');
      }
    });
  }

  // ---------- Timeline replay: step through events in time order; the graph shows only money moved so far ----------
  const eventText = e => S.eventText(A, e);

  function replayBar() {
    const n = EVENTS.length, e = EVENTS[state.step];
    return '<div class="replay" role="group" aria-label="' + esc(t('viewTimeline')) + '">' +
      '<div class="rp-ctrl"><button class="btn" id="rp-start" type="button" aria-label="' + esc(t('rpRestart')) + '">⏮</button>' +
      '<button class="btn" id="rp-back" type="button" aria-label="' + esc(t('rpBack')) + '">◀</button>' +
      '<button class="btn primary" id="rp-play" type="button">' + (timer ? '⏸ ' + t('rpPause') : '▶ ' + t('rpPlay')) + '</button>' +
      '<button class="btn" id="rp-fwd" type="button" aria-label="' + esc(t('rpForward')) + '">▶</button></div>' +
      '<input id="rp-slider" type="range" min="0" max="' + (n - 1) + '" value="' + state.step + '" aria-label="' + esc(t('rpEventOf', { i: state.step + 1, n })) + '">' +
      '<div class="rp-event ' + (e.kind === 'observation' ? 'obs' : '') + '"><b>' + F.istDateTime(e.time) + '</b> <span class="ev">' + F.utcString(e.time) + '</span> ' +
        '<span class="pill ' + (e.kind === 'observation' ? 'probable' : 'confirmed') + '">' + (e.kind === 'observation' ? t('kindObs') : t('kindEvent')) + '</span>' +
        '<span class="ev"> · ' + esc(e.source) + ' · ' + esc(t('rpEventOf', { i: state.step + 1, n })) + '</span><br>' + eventText(e) + '</div></div>';
  }

  function applyReplay() {
    if (!cy || state.view !== 'timeline') return;
    const cur = EVENTS[state.step];
    // Only true EVENT times decide what has happened; an observation never moves money on the graph.
    const now = Date.parse(cur.time);
    const reached = new Set([A.trail.rootTxn.from]);
    cy.batch(() => {
      cy.elements().removeClass('future current');
      cy.edges('[kind = "money"]').forEach(edge => {
        const e = A.trail.edges.find(x => x.txn.id === edge.id());
        if (e && Date.parse(e.txn.time) <= now) { reached.add(e.txn.to); if (cur.txn === e.txn.id) edge.addClass('current'); }
        else edge.addClass('future');
      });
      cy.nodes('[kind = "account"]').forEach(nd => { if (!reached.has(nd.id())) nd.addClass('future'); });
      if (cur.type === 'cashOut') cy.getElementById(cur.from).addClass('current');
    });
  }

  function setStep(i) {
    state.step = Math.max(0, Math.min(EVENTS.length - 1, i));
    const bar = document.getElementById('replay');
    if (bar) { bar.innerHTML = replayBar(); wireReplay(); }
    applyReplay();
  }

  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }

  function wireReplay() {
    const g = id => document.getElementById(id);
    if (!g('rp-play')) return;
    g('rp-start').onclick = () => { stopTimer(); setStep(0); };
    g('rp-back').onclick = () => { stopTimer(); setStep(state.step - 1); };
    g('rp-fwd').onclick = () => { stopTimer(); setStep(state.step + 1); };
    g('rp-slider').oninput = ev => { stopTimer(); setStep(Number(ev.target.value)); };
    g('rp-play').onclick = () => {
      if (timer) { stopTimer(); setStep(state.step); return; }
      if (state.step >= EVENTS.length - 1) state.step = -1;
      timer = setInterval(() => { if (state.step >= EVENTS.length - 1) { stopTimer(); setStep(state.step); } else setStep(state.step + 1); }, 1300);
      setStep(state.step + 1);
    };
  }

  document.addEventListener('keydown', ev => {
    if (state.view !== 'timeline' || /input|textarea/i.test((ev.target && ev.target.tagName) || '') && ev.target.type !== 'range') return;
    if (ev.key === 'ArrowRight') { stopTimer(); setStep(state.step + 1); }
    if (ev.key === 'ArrowLeft') { stopTimer(); setStep(state.step - 1); }
  });

  /* ---------- Sankey: where the victim's money went (drawn as SVG from the allocation; no new figures) ---------- */
  let sk = null, skRO = null;
  const SK_COLORS = S.SK_COLORS;
  const sinkLabel = id => t({ cash: 'skCash', held: 'skHeld', unres: 'skUnres' }[id]);
  function sinkDetails(kind) {
    const m = sk && sk.model; if (!m) return '';
    const ls = m.links.filter(l => l.target === kind);
    const text = { cash: t('skSinkCashText'), held: t('skSinkHeldText', { method: state.method }), unres: t('skSinkUnresText') }[kind];
    return '<h2 style="margin:0;font-size:17px">' + esc(sinkLabel(kind)) + ' · ' + F.formatINR(ls.reduce((a, l) => a + l.value, 0)) + '</h2>' +
      '<div class="small">' + esc(text) + '</div><dl class="kv">' + ls.map(l => '<dt>' + esc(S.masked(A, l.source)) + '</dt><dd>' + F.formatINR(l.value) +
        (l.txnIds.length ? ' <span class="ev">' + esc(l.txnIds.join(', ')) + '</span>' : '') + '</dd>').join('') + '</dl>' +
      (kind === 'held' ? '<div class="ev">' + esc(t('estimateNote')) + '</div>' : '');
  }
  function drawSankey() {
    const box = document.getElementById('sk-box'); if (!box) return;
    const model = F.buildSankey(A.data, A.trail, A.alloc[state.method]);
    const W = Math.max(box.clientWidth, 680), H = Math.max(box.clientHeight - 4, 300);
    F.layoutSankey(model, { width: W, height: H, gap: 22, labelRoom: 160, padTop: 16, padBottom: 16 });
    sk = { model };
    box.innerHTML = S.sankeySvg(A, model, W, H, caption(), true);
    const pick = id => { state.selected = id; applySankeyFilters(); renderDetails();
      if (typeof matchMedia === 'function' && matchMedia('(max-width: 699px)').matches) S.revealOnSmall(document.getElementById('details')); };
    box.querySelectorAll('[data-id]').forEach(el => {
      el.addEventListener('click', e => { e.stopPropagation(); pick(el.getAttribute('data-id')); });
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(el.getAttribute('data-id')); } });
    });
    box.querySelector('svg').addEventListener('click', () => { state.selected = null; applySankeyFilters(); renderDetails(); });
    // Hover: card with the facts, and every band upstream and downstream of that point lit (one stream of money, end to end).
    const L = model.links;
    const up = id => { const out = new Set(), q = [id]; while (q.length) { const n = q.pop(); L.forEach(l => { if (l.target === n && !out.has(l)) { out.add(l); q.push(l.source); } }); } return out; };
    const down = id => { const out = new Set(), q = [id]; while (q.length) { const n = q.pop(); L.forEach(l => { if (l.source === n && !out.has(l)) { out.add(l); q.push(l.target); } }); } return out; };
    const bandEl = l => box.querySelector('.sk-band[data-id="' + (l.kind === 'transfer' ? l.id : l.target) + '"][data-src="' + l.source + '"]');
    function lightUp(set, nodes) {
      box.querySelectorAll('.sk-band').forEach(p => p.classList.add('cold'));
      set.forEach(l => { const el = bandEl(l); if (el) { el.classList.remove('cold'); el.classList.add('hot'); } });
      box.querySelectorAll('.sk-node').forEach(g => g.classList.toggle('cold', !nodes.has(g.getAttribute('data-id'))));
    }
    function lightOff() { box.querySelectorAll('.cold, .hot').forEach(el => el.classList.remove('cold', 'hot')); S.tip.hide(); }
    const fine = typeof matchMedia === 'function' && matchMedia('(hover: hover) and (pointer: fine)').matches;
    box.querySelectorAll('.sk-band').forEach(p => {
      const l = L.find(x => (x.kind === 'transfer' ? x.id : x.target) === p.getAttribute('data-id') && x.source === p.getAttribute('data-src'));
      if (!l || !fine) return;
      p.addEventListener('mouseenter', e => { const set = new Set([l, ...up(l.source), ...down(l.target)]); const nodes = new Set(); set.forEach(x => { nodes.add(x.source); nodes.add(x.target); });
        lightUp(set, nodes); S.tip.show('<b>' + esc(p.getAttribute('aria-label')) + '</b><div class="tip-hint">' + esc(t('tipClick')) + '</div>', e.clientX, e.clientY); });
      p.addEventListener('mousemove', e => S.tip.show(S.tip.el.innerHTML, e.clientX, e.clientY));
      p.addEventListener('mouseleave', lightOff);
    });
    box.querySelectorAll('.sk-node').forEach(g => {
      if (!fine) return; const id = g.getAttribute('data-id');
      g.addEventListener('mouseenter', e => { const set = new Set([...up(id), ...down(id)]); const nodes = new Set([id]); set.forEach(x => { nodes.add(x.source); nodes.add(x.target); });
        lightUp(set, nodes); S.tip.show('<b>' + esc(g.getAttribute('aria-label')) + '</b><div class="tip-hint">' + esc(t('tipClick')) + '</div>', e.clientX, e.clientY); });
      g.addEventListener('mouseleave', lightOff);
    });
    applySankeyFilters(); renderDetails();
    if (skRO && skRO.box !== box) { skRO.disconnect(); skRO = null; }
    if (!skRO && typeof ResizeObserver === 'function') {
      let last = box.clientWidth + 'x' + box.clientHeight, tmr = null;
      skRO = new ResizeObserver(() => { const b = document.getElementById('sk-box'); if (!b || state.view !== 'sankey') return;
        const now = b.clientWidth + 'x' + b.clientHeight; if (now === last) return; last = now; clearTimeout(tmr); tmr = setTimeout(drawSankey, 120); });
      skRO.observe(box); skRO.box = box;
    }
  }
  function applySankeyFilters() {
    const box = document.getElementById('sk-box'); if (!box || !sk) return;
    const q = state.search.trim().toLowerCase();
    const levelOf = id => (sk.model.nodes.find(n => n.id === id) || {}).level;
    const hitNode = id => { const a = A.trail.accountsById[id]; return !!q && !!a && (a.masked.toLowerCase().includes(q) || (a.vpa || '').toLowerCase().includes(q)); };
    box.querySelectorAll('.sk-band').forEach(p => {
      const cls = p.getAttribute('data-cls'), src = p.getAttribute('data-src'), id = p.getAttribute('data-id');
      const lvlOk = state.levels.has(levelOf(src));
      const clsOk = !p.classList.contains('k-transfer') || state.classes.has(cls);
      const sel = state.selected && (state.selected === id || state.selected === src || (p.classList.contains('k-transfer') && state.selected === (sk.model.links.find(l => l.id === id) || {}).target));
      p.classList.toggle('dim', !(lvlOk && clsOk) || (!!state.selected && !sel) || (!!q && !hitNode(src)));
      p.classList.toggle('sel', !!sel);
    });
    box.querySelectorAll('.sk-node').forEach(g => {
      const id = g.getAttribute('data-id'), lvl = +g.getAttribute('data-level');
      const lvlOk = !A.trail.accountsById[id] || state.levels.has(lvl);
      g.classList.toggle('dim', !lvlOk || (!!q && A.trail.accountsById[id] && !hitNode(id)));
      g.classList.toggle('sel', state.selected === id);
    });
  }

  /* ---------- Places: where accounts are held (home branch from IFSC) and where cash was taken out (ATM / branch) ----------
   * The map is schematic: cities sit at their approximate coordinates; it is not a street map and says nothing about any person. */
  const cityKey = c => c.en;
  function cityDetails(key) {
    const r = A.places.find(p => cityKey(p.city) === key); if (!r) return '';
    const flowsIn = F.cityFlows(A, root.JM_DIRECTORY).filter(f => f.to.en === key && f.from.en !== key);
    const flowsOut = F.cityFlows(A, root.JM_DIRECTORY).filter(f => f.from.en === key && f.to.en !== key);
    return '<h2 style="margin:0;font-size:17px">' + esc(I.pick(r.city)) + ' <span class="pill low">' + esc(I.pick(r.state)) + '</span></h2>' +
      (r.accounts.length ? '<h3 class="d-h">' + t('plAcctsHere') + '</h3>' + S.table([t('rpColAcct'), t('plColBranch'), t('rpColRole')], r.accounts.map(a => ({ href: 'money-trail.html?focus=' + a.id, cells: [
        '<a href="money-trail.html?focus=' + a.id + '">' + esc(S.masked(A, a.id)) + '</a>', esc(I.pick(a.branch)) + '<div class="sub">PIN ' + esc(a.pin) + '</div>', 'L' + a.level + ' · ' + esc(S.roleLabel(S.accountRole(A, a.id)))] })), { cls: 'compact' }) : '') +
      (r.cash.length ? '<h3 class="d-h">' + t('plCashHere') + ' · ' + F.formatINR(r.cashTotal) + '</h3>' + S.table([t('time'), { label: t('amount'), num: true }, t('stPlace')], r.cash.map(c => [F.istShortTime(c.time),
        F.formatINR(c.amount), '<b>' + esc(I.pick(c.area)) + '</b><div class="sub">' + (c.kind === 'atm' ? 'ATM ' : '') + esc(c.code) + ' · ' + esc(S.masked(A, c.account)) + '</div>']), { cls: 'compact' }) +
        '<a class="card-link" style="margin:4px 0 0" href="requests.html?id=REQ-CCTV-' + S.masked(A, r.cash[0].account).slice(-4) + '">' + t('plCctvDraft') + '</a>' : '') +
      ((flowsIn.length || flowsOut.length) ? '<h3 class="d-h">' + t('plFlows') + '</h3>' + S.table([t('skFrom'), t('skTo'), { label: t('amount'), num: true }],
        flowsIn.concat(flowsOut).map(f => [esc(I.pick(f.from)), esc(I.pick(f.to)), F.formatINR(f.amount) + '<div class="sub">' + esc(f.txns.join(', ')) + '</div>']), { cls: 'compact' }) : '') +
      '<div class="note">' + esc(t('plNote')) + '</div>';
  }
  function placesFrame() {
    const rows = A.places.map(r => ({ id: 'city:' + cityKey(r.city), cls: 'pl-row', cells: [
      '<a href="#" class="pl-go" data-city="' + esc(cityKey(r.city)) + '"><b>' + esc(I.pick(r.city)) + '</b></a><div class="sub">' + esc(I.pick(r.state)) +
        (r.first ? ' · ' + F.istShortTime(r.first) + (r.last && r.last !== r.first ? '–' + F.istShortTime(r.last) : '') : '') + '</div>',
      r.accounts.length ? r.accounts.map(a => esc(S.masked(A, a.id))).join('<br>') : '—',
      r.cash.length ? '<b>' + F.formatINR(r.cashTotal) + '</b><div class="sub">' + r.cash.map(c => (c.kind === 'atm' ? 'ATM ' : '') + esc(c.code)).filter((v, i, arr) => arr.indexOf(v) === i).join(', ') + '</div>' : '—'] }));
    return '<div class="pl-wrap"><div class="graph-box pl-map" id="pl-map" role="img" aria-label="' + esc(t('plMapLabel')) + '"></div>' +
      '<div class="pl-table">' + S.table([t('plColCity'), t('plColAccts'), { label: t('plColCash'), num: true }], rows, { cls: 'compact', caption: t('viewPlaces') }) +
      '<div class="dt-foot">' + esc(t('plFoot')) + '</div></div></div>' +
      '<div class="legend"><span class="lg"><i class="lg-node" style="background:#b91c1c;border-radius:50%"></i>' + esc(t('plLgMule')) + '</span>' +
      '<span class="lg"><i class="lg-node" style="background:#1d4ed8;border-radius:50%"></i>' + esc(t('roleVictim')) + '</span>' +
      '<span class="lg"><i class="lg-node pl-cash-sw">₹</i>' + esc(t('plLgCash')) + '</span>' +
      '<span class="lg"><i class="lg-edge solid"></i>' + esc(t('plLgFlow')) + '</span><span class="lg"><i class="lg-edge dashed"></i>' + esc(t('linkProbable')) + '</span></div>';
  }
  function drawPlaces() {
    const box = document.getElementById('pl-map'); if (!box) return;
    const D = root.JM_DIRECTORY, W = Math.max(box.clientWidth, 280), H = Math.max(box.clientHeight, 260), pad = 46;
    const pts = A.places.map(r => ({ r, ll: D.cityCoords[r.city.en] })).filter(p => p.ll);
    const lats = pts.map(p => p.ll[0]), lons = pts.map(p => p.ll[1]);
    const kx = Math.cos(26.5 * Math.PI / 180); // keep east-west distances honest at Rajasthan's latitude
    const spanX = (Math.max.apply(null, lons) - Math.min.apply(null, lons)) * kx || 1, spanY = (Math.max.apply(null, lats) - Math.min.apply(null, lats)) || 1;
    const sc = Math.min((W - 2 * pad) / spanX, (H - 2 * pad) / spanY);
    const ox = (W - spanX * sc) / 2, oy = (H - spanY * sc) / 2;
    const xy = ll => [ox + (ll[1] - Math.min.apply(null, lons)) * kx * sc, oy + (Math.max.apply(null, lats) - ll[0]) * sc];
    const at = {}; pts.forEach(p => { at[p.r.city.en] = xy(p.ll); });
    const flows = F.cityFlows(A, D).filter(f => f.from.en !== f.to.en && at[f.from.en] && at[f.to.en]);
    const maxAmt = Math.max.apply(null, flows.map(f => f.amount).concat([1]));
    const radius = {}; pts.forEach(p => { radius[p.r.city.en] = 9 + 4 * p.r.accounts.length + (p.r.cash.length ? 5 : 0); });
    const paths = flows.map(f => {
      const [x1, y1] = at[f.from.en], [x2, y2] = at[f.to.en]; const mx = (x1 + x2) / 2 - (y2 - y1) * 0.18, my = (y1 + y2) / 2 + (x2 - x1) * 0.18;
      // End the curve at the edge of the destination circle and draw a fixed-size arrowhead pointing along the curve.
      const dx = x2 - mx, dy = y2 - my, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len, back = radius[f.to.en] + 3;
      const ex = x2 - ux * back, ey = y2 - uy * back, ah = 11, aw = 6;
      const tri = [ex, ey, ex - ux * ah - uy * aw, ey - uy * ah + ux * aw, ex - ux * ah + uy * aw, ey - uy * ah - ux * aw].map(v => v.toFixed(1));
      const w = 1.5 + 6 * f.amount / maxAmt, prob = f.cls.some(c => c !== 'confirmed');
      const label = I.pick(f.from) + ' → ' + I.pick(f.to) + ' · ' + F.formatINR(f.amount) + ' · ' + f.txns.join(', ');
      return '<g class="pl-flow" data-from="' + esc(f.from.en) + '" data-to="' + esc(f.to.en) + '"><title>' + esc(label) + '</title>' +
        '<path d="M' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' Q' + mx.toFixed(1) + ',' + my.toFixed(1) + ' ' + (ex - ux * ah * 0.6).toFixed(1) + ',' + (ey - uy * ah * 0.6).toFixed(1) + '"' +
        ' stroke-width="' + w.toFixed(1) + '"' + (prob ? ' stroke-dasharray="7 5"' : '') + '></path>' +
        '<polygon points="' + tri[0] + ',' + tri[1] + ' ' + tri[2] + ',' + tri[3] + ' ' + tri[4] + ',' + tri[5] + '"></polygon>' +
        '<text class="pl-amt" x="' + mx.toFixed(1) + '" y="' + my.toFixed(1) + '" text-anchor="middle">' + esc(F.formatINR(f.amount)) + '</text></g>';
    }).join('');
    const nodes = pts.map(p => {
      const r = p.r, [x, y] = at[r.city.en];
      const isVictim = r.accounts.some(a => a.level === 0), mule = r.accounts.some(a => A.rules[a.id] && A.rules[a.id].suspected);
      const rad = 9 + 4 * r.accounts.length, fill = isVictim ? '#1d4ed8' : mule ? '#b91c1c' : r.accounts.length ? '#64748b' : '#334155';
      const label = I.pick(r.city) + (r.state.en !== 'Rajasthan' ? ' (' + I.pick(r.state) + ')' : '');
      const tip = label + ' · ' + t('plAcctsN', { n: r.accounts.length }) + (r.cash.length ? ' · ' + t('plCashHere') + ' ' + F.formatINR(r.cashTotal) : '');
      return '<g class="pl-city" data-city="' + esc(r.city.en) + '" tabindex="0" role="button" aria-label="' + esc(tip) + '"><title>' + esc(tip) + '</title>' +
        '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + rad + '" fill="' + fill + '"></circle>' +
        (r.cash.length ? '<circle class="pl-cashring" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (rad + 5) + '"></circle><text class="pl-rupee" x="' + (x + rad + 4).toFixed(1) + '" y="' + (y - rad).toFixed(1) + '">₹</text>' : '') +
        '<text class="pl-lbl" x="' + (x > W - 90 ? x + rad : x < 90 ? x - rad : x).toFixed(1) + '" y="' + (y + rad + 15).toFixed(1) + '" text-anchor="' + (x > W - 90 ? 'end' : x < 90 ? 'start' : 'middle') + '">' + esc(label) + '</text></g>';
    }).join('');
    box.innerHTML = '<svg class="pl-svg" viewBox="0 0 ' + W + ' ' + H + '" width="100%" height="100%">' +
      '<text class="pl-schem" x="8" y="16">' + esc(t('plSchematic')) + '</text><text class="pl-schem" x="' + (W - 8) + '" y="16" text-anchor="end">N ↑</text>' + paths + nodes + '</svg>';
    const pick = key => { state.selected = 'city:' + key; applyPlacesHighlight(); renderDetails();
      if (typeof matchMedia === 'function' && matchMedia('(max-width: 699px)').matches) S.revealOnSmall(document.getElementById('details')); };
    box.querySelectorAll('.pl-city').forEach(g => {
      const key = g.getAttribute('data-city');
      g.addEventListener('click', e => { e.stopPropagation(); pick(key); });
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(key); } });
      g.addEventListener('mouseenter', () => applyPlacesHighlight(key)); g.addEventListener('mouseleave', () => applyPlacesHighlight());
      g.addEventListener('focus', () => applyPlacesHighlight(key)); g.addEventListener('blur', () => applyPlacesHighlight());
    });
    document.querySelectorAll('.pl-go').forEach(a => {
      const key = a.getAttribute('data-city');
      a.addEventListener('click', e => { e.preventDefault(); pick(key); });
      const tr = a.closest('tr'); tr.addEventListener('mouseenter', () => applyPlacesHighlight(key)); tr.addEventListener('mouseleave', () => applyPlacesHighlight());
      tr.addEventListener('click', e => { if (!e.target.closest('a')) pick(key); });
    });
    box.querySelector('svg').addEventListener('click', () => { state.selected = null; applyPlacesHighlight(); renderDetails(); });
    if (plRO && plRO.box !== box) { plRO.disconnect(); plRO = null; }
    if (!plRO && typeof ResizeObserver === 'function') {
      let last = box.clientWidth + 'x' + box.clientHeight, tmr = null;
      plRO = new ResizeObserver(() => { const b = document.getElementById('pl-map'); if (!b || state.view !== 'places') return;
        const now = b.clientWidth + 'x' + b.clientHeight; if (now === last) return; last = now; clearTimeout(tmr); tmr = setTimeout(drawPlaces, 120); });
      plRO.observe(box); plRO.box = box;
    }
    applyPlacesHighlight(); renderDetails();
  }
  let plRO = null;
  // Highlight one city (hover) or the selected one: its transfers, its circle and its table row.
  function applyPlacesHighlight(hoverKey) {
    const key = hoverKey || (state.selected && /^city:/.test(state.selected) ? state.selected.slice(5) : null);
    document.querySelectorAll('.pl-city').forEach(g => { const k = g.getAttribute('data-city'); g.classList.toggle('dim', !!key && k !== key); g.classList.toggle('sel', k === key); });
    document.querySelectorAll('.pl-flow').forEach(p => { const on = !key || p.getAttribute('data-from') === key || p.getAttribute('data-to') === key; p.classList.toggle('dim', !on); p.classList.toggle('hot', !!key && on); });
    document.querySelectorAll('.pl-table tr[data-id]').forEach(tr => tr.classList.toggle('on', !!key && tr.getAttribute('data-id') === 'city:' + key));
  }

  function drawGraph() {
    if (state.view === 'sankey') { if (cy) { cy.destroy(); cy = null; } drawSankey(); return; }
    if (state.view === 'places') { if (cy) { cy.destroy(); cy = null; } drawPlaces(); return; }
    if (cy) cy.destroy();
    cy = root.JMGraph.render(document.getElementById('cy'), A, { mode: state.view === 'relationship' ? 'relationship' : 'layered', method: state.method,
      onSelect: el => { state.selected = el ? el.id() : null; applyFilters(); renderDetails();
        if (el && typeof matchMedia === 'function' && matchMedia('(max-width: 699px)').matches) S.revealOnSmall(document.getElementById('details')); } });
    cy.style().selector('.hidden').style('display', 'none')
      .selector('.future').style({ 'opacity': 0.1 })
      .selector('.current').style({ 'line-color': '#0d9488', 'target-arrow-color': '#0d9488', 'border-color': '#0d9488', 'border-width': 5, 'width': 7 }).update();
    applyFilters();
    applyReplay();
    renderDetails();
  }

  function sankeyFrame() {
    const tt = A.alloc[state.method].totals, m = F.buildSankey(A.data, A.trail, A.alloc[state.method]);
    const diff = tt.victimLoss - m.sinkTotal;
    const sw = (c, txt, extra) => '<span class="lg"><i class="lg-node" style="background:' + c + (extra || '') + '"></i>' + esc(txt) + '</span>';
    return '<div class="sk-check ' + (Math.abs(diff) < 0.5 && !m.imbalance.length ? 'ok' : 'bad') + '">' + (Math.abs(diff) < 0.5 && !m.imbalance.length
        ? esc(t('skAdds', { cash: F.formatINR(tt.withdrawn), held: F.formatINR(tt.estTraceable), unres: F.formatINR(tt.unresolved), loss: F.formatINR(tt.victimLoss) }))
        : '✗ ' + esc(t('skNotAdds', { diff: F.formatINR(Math.abs(diff)) }))) + '</div>' +
      '<div class="sk-hint small muted">' + esc(t('skScroll')) + '</div>' +
      '<div class="graph-box sk-wrap" data-hscroll><div class="sk-box" id="sk-box"></div></div>' +
      '<div class="legend">' + sw('#64748b', t('skBandTransfer')) + '<span class="lg"><i class="lg-node sk-hatch-sw"></i>' + esc(t('skBandProbable')) + '</span>' +
        sw(SK_COLORS.cash, t('skCash')) + sw(SK_COLORS.held, t('skHeld')) + sw(SK_COLORS.unres, t('skUnres'), ';border:1px dashed #334155') +
        sw(SK_COLORS.victim, t('roleVictim')) + sw(SK_COLORS.mule, t('roleMule')) + sw(SK_COLORS.onTrail, t('roleOnTrail')) + '</div>';
  }

  function render() {
    stopTimer();
    const main = document.getElementById('main');
    main.innerHTML =
      '<div class="trail">' + leftPanel() +
        '<section class="card trail-center" aria-label="Graph">' +
          '<div class="card-h"><div><div class="breadcrumb">' + t('caseLabel') + ' ' + esc(A.data.case.id) + ' › ' + t('navTrail').replace(/^3 /, '') + (state.selected ? ' › ' + esc(state.selected.replace(/^A/, '****')) : '') + '</div>' +
          '<h2>' + (state.view === 'relationship' ? t('viewRelationship') : state.view === 'timeline' ? t('viewTimeline') : state.view === 'sankey' ? t('skTitle') : state.view === 'places' ? t('viewPlaces') : t('trailTitle')) + '</h2></div><a class="card-link" href="index.html">' + t('back') + '</a></div>' +
          '<div class="caption">' + esc(caption()) + '</div>' +
          (state.view === 'timeline' ? '<div id="replay">' + replayBar() + '</div>' : '') +
          (state.view === 'sankey' ? sankeyFrame() : state.view === 'places' ? placesFrame() :
          '<div class="graph-box"><div class="cy" id="cy"></div><div class="zoom"><button class="btn" id="zin" type="button" aria-label="Zoom in">+</button><button class="btn" id="zout" type="button" aria-label="Zoom out">−</button><button class="btn" id="zfit" type="button" aria-label="' + esc(t('gReset')) + '" title="' + esc(t('gReset')) + '">⤢</button>' +
            (state.view !== 'timeline' ? '<button class="btn" id="zflow" type="button" aria-pressed="' + (state.flow ? 'true' : 'false') + '" aria-label="' + esc(t('gMoving')) + '" title="' + esc(t('gMoving')) + '">▶₹</button>' : '') +
            '<button class="btn" id="zpng" type="button" aria-label="' + esc(t('gPng')) + '" title="' + esc(t('gPng')) + '">⤓</button></div>' +
            '<div class="g-hint">' + esc(t('gHelp')) + '</div></div>' +
          '<div class="legend">' + root.JMGraph.legendHtml(state.view === 'relationship') + '</div>') +
        '</section>' +
        '<section class="card panel details" id="details" aria-live="polite"></section>' +
      '</div>';
    I.applyStatic(main);
    wire();
    wireReplay();
    drawGraph();
  }

  function wire() {
    document.querySelectorAll('input[name="view"]').forEach(r => r.onchange = () => { state.view = r.value; render(); });
    document.querySelectorAll('[data-method]').forEach(b => b.onclick = () => { state.method = b.getAttribute('data-method'); render(); });
    document.querySelectorAll('input[name="level"]').forEach(c => c.onchange = () => { const l = Number(c.value); c.checked ? state.levels.add(l) : state.levels.delete(l); applyFilters(); });
    document.querySelectorAll('input[name="cls"]').forEach(c => c.onchange = () => { c.checked ? state.classes.add(c.value) : state.classes.delete(c.value); applyFilters(); });
    const s = document.getElementById('search');
    s.oninput = () => { state.search = s.value; applyFilters(); };
    document.getElementById('reset').onclick = () => {
      state.levels = new Set(levelsPresent); state.classes = new Set(['confirmed', 'probable', 'unresolved']); state.search = ''; state.selected = null; render();
    };
    if (state.view === 'sankey' || state.view === 'places') return;
    document.getElementById('zin').onclick = () => cy.zoom({ level: cy.zoom() * 1.2, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
    document.getElementById('zout').onclick = () => cy.zoom({ level: cy.zoom() / 1.2, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
    document.getElementById('zfit').onclick = () => cy.resetLayout();
    const zf = document.getElementById('zflow');
    if (zf) { zf.onclick = () => { state.flow = !state.flow; const ok = cy.flowAnimation(state.flow); zf.setAttribute('aria-pressed', String(state.flow && ok)); if (!ok) state.flow = false; };
      if (state.flow) cy.flowAnimation(true); }
    document.getElementById('zpng').onclick = () => cy.downloadPng('JaanchMitra_' + A.data.case.id.replace(/\//g, '-') + '_' + state.view + '.png');
  }

  S.renderShell('trail', render);
  render();
})(typeof self !== 'undefined' ? self : this);
