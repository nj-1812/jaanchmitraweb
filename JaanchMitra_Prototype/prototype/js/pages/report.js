/*
 * Case report: one DRAFT document assembled from the same analysis every page uses.
 * On screen it is shown one page at a time (no scrolling); printing outputs every page.
 * Nothing here decides anything: it restates computed figures with their evidence and limits.
 */
(function (root) {
  const I = root.JMI18N; const t = I.t;
  const S = root.JMShell; const esc = S.esc;
  const F = root.JM;
  const A = S.analyse();
  const drafts = F.buildRequests(A, root.JM_DIRECTORY);
  // IST wall time with its offset, so istDateTime shows the real local time.
  const GENERATED = new Date(Date.now() + 330 * 60000).toISOString().slice(0, 19) + '+05:30';

  const params = new URLSearchParams(location.search);
  const state = { page: Math.max(1, parseInt(params.get('p'), 10) || 1), officer: { name: '', designation: '' }, reviewed: false, graphPng: null, graphLang: null };

  /* ---------- small helpers ---------- */
  const m = id => esc(S.masked(A, id));
  const dur = mins => t('durHM', { h: Math.floor(mins / 60), m: mins % 60 });
  const bandLabel = b => t('band' + b.charAt(0).toUpperCase() + b.slice(1));
  const table = (heads, rows, cls) => '<table class="rp-t ' + (cls || '') + '"><thead><tr>' + heads.map(h => '<th>' + h + '</th>').join('') + '</tr></thead><tbody>' +
    rows.map(r => '<tr>' + r.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
  const rowRef = r => r ? esc(r.file) + ' ' + t('row') + ' ' + r.row : '—';
  const tot = () => A.alloc.FIFO.totals;
  const chunk = (arr, n) => { const out = []; for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n)); return out.length ? out : [[]]; };

  function savedMatches() {
    let list = [];
    try { list = JSON.parse(localStorage.getItem('jm-complaints') || '[]'); } catch (e) { return []; }
    return list.filter(r => F.crossCheckComplaint && F.crossCheckComplaint(r.values, A.data).length).map(r => r.id);
  }

  /* ---------- sections; each returns one or more pages of HTML ---------- */
  function summary() {
    const c = A.data.case, T = tot();
    const root0 = A.trail.rootTxn;
    const times = A.trail.edges.map(e => Date.parse(e.txn.time)).concat(A.trail.cashOuts.map(x => Date.parse(x.txn.time)));
    const spanMin = Math.round((Math.max.apply(null, times) - Date.parse(root0.time)) / 60000);
    const reached = Object.keys(A.trail.levels).length - 1;
    const sus = A.rulesList.filter(r => r.suspected).sort((a, b) => b.score - a.score);
    const cashAccts = new Set(A.trail.cashOuts.map(x => x.account));
    const traceAccts = Object.keys(A.alloc.FIFO.perAccount).filter(id => A.alloc.FIFO.perAccount[id].estTraceable > 0);
    const mt = A.match.matches[0];
    const findings = [
      t('rpF1', { loss: F.formatINR(T.victimLoss), n: reached, hops: A.trail.maxLevel, dur: dur(spanMin) }),
      t('rpF2', { n: sus.length, list: sus.map(r => S.masked(A, r.account)).join(', ') }),
      mt ? t('rpF3', { vpa: mt.evidenceValue, acct: S.masked(A, mt.account) }) : null,
      t('rpF4', { amt: F.formatINR(T.withdrawn), n: cashAccts.size }),
      t('rpF5', { est: F.formatINR(T.estTraceable), lifo: F.formatINR(A.alloc.LIFO.totals.estTraceable), n: traceAccts.length }),
    ].concat(A.trail.unresolved.map(u => t('findUnresolved', { amt: F.formatINR(u.txn.amount), acct: S.masked(A, u.account) })))
      .filter(Boolean);
    const tile = (v, k, cls) => '<div class="rp-tile ' + (cls || '') + '"><b>' + v + '</b><span>' + k + '</span></div>';
    return [
      '<div class="rp-cover"><div><h1>' + esc(I.pick(c.title)) + '</h1>' +
        '<div class="small">' + esc(I.pick(c.station)) + ' · FIR ' + esc(c.firNo) + ' · NCRP ' + esc(c.ncrpAck) + '</div></div>' +
        '<div class="rp-stamp">DRAFT</div></div>' +
      '<h3>' + t('rpKeyFigures') + '</h3><div class="rp-tiles">' +
        tile(F.formatINR(T.victimLoss), t('kpiLoss'), 'red') +
        tile(F.formatINR(T.estTraceable), t('kpiTraceable') + ' (FIFO)', 'teal') +
        tile(F.formatINR(T.withdrawn), t('rpWithdrawn')) +
        tile(F.formatINR(T.unresolved), t('kpiUnresolved')) +
        tile(reached + ' · ' + A.trail.maxLevel, t('rpReach') + ' · ' + t('kpiHops')) +
        tile(String(sus.length), t('kpiSuspected'), 'red') + '</div>' +
      '<h3>' + t('rpFindings') + '</h3><ol class="rp-find">' + findings.map(f => '<li>' + esc(f) + '</li>').join('') + '</ol>' +
      '<div class="rp-box"><b>' + t('rpIsNot') + '.</b> ' + esc(t('rpIsNotText')) + '</div>'
    ];
  }

  function complaint() {
    const c = A.data.case, r0 = A.trail.rootTxn, victim = A.trail.accountsById[r0.from], ev = A.data.digital.websiteEvidence;
    const st = F.intakeStatus(A.data, A.trail);
    const linked = savedMatches();
    const kv = [
      [t('stationLabel'), esc(I.pick(c.station))], ['FIR', esc(c.firNo)], ['NCRP', esc(c.ncrpAck)],
      [t('cpReceived'), F.istDateTime(c.complaintReceived)], [t('kpiLoss'), '<b>' + F.formatINR(r0.amount) + '</b>'],
      [t('cpPaidAt'), F.istDateTime(r0.time)], ['UTR/RRN', esc(r0.senderRow.rrn)],
      [t('cpVictimAcct'), esc(victim.masked) + ' · ' + esc(victim.bank) + ' · IFSC ' + esc(victim.ifsc)],
      [t('upiOnSite'), esc(ev.vpas.join(', '))], [t('phoneOnSite'), esc(ev.phones.join(', '))], [t('kpiDomain'), esc(A.data.digital.domain.name)]
    ];
    return ['<p>' + esc(I.pick(c.summary)) + '</p>' +
      '<dl class="rp-kv">' + kv.map(([k, v]) => '<dt>' + k + '</dt><dd>' + v + '</dd>').join('') + '</dl>' +
      '<p class="rp-red">' + esc(t('cpDelay', { t: dur(st.delayMinutes) })) + '</p>' +
      (linked.length ? '<p class="small">' + esc(t('rpLinkedCmp', { list: linked.join(', ') })) + '</p>' : '')];
  }

  function timeline() {
    const rows = A.timeline.map(e => [F.istDateTime(e.time), e.kind === 'observation' ? '<i>' + t('kindObs') + '</i>' : t('kindEvent'), S.eventText(A, e), esc(e.source)]);
    return chunk(rows, 8).map((part, i) => (i === 0 ? '<p class="small muted">' + esc(t('rpTlNote')) + '</p>' : '') + table([t('rpColTime'), t('rpColKind'), t('rpColWhat'), t('rpColSource')], part, 'dense'));
  }

  function trail() {
    const T = tot();
    const img = state.graphPng ? '<img class="rp-graph" alt="' + esc(t('rpS4')) + '" src="' + state.graphPng + '">' : '<div class="rp-graph wait">' + esc(t('rpDrawing')) + '</div>';
    return ['<p>' + esc(t('caption', { loss: F.formatINR(T.victimLoss), hops: A.trail.maxLevel, accounts: Object.keys(A.trail.levels).length - 1,
      est: F.formatINR(T.estTraceable), method: 'FIFO', unres: F.formatINR(T.unresolved) })) + '</p>' + img +
      '<div class="rp-legend legend">' + root.JMGraph.legendHtml(false) + '</div><p class="small muted">' + esc(t('rpGraphNote')) + '</p>',
      sankeyPage()];
  }

  // Where the money went: the same Sankey as the money-trail page (FIFO), static for print, with the adds-up check.
  function sankeyPage() {
    if (!F.buildSankey) return '';
    const tt = A.alloc.FIFO.totals, model = F.buildSankey(A.data, A.trail, A.alloc.FIFO);
    F.layoutSankey(model, { width: 780, height: 330, gap: 18, labelRoom: 150, padTop: 10, padBottom: 10 });
    const ok = Math.abs(tt.victimLoss - model.sinkTotal) < 0.5 && !model.imbalance.length;
    const svg = S.sankeySvg(A, model, 780, 330, t('skTitle'), false).replace(/ tabindex="0" role="button"/g, '').replace('<svg ', '<svg preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto" ');
    return '<h3>' + esc(t('skTitle')) + '</h3><p>' + esc(t('skCaption', { loss: F.formatINR(tt.victimLoss), cash: F.formatINR(tt.withdrawn), held: F.formatINR(tt.estTraceable), unres: F.formatINR(tt.unresolved), method: 'FIFO' })) + '</p>' +
      '<p class="' + (ok ? 'rp-ok' : 'rp-red') + '">' + esc(ok ? t('skAdds', { cash: F.formatINR(tt.withdrawn), held: F.formatINR(tt.estTraceable), unres: F.formatINR(tt.unresolved), loss: F.formatINR(tt.victimLoss) }) : t('skNotAdds', { diff: F.formatINR(Math.abs(tt.victimLoss - model.sinkTotal)) })) + '</p>' +
      '<div class="rp-sankey">' + svg + '</div><p class="small muted">' + esc(t('estimateNote')) + '.</p>';
  }

  function transfers() {
    const rows = A.trail.edges.map(e => [esc(e.txn.id), m(e.txn.from) + ' → ' + m(e.txn.to), F.formatINR(e.txn.amount), F.istShortTime(e.txn.time),
      esc(e.txn.senderRow.rrn || '—'), '<span class="rp-lc ' + e.link.cls + '">' + esc(S.linkLabel(e.link.cls)) + '</span>', rowRef(e.txn.senderRow) + ' · ' + rowRef(e.txn.receiverRow)]);
    const cash = A.trail.cashOuts.map(x => { const p = x.txn.place;
      return [esc(x.txn.id), m(x.account), F.formatINR(x.txn.amount), F.istDateTime(x.txn.time),
        p ? '<b>' + esc(I.pick(p.area)) + ', ' + esc(I.pick(p.city)) + '</b><br><span class="muted">' + (p.kind === 'atm' ? 'ATM ' : '') + esc(p.code) + '</span>' : '—', rowRef(x.txn.senderRow)]; });
    const places = A.places.map(r => [esc(I.pick(r.city)) + '<br><span class="muted">' + esc(I.pick(r.state)) + '</span>',
      r.accounts.map(a => m(a.id) + ' · ' + esc(I.pick(a.branch))).join('<br>') || '—',
      r.cash.length ? F.formatINR(r.cashTotal) + '<br><span class="muted">' + r.cash.map(c => (c.kind === 'atm' ? 'ATM ' : '') + esc(c.code) + ' ' + F.istShortTime(c.time)).join(', ') + '</span>' : '—']);
    return chunk(rows, 8).map(part => table([t('rpColId'), t('rpColFromTo'), t('amount'), t('time'), 'UTR/RRN', t('linkClass'), t('rpColRows')], part, 'dense'))
      .concat(chunk(cash, 8).map(part => '<h3>' + esc(t('rpCash')) + '</h3>' + table([t('rpColId'), t('rpColAcct'), t('amount'), t('time'), t('stPlace'), t('rpColRows')], part, 'dense')))
      .concat(['<h3>' + esc(t('viewPlaces')) + '</h3>' + table([t('plColCity'), t('plColAccts'), t('plColCash')], places, 'dense') + '<p class="small muted">' + esc(t('plNote')) + '</p>']);
  }

  function accounts() {
    const ids = Object.keys(A.trail.levels).sort((a, b) => A.trail.levels[a] - A.trail.levels[b]);
    const rows = ids.map(id => {
      const a = A.trail.accountsById[id], r = A.rules[id], role = S.accountRole(A, id);
      const f = A.alloc.FIFO.perAccount[id], l = A.alloc.LIFO.perAccount[id];
      const br = F.branchOf(root.JM_DIRECTORY, a.ifsc);
      return [m(id) + ' <span class="muted">L' + A.trail.levels[id] + '</span>', esc(a.bank) + (br ? '<br><span class="muted">' + esc(I.pick(br.city)) + '</span>' : ''), esc(S.roleLabel(role)),
        r ? r.score + ' · ' + esc(bandLabel(r.band)) : '—', r && r.hits.length ? r.hits.map(h => h.rule).join(' ') : '—',
        f ? F.formatINR(f.victimAttributed) : '—', role === 'victim' || !f ? '—' : F.formatINR(f.estTraceable) + ' / ' + F.formatINR(l.estTraceable)];
    });
    return [table([t('rpColAcct'), t('bank'), t('rpColRole'), t('rpColScore'), t('rpColRules'), t('victimAttributed'), t('rpColEst')], rows) +
      '<p class="small muted">' + esc(t('estimateNote')) + '.</p>'];
  }

  function flagged() {
    const sus = A.rulesList.filter(r => r.suspected).sort((a, b) => b.score - a.score);
    const blocks = sus.map(r => {
      const a = A.trail.accountsById[r.account];
      return { lines: r.hits.length + 1, html: '<div class="rp-acct"><div class="rp-acct-h">A/c ' + m(r.account) + ' · ' + esc(a.bank) + ' · ' + esc(bandLabel(r.band)) + ' ' + r.score + '/100</div><ul>' +
        r.hits.map(h => '<li><b>' + h.rule + ' ' + esc(t(h.rule)) + ' (+' + h.weight + ')</b> — ' + esc(S.ruleWhy(h)) +
          ' <span class="muted">' + esc(t('rpEvRows', { list: h.evidence.slice(0, 3).map(e => e.file ? e.file + ' ' + t('row') + ' ' + e.row : e.txn).join('; ') + (h.evidence.length > 3 ? ' …' : '') })) + '</span></li>').join('') + '</ul></div>' };
    });
    // Split so each screen page holds about 15 lines; a block is never split.
    const pages = []; let cur = '', used = 0;
    blocks.forEach(b => { if (used && used + b.lines > 15) { pages.push(cur); cur = ''; used = 0; } cur += b.html; used += b.lines; });
    if (cur) pages.push(cur);
    return pages;
  }

  function website() {
    const d = A.data.digital, age = F.infraAgeAtPayment(A.data, A.trail);
    const lk = (v, src, at, kind) => esc(v) + ' <span class="muted">· ' + esc(src) + (at ? ' · ' + F.istDateTime(at) : '') + (kind ? ' · ' + t(kind === 'observation' ? 'kindObs' : 'kindEvent') : '') + '</span>';
    const mt = A.match.matches[0];
    const rows = [
      [t('kpiDomain'), '<b>' + esc(d.domain.name) + '</b>'],
      [t('registrar'), esc(d.domain.registrar) + ' (' + esc(d.domain.reseller) + ') · ' + t('abuse') + ': ' + esc(d.domain.abuseContact)],
      [t('registered'), lk(F.istDateTime(d.domain.created.value), d.domain.created.source, null, 'event') + '<br>' + esc(t('domainAgeLine', { age: t('durDH', { d: Math.floor(age.domainMinutes / 1440), h: Math.floor(age.domainMinutes % 1440 / 60), m: age.domainMinutes % 60 }) }))],
      [t('certCard'), lk(F.istDateTime(d.certificate.validFrom.value), d.certificate.validFrom.source, null, 'event') + '<br>' + t('sans') + ': ' + esc(d.certificate.sans.join(', '))],
      ['DNS', d.dns.map(x => lk(x.type + ' ' + x.value, x.source, x.observedAt, 'observation')).slice(0, 2).join('<br>')],
      ['IP · ASN', esc(d.ip.address) + ' · ' + esc(d.ip.asn) + ' ' + esc(d.ip.asnName) + ' · ' + t('hostType') + ': ' + esc(d.ip.type) + ' · ' + t('torVpn') + ': ' + (d.ip.tor || d.ip.vpn ? t('yes') : t('no'))],
      [t('indicativeLoc'), lk(I.pick(d.ip.indicativeLocation.value), d.ip.indicativeLocation.source, d.ip.lookedUpAt, 'observation')],
      [t('evidenceCard'), esc(d.websiteEvidence.file) + ' · ' + esc(I.pick(d.websiteEvidence.suppliedBy)) + '<br>UPI: ' + esc(d.websiteEvidence.vpas.join(', ')) + ' · ' + esc(d.websiteEvidence.phones.join(', '))],
      [t('rpColWhat'), mt ? '<b>' + esc(t('matchFound', { acct: S.masked(A, mt.account), vpa: mt.accountValue })) + '</b>' : esc(t('noMatch'))]
    ];
    return [table([t('rpItem'), t('rpValue')], rows.map(([k, v]) => [k, v]), 'kvt') + '<div class="rp-box">' + esc(t('rpNotIdentity')) + '</div>'];
  }

  function requests() {
    const typeKey = { bankHold: 'reqTypeBankHold', bankStatement: 'reqTypeBankStatement', registrar: 'reqTypeRegistrar', host: 'reqTypeHost', certin: 'reqTypeCertIn', cctv: 'reqTypeCctv' };
    const rows = drafts.map(d => [esc(d.id), esc(t(typeKey[d.type])), esc(d.recipient.name), esc(d.identifiers.slice(0, 1).map(i => i.label + ': ' + i.value).join('')) + (d.estimate ? ' · ' + F.formatINR(d.estimate) : ''), esc(t('rpNotSent'))]);
    const next = F.priorityList(A.alloc.FIFO, A.trail).map(p => t('actHold', { acct: S.masked(A, p.account), amt: F.formatINR(p.estTraceable), method: 'FIFO' }))
      .concat(A.trail.unresolved.map(u => t('actStatement', { bank: A.trail.accountsById[u.account].bank, acct: S.masked(A, u.account) })))
      .concat([t('actCertIn', { domain: A.data.digital.domain.name })]);
    const o = state.officer;
    return ['<h3>' + t('rpDraftsHead') + '</h3>' + table(['ID', t('rpColKind'), t('chk_recipient'), t('rpValue'), t('rpStatus')], rows, 'dense') +
      '<h3>' + t('rpNextHead') + '</h3><ol class="rp-find">' + next.map(s => '<li>' + esc(s) + '</li>').join('') + '</ol>',
      '<h3>' + t('rpBefore') + '</h3><ul class="checks big">' + beforeChecks().map(c => '<li class="' + (c.ok ? 'ok' : 'bad') + '"><span aria-hidden="true">' + (c.ok ? '✓' : '✗') + '</span><span>' + esc(c.text) + '</span></li>').join('') + '</ul>' +
      '<h3>' + t('rpSignoff') + '</h3><div class="rp-sign"><div>' + (o.name ? esc(o.name) : '<span class="ph">[' + esc(t('officerName')) + ']</span>') + ' · ' +
        (o.designation ? esc(o.designation) : '<span class="ph">[' + esc(t('officerDesignation')) + ']</span>') + '</div>' +
        '<div class="rp-sign-line">' + esc(t('rpSignLine')) + '</div><div class="small ' + (state.reviewed ? '' : 'rp-red') + '">' + (state.reviewed ? '✓ ' + esc(t('rpReviewedYes')) : '✗ ' + esc(t('rpReviewedNo'))) + '</div></div>'];
  }

  function method() {
    const rules = Object.keys(F.WEIGHTS).map(k => '<li><b>' + k + ' ' + esc(t(k)) + '</b> +' + F.WEIGHTS[k] + '</li>').join('');
    const files = A.data.accounts.filter(a => A.trail.levels[a.id] !== undefined).map(a => [m(a.id), esc(a.bank), a.statement.available ? esc(a.statement.file) : '—',
      a.statement.available ? '✓ ' + esc(t('stAvailable')) : '<span class="rp-red">✗ ' + esc(t('stMissing')) + '</span>']);
    return ['<h3>' + esc(t('rpRulesHead')) + '</h3><ul class="rp-rules">' + rules + '</ul>' +
      '<p class="small">' + esc(t('rpLinkRules')) + '</p><p class="small">' + esc(t('rpFifo')) + ' ' + esc(t('rpWindow')) + '</p>' +
      '<div class="rp-box">' + esc(t('rpNoAi')) + '</div>' +
      '<h3>' + t('rpSources') + '</h3>' + table([t('rpColAcct'), t('bank'), 'File', t('rpColSource')], files, 'dense')];
  }

  function beforeChecks() {
    const st = F.intakeStatus(A.data, A.trail);
    const probable = A.trail.edges.filter(e => e.link.cls === 'probable').length;
    return [
      { ok: st.missing.length === 0, text: t('rpChkStmt', { r: st.received.length, n: st.trailAccounts }) },
      { ok: probable === 0, text: t('rpChkProb', { n: probable }) },
      { ok: tot().unresolved === 0, text: t('rpChkUnres', { amt: F.formatINR(tot().unresolved) }) },
      { ok: !!state.officer.name.trim(), text: t('chk_officerName') },
      { ok: state.reviewed, text: t('rpChkReviewed') }
    ];
  }

  const SECTIONS = [['rpS1', summary], ['rpS2', complaint], ['rpS3', timeline], ['rpS4', trail], ['rpS5', transfers], ['rpS6', accounts],
    ['rpS7', flagged], ['rpS8', website], ['rpS9', requests], ['rpS10', method]];

  function buildPages() {
    const pages = [];
    SECTIONS.forEach(([key, fn], si) => fn().forEach((html, i) => pages.push({ key, si, cont: i > 0, html })));
    return pages;
  }

  function pageHtml(p, i, n) {
    return '<article class="rp-page' + (i + 1 === state.page ? ' on' : '') + '" data-p="' + (i + 1) + '">' +
      '<header class="rp-head"><span>JaanchMitra · ' + esc(t('caseLabel')) + ' ' + esc(A.data.case.id) + '</span><span class="rp-draft">DRAFT</span></header>' +
      '<h2>' + (p.si + 1) + '. ' + esc(t(p.key)) + (p.cont ? ' <span class="muted">' + esc(t('rpContinued')) + '</span>' : '') + '</h2>' +
      '<div class="rp-body">' + p.html + '</div>' +
      '<footer class="rp-foot"><span>' + esc(t('rpFoot')) + '</span><span>' + esc(t('rpGenerated', { t: F.istDateTime(GENERATED) })) + ' · ' + esc(t('rpPageFoot', { p: i + 1, n })) + '</span></footer></article>';
  }

  /* ---------- page layout ---------- */
  function render() {
    const pages = buildPages(); const n = pages.length;
    state.page = Math.min(Math.max(1, state.page), n);
    const firstPage = {}; pages.forEach((p, i) => { if (firstPage[p.key] === undefined) firstPage[p.key] = i + 1; });
    const cur = pages[state.page - 1];
    const toc = SECTIONS.map(([key], si) => '<a class="rp-toc' + (cur.key === key ? ' on' : '') + '" href="?p=' + firstPage[key] + '" data-p="' + firstPage[key] + '">' +
      '<span>' + (si + 1) + '. ' + esc(t(key)) + '</span><span class="muted">' + firstPage[key] + '</span></a>').join('');
    const chk = (ok, s) => '<li class="' + (ok ? 'ok' : 'bad') + '"><span aria-hidden="true">' + (ok ? '✓' : '✗') + '</span><span>' + esc(s) + '</span></li>';
    const o = state.officer;
    const main = document.getElementById('main');
    main.innerHTML = '<div class="rep">' +
      '<section class="card panel"><div class="breadcrumb">' + t('caseLabel') + ' ' + esc(A.data.case.id) + ' › ' + t('reportTab') + '</div>' +
        '<div class="tabs"><a class="tab" href="requests.html">' + t('reqTitle') + '</a><span class="tab on">' + t('reportTab') + '</span></div>' +
        '<h3>' + t('rpContents') + '</h3><nav class="rp-tocs" aria-label="' + esc(t('rpContents')) + '">' + toc + '</nav></section>' +
      '<section class="card rp-center"><div class="card-h"><h2>' + esc(t('rpTitle')) + '</h2>' +
        '<div class="pager rp-pager"><button class="btn" id="pg-prev" type="button"' + (state.page <= 1 ? ' disabled' : '') + '>' + t('prev') + '</button>' +
        '<span>' + esc(t('rpPageFoot', { p: state.page, n })) + '</span><button class="btn" id="pg-next" type="button"' + (state.page >= n ? ' disabled' : '') + '>' + t('next') + '</button></div>' +
        '<button class="btn primary" id="print" type="button">' + t('print') + '</button></div>' +
        '<div class="rp-stage" id="rp-stage">' + pages.map((p, i) => pageHtml(p, i, n)).join('') + '</div></section>' +
      '<section class="card panel details"><div class="officer"><h3>' + t('rpPreparedBy') + '</h3>' +
        '<label class="fld">' + t('officerName') + '<input id="o-name" value="' + esc(o.name) + '" autocomplete="off"></label>' +
        '<label class="fld">' + t('officerDesignation') + '<input id="o-desig" value="' + esc(o.designation) + '" autocomplete="off"></label>' +
        '<label class="opt"><input id="o-rev" type="checkbox"' + (state.reviewed ? ' checked' : '') + '> ' + t('rpReviewLabel') + '</label></div>' +
        '<h3>' + t('rpBefore') + '</h3><ul class="checks">' +
          beforeChecks().map(c => chk(c.ok, c.text)).join('') + '</ul>' +
        '<div class="small muted">' + esc(t('rpPrintNote', { n })) + '</div><div class="small muted">' + esc(t('rpLangNote')) + '</div>' +
        '<div class="note">' + esc(t('officerDecides')) + '</div></section></div>';
    I.applyStatic(main);
    const go = p => { state.page = p; try { history.replaceState(null, '', '?p=' + p); } catch (e) { /* file:// */ } render(); };
    main.querySelectorAll('.rp-toc').forEach(a => a.addEventListener('click', e => { e.preventDefault(); go(+a.getAttribute('data-p')); S.revealOnSmall(document.querySelector('.rp-center')); }));
    document.getElementById('pg-prev').onclick = () => go(state.page - 1);
    document.getElementById('pg-next').onclick = () => go(state.page + 1);
    document.getElementById('print').onclick = () => root.print();
    const nm = document.getElementById('o-name'), dg = document.getElementById('o-desig'), rv = document.getElementById('o-rev');
    nm.addEventListener('change', () => { state.officer.name = nm.value; render(); });
    dg.addEventListener('change', () => { state.officer.designation = dg.value; render(); });
    rv.addEventListener('change', () => { state.reviewed = rv.checked; render(); });
    if (state.graphLang !== I.getLang()) drawGraph();
  }

  // Draw the layered trail once, off screen, and keep it as an image so it prints with the report.
  let drawing = false;
  function drawGraph() {
    if (drawing || !root.cytoscape) return; drawing = true;
    const lang = I.getLang();
    const box = document.createElement('div');
    box.style.cssText = 'position:fixed;left:-12000px;top:0;width:1000px;height:520px;';
    document.body.appendChild(box);
    const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    ready.then(() => {
      const cy = root.JMGraph.render(box, A, { mode: 'layered', method: 'FIFO' });
      setTimeout(() => {
        try { state.graphPng = cy.png({ full: true, scale: 2, bg: '#ffffff' }); state.graphLang = lang; } catch (e) { /* leave placeholder */ }
        cy.destroy(); box.remove(); drawing = false;
        if (I.getLang() !== lang) { drawGraph(); return; }
        render();
      }, 250);
    });
  }

  S.renderShell('report', render);
  render();
})(typeof self !== 'undefined' ? self : this);
