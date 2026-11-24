/* Dashboard page: case summary, graph-first money trail, key findings, next steps, timeline. */
(function (root) {
  const I = root.JMI18N; const t = I.t;
  const S = root.JMShell; const esc = S.esc;
  const F = root.JM;
  const A = S.analyse();
  const METHOD = 'FIFO';
  let cy = null;

  function kpi(cls, value, label, sub) {
    return '<div class="card kpi ' + cls + '"><div class="l">' + label + '</div><div class="v">' + value + '</div>' + (sub ? '<div class="s">' + sub + '</div>' : '') + '</div>';
  }

  function caption() {
    const alloc = A.alloc[METHOD].totals;
    return t('caption', { loss: F.formatINR(alloc.victimLoss), hops: A.trail.maxLevel, accounts: Object.keys(A.trail.levels).length - 1,
      est: F.formatINR(alloc.estTraceable), method: METHOD, unres: F.formatINR(alloc.unresolved) });
  }

  // Key findings as a table: what was found · the figure · what it rests on. Each row opens its detail page.
  function findingsHtml() {
    const sus = A.rulesList.filter(r => r.suspected);
    const m = A.match.matches[0];
    const un = A.trail.unresolved[0];
    const cashPlaces = A.places.filter(p => p.cashTotal > 0);
    const go = (href, text) => '<a href="' + href + '">' + text + '</a>';
    const rows = [
      { href: 'money-trail.html', cells: [go('money-trail.html', '<span class="ico red" aria-hidden="true">!</span><span title="' + esc(t('fdMules')) + '">' + esc(t('fdMules')) + '</span>'), '<b>' + sus.length + '</b>', esc(t('fdMulesBasis'))] }
    ];
    if (m) rows.push({ href: 'money-trail.html?view=relationship&focus=' + m.account, cells: [go('money-trail.html?view=relationship&focus=' + m.account, '<span class="ico teal" aria-hidden="true">@</span><span title="' + esc(t('fdLink')) + '">' + esc(t('fdLink')) + '</span>'), esc(S.masked(A, m.account)), esc(t('fdLinkBasis'))] });
    if (cashPlaces.length) rows.push({ href: 'money-trail.html?view=places', cells: [go('money-trail.html?view=places', '<span class="ico grey" aria-hidden="true">₹</span><span title="' + esc(t('fdCash')) + '">' + esc(t('fdCash')) + '</span>'), '<b>' + F.formatINR(cashPlaces.reduce((s, p) => s + p.cashTotal, 0)) + '</b>', esc(cashPlaces.map(p => I.pick(p.city)).join(', '))] });
    if (un) rows.push({ href: 'money-trail.html?focus=' + un.account, cells: [go('money-trail.html?focus=' + un.account, '<span class="ico grey" aria-hidden="true">?</span><span title="' + esc(t('fdMissing')) + '">' + esc(t('fdMissing')) + '</span>'), F.formatINR(un.txn.amount), esc(S.masked(A, un.account) + ' · ' + A.trail.accountsById[un.account].bank)] });
    return S.table([t('fdColFinding'), { label: t('fdColFigure'), num: true }, t('fdColBasis')], rows, { cls: 'compact', caption: t('keyFindings') });
  }


  // Next steps as a table: step · estimate · bank. The top one shows here; the rest are on the Requests page.
  function actionsHtml() {
    const p = root.JM.priorityList(A.alloc[METHOD], A.trail)[0];
    if (!p) return '';
    const acct = A.trail.accountsById[p.account];
    const href = 'requests.html?id=REQ-HOLD-' + acct.masked.slice(-4);
    return S.table([t('fdColStep'), { label: t('fdColEst'), num: true }, t('fdColWhere')], [{ href, cells: [
      '<a href="' + href + '">' + esc(t('actHoldShort', { acct: acct.masked })) + '</a>', '<b>' + F.formatINR(p.estTraceable) + '</b>',
      esc(acct.bank) + '<div class="sub">' + esc(S.branchText(root.JM.branchOf(root.JM_DIRECTORY, acct.ifsc))) + '</div>'] }], { cls: 'compact', caption: t('actions') });
  }


  function timelineHtml() {
    const tl = A.timeline;
    const pickFirst = type => tl.find(e => e.type === type);
    const chosen = [pickFirst('domainCreated'), pickFirst('certValidFrom'), pickFirst('victimPayment'),
      tl.find(e => e.type === 'transfer' && e.to && A.trail.cashOutAccounts.indexOf(e.to) !== -1),
      pickFirst('cashOut'), tl.find(e => e.linkClass === 'unresolved'), pickFirst('dnsObserved')].filter(Boolean);
    return '<div class="tl" style="grid-template-columns: repeat(' + chosen.length + ', 1fr)">' + chosen.map(e => {
      let dot = '', desc = '';
      if (e.type === 'domainCreated') { desc = t('evDomainCreated') + '<br>' + esc(e.ref); }
      else if (e.type === 'certValidFrom') { desc = t('evCertValidFrom') + '<br>' + esc(e.ref); }
      else if (e.type === 'victimPayment') { dot = 'money'; desc = t('evVictimPayment') + '<br>' + F.formatINR(e.amount); }
      else if (e.type === 'transfer' && e.linkClass === 'unresolved') { dot = 'unres'; desc = t('evUnresolved') + '<br>' + F.formatINR(e.amount) + ' → ' + esc(S.masked(A, e.to)); }
      else if (e.type === 'transfer') { dot = 'money'; desc = t('evTransfer') + '<br>' + F.formatINR(e.amount) + ' → ' + esc(S.masked(A, e.to)); }
      else if (e.type === 'cashOut') { dot = 'cash'; desc = t('evCashOut') + '<br>' + F.formatINR(e.amount) + ' · ' + esc(S.masked(A, e.from)); }
      else if (e.type === 'dnsObserved') { dot = 'obs'; desc = t('evDnsObserved') + '<br>' + esc(e.ref); }
      const dateNote = e.time.slice(0, 10) !== A.trail.rootTxn.time.slice(0, 10) ? ' <span class="tl-src">' + e.time.slice(0, 10) + '</span>' : '';
      return '<div class="tl-ev"><div class="tl-dot ' + dot + '"></div><div class="tl-t">' + F.istTime(e.time) + dateNote + '</div>' +
        '<div class="tl-d">' + desc + '</div><div class="tl-src">' + esc(e.source) + '</div></div>';
    }).join('') + '</div>';
  }

  function render() {
    const c = A.data.case;
    const tot = A.alloc[METHOD].totals;
    const main = document.getElementById('main');
    main.innerHTML =
      '<div class="dash">' +
        '<div class="case-strip">' +
          '<div class="card case-card"><div class="case-id">' + t('caseLabel') + ' ' + esc(c.id) + ' <span class="pill status">' + esc(I.pick(c.status)) + '</span></div>' +
            '<div class="case-title">' + esc(I.pick(c.title)) + '</div><div class="small muted">' + esc(I.pick(c.station)) + '</div></div>' +
          kpi('red', F.formatINR(tot.victimLoss), t('kpiLoss'), '<span class="jargon" data-jargon="RRN">RRN</span> ' + esc(A.trail.rootTxn.senderRow.rrn)) +
          kpi('teal', F.formatINR(tot.estTraceable), t('kpiTraceable') + ' (' + METHOD + ')', t('estimateNote')) +
          kpi('', String(A.trail.maxLevel), t('kpiHops'), t('kpiUnresolved') + ': ' + F.formatINR(tot.unresolved)) +
          kpi('red', String(A.rulesList.filter(r => r.suspected).length), t('kpiSuspected'), t('bandHigh') + '/' + t('bandCritical')) +
          kpi('', '<span class="kpi-domain">' + esc(A.data.digital.domain.name) + '</span>', t('kpiDomain'), '<span class="jargon" data-jargon="RDAP">RDAP</span> · <span class="jargon" data-jargon="CT">CT</span> · <span class="jargon" data-jargon="DNS">DNS</span>') +
        '</div>' +
        '<div class="dash-mid">' +
          '<section class="card graph-card" aria-label="' + esc(t('trailTitle')) + '">' +
            '<div class="card-h"><h2>' + t('trailTitle') + '</h2><a class="card-link" href="money-trail.html">' + t('openFullTrail') + '</a></div>' +
            '<div class="caption">' + esc(caption()) + '</div>' +
            '<div class="graph-box"><div class="cy" id="cy"></div></div>' +
            '<div class="legend">' + root.JMGraph.legendHtml(false) + '</div>' +
          '</section>' +
          '<div class="side-col">' +
            '<section class="card"><div class="card-h"><h2>' + t('keyFindings') + '</h2><a class="card-link" href="money-trail.html">' + t('viewAll') + '</a></div><div class="tbl-wrap">' + findingsHtml() + '</div></section>' +
            '<section class="card actions-card"><div class="card-h"><h2>' + t('actions') + '</h2><a class="card-link" href="requests.html">' + t('viewAll') + '</a></div><div class="actions-note">' + t('actionsNote') + '</div><div class="tbl-wrap">' + actionsHtml() + '</div></section>' +
          '</div>' +
        '</div>' +
        '<section class="card timeline-card"><div class="card-h"><h2>' + t('timelineTitle') + '</h2><span class="small muted">' + t('evDnsObserved') + ' ≠ ' + t('evDomainCreated') + '</span></div>' + timelineHtml() + '</section>' +
      '</div>';
    I.applyStatic(main);
    if (cy) cy.destroy();
    cy = root.JMGraph.render(document.getElementById('cy'), A, { compact: true, method: METHOD,
      onSelect: el => { if (el && el.isNode()) location.href = 'money-trail.html?focus=' + encodeURIComponent(el.id()); } });
  }

  S.renderShell('dashboard', render);
  render();
})(typeof self !== 'undefined' ? self : this);
