/* Statements page: every statement received (and missing), with its rows paginated — no page scrolling. */
(function (root) {
  const I = root.JMI18N; const t = I.t;
  const S = root.JMShell; const esc = S.esc;
  const F = root.JM;
  const A = S.analyse();
  const PER_PAGE = 9;

  const params = new URLSearchParams(location.search);
  const ids = A.data.accounts.map(a => a.id);
  const state = { account: ids.indexOf(params.get('account')) !== -1 ? params.get('account') : A.trail.rootTxn.to, page: 1 };

  // Statements received (and missing) as a table: account · bank and home branch · rows · role on the trail.
  function listHtml() {
    const rows = A.data.accounts.map(a => {
      const v = F.statementView(A.data, a.id);
      const role = S.accountRole(A, a.id);
      const r = A.rules[a.id];
      const br = F.branchOf(root.JM_DIRECTORY, a.ifsc);
      const lvl = A.trail.levels[a.id];
      return { href: '?account=' + a.id, cls: a.id === state.account ? 'on' : '', cells: [
        '<a class="st-go" href="?account=' + a.id + '" data-id="' + a.id + '"><span class="ico ' + (a.statement.available ? (r && r.suspected ? 'red' : 'grey') : 'grey') + '" aria-hidden="true">' + (a.statement.available ? '▤' : '?') + '</span>' + esc(a.masked) + '</a>',
        esc(a.bank) + '<div class="sub">' + (br ? esc(I.pick(br.city)) : '—') + '</div>',
        a.statement.available ? String(v.rows.length) : '<span class="pill unresolved">' + esc(t('stMissingShort')) + '</span>',
        (lvl !== undefined ? 'L' + lvl + ' · ' : '') + esc(lvl !== undefined ? S.roleLabel(role) : t('stNotOnTrail'))] };
    });
    return S.table([t('rpColAcct'), t('stColBankCity'), { label: t('stColRows'), num: true }, t('stColRole')], rows, { cls: 'compact st-list', caption: t('stList') });
  }

  // Where a statement row happened: ATM / branch counter for cash (from the narration); online transfers have no physical place.
  function placeCell(r) {
    const txn = A.data.transactions.find(x => x.id === r.txn);
    if (!txn) return '—';
    const p = F.txnPlace(A.data, root.JM_DIRECTORY, txn, A.trail.accountsById);
    if (!p.online) return '<b>' + esc(I.pick(p.area)) + '</b><div class="ev">' + esc(I.pick(p.city)) + ' · ' + (p.kind === 'atm' ? 'ATM ' : '') + esc(p.code) + '</div>';
    return '<span class="muted">' + esc(t('plOnlineShort', { rail: p.rail })) + '</span>';
  }

  function detailHtml() {
    const a = A.trail.accountsById[state.account];
    const v = F.statementView(A.data, state.account);
    const head = '<div class="card-h"><h2>' + esc(a.masked) + ' · ' + esc(a.bank) + ' <span class="pill ' + (v.available ? 'ok' : 'unresolved') + '">' +
      (v.available ? t('stAvailable') : t('stMissing')) + '</span></h2>' +
      (A.trail.levels[a.id] !== undefined ? '<a class="card-link" href="money-trail.html?focus=' + a.id + '">' + t('stOnTrail') + '</a>' : '') + '</div>';
    if (!v.available) {
      const u = A.trail.unresolved.find(x => x.account === a.id);
      return head + '<div class="panel"><div class="note">' + esc(t('stMissingNote')) + '</div>' +
        (u ? '<dl class="kv">' + '<dt>UTR/RRN</dt><dd>' + esc(u.txn.senderRow.rrn) + '</dd><dt>' + t('amount') + '</dt><dd>' + F.formatINR(u.txn.amount) + '</dd>' +
          '<dt>' + t('time') + '</dt><dd>' + F.istDateTime(u.txn.time) + '</dd></dl>' +
          '<a class="card-link" style="margin:0" href="requests.html?id=REQ-STMT-' + a.masked.slice(-4) + '">' + t('stRequest') + '</a>' : '') + '</div>';
    }
    const pages = Math.max(1, Math.ceil(v.rows.length / PER_PAGE));
    state.page = Math.min(state.page, pages);
    const slice = v.rows.slice((state.page - 1) * PER_PAGE, state.page * PER_PAGE);
    const summary = '<div class="st-sum">' +
      '<div><span>' + t('stPeriod') + '</span><b>' + esc(v.period) + '</b></div>' +
      '<div><span>' + t('stOpening') + '</span><b>' + F.formatINR(v.opening) + '</b></div>' +
      '<div><span>' + t('stCredits') + '</span><b>' + F.formatINR(v.credits) + '</b></div>' +
      '<div><span>' + t('stDebits') + '</span><b>' + F.formatINR(v.debits) + '</b></div>' +
      '<div><span>' + t('stClosing') + '</span><b>' + F.formatINR(v.closing) + '</b></div>' +
      '<div><span>' + t('stHomeBranch') + '</span><b>' + esc(S.branchText(F.branchOf(root.JM_DIRECTORY, a.ifsc), true)) + '</b></div></div>';
    const table = '<table class="dt st-tbl"><thead><tr><th>' + t('stDate') + '</th><th>' + t('stCr') + '</th><th>' + t('stDr') + '</th><th>' + t('stBalance') +
      '</th><th><span class="jargon" data-jargon="RRN">UTR/RRN</span></th><th>' + t('stNarration') + '</th><th>' + t('stPlace') + '</th><th>' + t('stSource') + '</th></tr></thead><tbody>' +
      slice.map(r => '<tr><td>' + F.istTime(r.time) + '<div class="ev">' + F.istDate(r.time) + '</div></td>' +
        '<td class="num">' + (r.dir === 'CR' ? F.formatINR(r.amount) : '') + '</td><td class="num">' + (r.dir === 'DR' ? F.formatINR(r.amount) : '') + '</td>' +
        '<td class="num">' + F.formatINR(r.balance) + '</td><td>' + esc(r.rrn || '—') + '</td>' +
        '<td class="narr">' + esc(r.narration) + '<div class="ev">' + (r.counterparty ? esc(S.masked(A, r.counterparty)) : esc(t('outside'))) + '</div></td>' +
        '<td class="place">' + placeCell(r) + '</td>' +
        '<td class="ev">' + esc(r.file) + '<br>' + t('page') + ' ' + r.page + ' · ' + t('row') + ' ' + r.row + '</td></tr>').join('') + '</tbody></table>';
    const pager = '<div class="pager"><button class="btn" id="pg-prev" type="button"' + (state.page <= 1 ? ' disabled' : '') + '>' + t('prev') + '</button>' +
      '<span>' + t('stPageOf', { p: state.page, n: pages }) + '</span>' +
      '<button class="btn" id="pg-next" type="button"' + (state.page >= pages ? ' disabled' : '') + '>' + t('next') + '</button></div>';
    return head + '<div class="st-body">' + summary + '<div class="st-scroll" tabindex="0">' + table + '</div>' + pager + '<div class="ev">' + esc(t('stDemoNote')) + '</div></div>';
  }

  function render() {
    const main = document.getElementById('main');
    main.innerHTML = '<div class="st">' +
      '<section class="card panel"><div class="breadcrumb">' + t('caseLabel') + ' ' + esc(A.data.case.id) + ' › ' + t('stTitle') + '</div>' +
        '<h3>' + t('stList') + '</h3><div class="tbl-wrap flush">' + listHtml() + '</div></section>' +
      '<section class="card trail-center" id="st-detail">' + detailHtml() + '</section></div>';
    I.applyStatic(main);
    document.querySelectorAll('.st-go').forEach(el => el.onclick = e => {
      e.preventDefault(); state.account = el.getAttribute('data-id'); state.page = 1;
      try { history.replaceState(null, '', '?account=' + state.account); } catch (err) { /* file:// in some browsers */ } render(); S.revealOnSmall(document.getElementById('st-detail'));
    });
    const p = document.getElementById('pg-prev'), n = document.getElementById('pg-next');
    if (p) p.onclick = () => { state.page--; render(); };
    if (n) n.onclick = () => { state.page++; render(); };
  }

  S.renderShell('statements', render);
  render();
})(typeof self !== 'undefined' ? self : this);
