/* Report & Requests page: request drafts, live completeness check, routing explanation, print to PDF. */
(function (root) {
  const I = root.JMI18N; const t = I.t;
  const S = root.JMShell; const esc = S.esc;
  const F = root.JM;
  const A = S.analyse();
  const drafts = F.buildRequests(A, root.JM_DIRECTORY);

  const params = new URLSearchParams(location.search);
  const state = {
    selected: drafts.some(d => d.id === params.get('id')) ? params.get('id') : drafts[0].id,
    officer: { name: '', designation: '', deadline: '', provisionConfirmed: false, sourcePort: '' }
  };

  const TYPE_KEY = { bankHold: 'reqTypeBankHold', bankStatement: 'reqTypeBankStatement', registrar: 'reqTypeRegistrar', host: 'reqTypeHost', certin: 'reqTypeCertIn', cctv: 'reqTypeCctv' };
  const TYPE_ICON = { bankHold: '₹', bankStatement: '?', registrar: '@', host: '▤', certin: '!', cctv: '◉' };
  const SUBJECT = {
    bankHold: 'Request to consider a hold on suspected proceeds of cyber fraud, and to provide account records',
    bankStatement: 'Request for account statement, KYC and beneficiary records',
    registrar: 'Request for registration and account records of a domain used in cyber fraud',
    host: 'Request for customer and access records of a server used in cyber fraud',
    certin: 'Report of a phishing website used in cyber-enabled financial fraud',
    cctv: 'Request to preserve and provide CCTV footage and ATM / branch records of cash withdrawals'
  };
  const RECORDS = {
    holdConsider: 'Please consider placing a hold on the funds identified above, as per applicable procedure, and confirm the action taken. (The amount is an analytical estimate under the FIFO method, not a confirmed balance.)',
    kyc: 'KYC and account-opening documents, registered mobile number and e-mail',
    statement: 'Complete account statement from 01-11-2026 to date, with UTR/RRN for every entry',
    loginLogs: 'Internet/mobile banking and UPI login logs (IP address, source port, device ID, date-time with time zone)',
    linkedVpas: 'All UPI IDs (VPAs), cards and devices linked to the account',
    beneficiaries: 'Details of beneficiary accounts for onward transfers, with UTR/RRN',
    registrant: 'Registrant / account-holder details as held by you (not the redacted public record)',
    payment: 'Payment method and transaction records for the registration',
    accountLoginIps: 'Account login and management logs (IP address, source port, date-time with time zone)',
    otherDomains: 'Other domains held in the same customer account',
    serverCustomer: 'Customer account details for the server using the IP address below',
    billing: 'Billing and payment records for that customer account',
    preserve: 'Please preserve all of the above records pending further legal process',
    cctvWindow: 'CCTV footage of the ATM / branch counter for 15 minutes before and after each withdrawal listed above',
    atmJournal: 'ATM electronic journal and switch records for each withdrawal (card number used, terminal ID, response codes)',
    branchSlip: 'Withdrawal slip or cheque, and counter-staff details, for any branch withdrawal listed above',
    certinExamine: 'Please examine the website above and take action as per CERT-In procedures.',
    certinCoordinate: 'Please coordinate with the domain registrar and the hosting provider as you consider appropriate.',
    certinShare: 'Please share any tracking number and related indicators with the undersigned for the case file.'
  };

  function valueText(i) {
    if (i.money) return F.formatINR(i.value) + (i.time ? ' on ' + F.istDateTime(i.time) : '');
    if (i.isTime) return F.istDateTime(i.value) + ' (UTC+05:30)';
    return String(i.value);
  }

  function letterHtml(d) {
    const o = state.officer;
    const ph = (v, label) => v ? esc(v) : '<span class="ph">[' + esc(label) + ']</span>';
    const recs = d.records.map(r => '<li>' + esc(RECORDS[r]) + '</li>').join('');
    const ids = d.identifiers.map(i => '<tr><td>' + esc(i.label) + '</td><td>' + esc(valueText(i)) + '</td></tr>').join('') +
      (d.ip && d.ip.shared ? '<tr><td>Source port</td><td>' + ph(o.sourcePort, 'source port — mandatory') + '</td></tr>' : '');
    return '<div class="letter" id="letter"><div class="watermark" aria-hidden="true">DRAFT</div>' +
      '<div class="lt-top"><div><b>From:</b> ' + ph(o.name, 'Officer name') + ', ' + ph(o.designation, 'Designation') + '<br>' + esc(A.data.case.station.en) + '</div>' +
      '<div style="text-align:right"><b>Ref:</b> FIR ' + esc(A.data.case.firNo) + '<br>NCRP ' + esc(A.data.case.ncrpAck) + '<br>Case ' + esc(A.data.case.id) + '</div></div>' +
      '<p><b>To:</b> ' + esc(d.recipient.name) + '<br>' + ph(d.recipient.contact, 'contact not public — officer to fill') + '</p>' +
      '<p><b>Subject:</b> ' + esc(SUBJECT[d.type]) + '</p>' +
      (d.notice === false
        ? '<p>In connection with the above case of cyber-enabled financial fraud, this is to report a suspected phishing website. The details below come from public records (RDAP, CT log, DNS) and from evidence supplied by the victim; the website was not visited or scanned.</p>'
        : '<p class="legal"><b>Legal provision:</b> Notice under Section 94, Bharatiya Nagarik Suraksha Sanhita, 2023 ' +
          (o.provisionConfirmed ? '' : '<span class="ph">[officer to verify the applicable provision]</span>') + '</p>' +
          '<p>In connection with the above case of cyber-enabled financial fraud, you are requested to provide the following records relating to the identifiers below.</p>') +
      '<table class="ids">' + ids + '</table>' +
      '<ol class="recs">' + recs + '</ol>' +
      (d.notice === false ? '<p>All times above are in IST (UTC+05:30).</p>' : '<p>Please reply by ' + ph(o.deadline, 'deadline') + '. All times above are in IST (UTC+05:30).</p>') +
      '<div class="sign">' + ph(o.name, 'Signature & name') + '<br>' + ph(o.designation, 'Designation') + '</div>' +
      '<div class="lt-foot">DRAFT prepared with JaanchMitra (prototype, synthetic data). Not sent. To be reviewed, signed and issued by an authorised officer through the proper channel.</div>' +
    '</div>';
  }

  // Drafts as a table: what · to whom · estimate · completeness. Clicking a row opens that draft.
  function listHtml() {
    return S.table([t('rpColKind'), { label: t('fdColEst'), num: true }, t('rpStatus')], drafts.map(d => {
      const c = F.checkCompleteness(d, state.officer);
      const missing = c.checks.filter(x => !x.ok).length;
      return { href: '?id=' + d.id, cls: d.id === state.selected ? 'on' : '', cells: [
        '<a class="rq-go" href="?id=' + d.id + '" data-id="' + d.id + '"><span class="ico ' + (d.type === 'bankHold' ? 'red' : d.type === 'bankStatement' || d.type === 'cctv' ? 'grey' : 'teal') + '" aria-hidden="true">' + TYPE_ICON[d.type] + '</span><span class="rq-txt" title="' + esc(t(TYPE_KEY[d.type]) + ' — ' + d.recipient.name) + '"><span class="rq-l1">' + esc(t(TYPE_KEY[d.type])) + '</span><span class="sub rq-l2">' + esc(d.recipient.name) + '</span></span></a>',
        d.estimate ? F.formatINR(d.estimate) : '—',
        '<span class="pill ' + (c.complete ? 'ok' : 'medium') + '">' + (c.complete ? '✓' : '✗ ' + missing) + '<span class="sr"> ' + esc(c.complete ? t('complete') : t('missingN', { n: missing })) + '</span></span>'] };
    }), { cls: 'compact rq-list', caption: t('reqTitle') });
  }


  function checkerHtml(d) {
    const c = F.checkCompleteness(d, state.officer);
    const items = c.checks.map(x => '<li class="' + (x.ok ? 'ok' : 'bad') + '"><span aria-hidden="true">' + (x.ok ? '✓' : '✗') + '</span> ' + esc(t('chk_' + x.key)) +
      '<span class="sr">' + (x.ok ? ' — ' + t('complete') : ' — ' + t('incomplete')) + '</span></li>').join('');
    const r = d.recipient;
    return '<h3>' + t('checkerTitle') + ' <span class="pill ' + (c.complete ? 'ok' : 'medium') + '">' + (c.complete ? t('complete') : t('incomplete')) + '</span></h3>' +
      '<ul class="checks">' + items + '</ul>' +
      '<h3>' + t('routing') + '</h3><div class="small">' + esc(t('routedBy', { by: r.routedBy, input: r.routeInput })) + ' → <b>' + esc(r.name) + '</b><br>' +
        esc(t('contactSource')) + ': ' + esc(r.contactSource) + '</div>' +
      (d.ip ? '<div class="small" style="margin-top:6px">' + esc(d.ip.shared ? t('cgnatYes') : t('cgnatNo', { type: d.ip.type })) + '</div>' : '') +
      '<div class="note">' + esc(t('officerDecides')) + '</div>';
  }

  function officerForm(d) {
    const o = state.officer;
    return '<h3>' + t('officer') + '</h3>' +
      '<label class="fld">' + t('officerName') + '<input id="o-name" value="' + esc(o.name) + '" autocomplete="off"></label>' +
      '<label class="fld">' + t('officerDesignation') + '<input id="o-desig" value="' + esc(o.designation) + '" autocomplete="off"></label>' +
      '<label class="fld">' + t('deadlineLabel') + '<input id="o-deadline" type="date" value="' + esc(o.deadline) + '"></label>' +
      (d.ip && d.ip.shared ? '<label class="fld">' + t('sourcePortLabel') + '<input id="o-port" inputmode="numeric" value="' + esc(o.sourcePort) + '"></label>' : '') +
      '<label class="opt"><input id="o-prov" type="checkbox"' + (o.provisionConfirmed ? ' checked' : '') + '> ' + t('provisionLabel') + '</label>';
  }

  function refresh() {
    const d = drafts.find(x => x.id === state.selected);
    document.getElementById('req-list').innerHTML = listHtml();
    document.getElementById('letter-box').innerHTML = letterHtml(d);
    document.getElementById('checker').innerHTML = checkerHtml(d);
    wireList();
  }

  function wireList() {
    document.querySelectorAll('.rq-go').forEach(a => a.onclick = e => {
      e.preventDefault(); state.selected = a.getAttribute('data-id');
      try { history.replaceState(null, '', '?id=' + state.selected); } catch (err) { /* file:// in some browsers */ } render(); S.revealOnSmall(document.getElementById('letter-box').parentElement);
    });
  }

  function render() {
    const d = drafts.find(x => x.id === state.selected);
    const main = document.getElementById('main');
    main.innerHTML =
      '<div class="req">' +
        '<section class="card panel" aria-label="' + esc(t('reqDraftsList')) + '">' +
          '<div class="breadcrumb">' + t('caseLabel') + ' ' + esc(A.data.case.id) + ' › ' + t('reqTitle') + '</div>' +
          '<div class="tabs"><span class="tab on">' + t('reqTitle') + '</span><a class="tab" href="report.html">' + t('reportTab') + '</a></div>' +
          '<div id="req-list" class="tbl-wrap flush"></div>' +
        '</section>' +
        '<section class="card trail-center" aria-label="Draft">' +
          '<div class="card-h"><h2>' + esc(t(TYPE_KEY[d.type])) + '</h2><span class="small muted">' + t('letterLangNote') + '</span>' +
          '<button class="btn" id="print" type="button" style="margin-left:auto">' + t('print') + '</button></div>' +
          '<div class="letter-box" id="letter-box"></div>' +
        '</section>' +
        '<section class="card panel details"><div class="officer">' + officerForm(d) + '</div><div id="checker" aria-live="polite"></div></section>' +
      '</div>';
    refresh();
    const bind = (id, key, prop) => { const el = document.getElementById(id); if (el) el.addEventListener('input', () => { state.officer[key] = el[prop || 'value']; refresh(); }); };
    bind('o-name', 'name'); bind('o-desig', 'designation'); bind('o-deadline', 'deadline'); bind('o-port', 'sourcePort');
    const prov = document.getElementById('o-prov'); prov.onchange = () => { state.officer.provisionConfirmed = prov.checked; refresh(); };
    document.getElementById('print').onclick = () => window.print();
  }

  S.renderShell('report', render);
  render();
})(typeof self !== 'undefined' ? self : this);
