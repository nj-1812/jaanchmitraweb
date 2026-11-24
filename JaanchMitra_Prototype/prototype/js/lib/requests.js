/*
 * Investigation Action Navigator (deterministic).
 * Builds information-request DRAFTS from the case analysis, routes each to its recipient with a
 * stated rule, and checks completeness. Nothing is ever sent: an authorised officer reviews,
 * signs and issues every request outside this app.
 *
 * CGNAT safeguard: if an IP is in 100.64.0.0/10 or belongs to a mobile-carrier ASN, many people may
 * share it, so the source port and exact time with time zone become mandatory fields.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./allocation.js'));
  else root.JM = Object.assign(root.JM || {}, factory(root.JM));
})(typeof self !== 'undefined' ? self : this, function (Alloc) {
  function ipv4Parts(ip) {
    const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ip || '');
    return m ? m.slice(1).map(Number) : null;
  }
  function isCgnat(ip, asn, directory) {
    const p = ipv4Parts(ip);
    const inRange = !!(p && p[0] === 100 && p[1] >= 64 && p[1] <= 127);
    const carrier = !!(asn && directory && directory.carrierAsns.indexOf(asn) !== -1);
    return { shared: inRange || carrier, reason: inRange ? 'cgnatRange' : carrier ? 'carrierAsn' : null };
  }

  function routeBank(account, directory) {
    const prefix = (account.ifsc || '').slice(0, 4).toUpperCase() // bank code = first 4 letters of IFSC;
    if (directory.ifscPrefix[prefix]) return { bank: directory.ifscPrefix[prefix], by: 'IFSC', input: account.ifsc };
    const handle = account.vpa ? account.vpa.split('@')[1] : null;
    if (handle && directory.upiHandle[handle.toLowerCase()]) return { bank: directory.upiHandle[handle.toLowerCase()], by: 'UPI', input: '@' + handle };
    return { bank: account.bank, by: 'statement', input: account.bank };
  }

  function bankRecipient(account, directory) {
    const r = routeBank(account, directory);
    const n = directory.nodal[r.bank] || { contact: null, source: 'Unknown' };
    return { name: r.bank + ' — Nodal Officer (Cyber)', contact: n.contact, contactSource: n.source, routedBy: r.by, routeInput: r.input };
  }

  function buildRequests(A, directory) {
    const drafts = [];
    const caseRefs = [{ label: 'FIR', value: A.data.case.firNo }, { label: 'NCRP', value: A.data.case.ncrpAck }];
    const alloc = A.alloc.FIFO;

    // 1) Hold + records requests for accounts estimated to still hold victim money, highest first
    Alloc.priorityList(A.alloc.FIFO, A.trail).forEach(p => {
      const acct = A.trail.accountsById[p.account];
      const inEdge = A.trail.edges.find(e => e.txn.to === p.account);
      drafts.push({
        id: 'REQ-HOLD-' + acct.masked.slice(-4), type: 'bankHold', account: p.account,
        recipient: bankRecipient(acct, directory), caseRefs,
        identifiers: [
          { label: 'Account', value: acct.masked + ' (full number in case file)' },
          { label: 'IFSC', value: acct.ifsc }, { label: 'VPA', value: acct.vpa || '—' },
          { label: 'Incoming UTR/RRN', value: inEdge.txn.senderRow.rrn },
          { label: 'Incoming credit', value: inEdge.txn.amount, money: true, time: inEdge.txn.time },
          { label: 'Est. victim-attributed funds remaining (FIFO)', value: p.estTraceable, money: true }
        ],
        records: ['holdConsider', 'kyc', 'statement', 'loginLogs', 'linkedVpas', 'beneficiaries'],
        estimate: p.estTraceable
      });
    });

    // 2) Statement requests for unresolved hops
    A.trail.unresolved.forEach(u => {
      const acct = A.trail.accountsById[u.account];
      drafts.push({
        id: 'REQ-STMT-' + acct.masked.slice(-4), type: 'bankStatement', account: u.account,
        recipient: bankRecipient(acct, directory), caseRefs,
        identifiers: [
          { label: 'Account', value: acct.masked + ' (from sender statement)' }, { label: 'IFSC', value: acct.ifsc },
          { label: 'UTR/RRN', value: u.txn.senderRow.rrn },
          { label: 'Credit', value: u.txn.amount, money: true, time: u.txn.time },
          { label: 'Victim-attributed amount (FIFO)', value: alloc.perAccount[u.account].victimAttributed, money: true }
        ],
        records: ['statement', 'kyc', 'beneficiaries', 'loginLogs'],
        estimate: null
      });
    });

    // 2b) CCTV + ATM journal requests for each account where cash was taken out: the place and time come from the statement narration.
    A.trail.cashOutAccounts.forEach(id => {
      const acct = A.trail.accountsById[id];
      const cash = A.trail.cashOuts.filter(c => c.account === id && c.txn.place);
      if (!cash.length) return;
      const br = directory && directory.branches ? directory.branches[acct.ifsc] : null;
      drafts.push({
        id: 'REQ-CCTV-' + acct.masked.slice(-4), type: 'cctv', account: id,
        recipient: bankRecipient(acct, directory), caseRefs,
        identifiers: [
          { label: 'Account', value: acct.masked + ' (full number in case file)' }, { label: 'IFSC', value: acct.ifsc },
          { label: 'Home branch', value: br ? br.branch.en + ', ' + br.city.en + ' ' + br.pin : acct.ifsc }
        ].concat(cash.map(c => ({
          label: (c.txn.place.kind === 'atm' ? 'ATM ' : 'Branch ') + c.txn.place.code + ' — ' + c.txn.place.area.en + ', ' + c.txn.place.city.en,
          value: c.txn.amount, money: true, time: c.txn.time }))),
        places: cash.map(c => ({ txnId: c.txn.id, time: c.txn.time, amount: c.txn.amount, kind: c.txn.place.kind, code: c.txn.place.code })),
        records: ['cctvWindow', 'atmJournal', 'branchSlip', 'preserve'],
        estimate: null
      });
    });

    // 3) Registrar request for the suspected domain
    const d = A.data.digital;
    drafts.push({
      id: 'REQ-REG-1', type: 'registrar',
      recipient: { name: d.domain.registrar + ' (via ' + d.domain.reseller + ')', contact: d.domain.abuseContact, contactSource: 'RDAP abuse contact', routedBy: 'RDAP', routeInput: d.domain.name },
      caseRefs,
      identifiers: [
        { label: 'Domain', value: d.domain.name },
        { label: 'Registered (RDAP)', value: d.domain.created.value, isTime: true },
        { label: 'Name servers', value: d.domain.nameservers.join(', ') }
      ],
      records: ['registrant', 'payment', 'accountLoginIps', 'otherDomains', 'preserve'],
      estimate: null
    });

    // 4) Hosting provider request for the IP the domain was observed on
    const shared = isCgnat(d.ip.address, d.ip.asn, directory);
    drafts.push({
      id: 'REQ-HOST-1', type: 'host',
      recipient: { name: d.ip.asnName + ' (' + d.ip.asn + ')', contact: d.ip.abuseContact, contactSource: 'RDAP / ASN abuse contact', routedBy: 'ASN', routeInput: d.ip.address },
      caseRefs,
      identifiers: [
        { label: 'IP address', value: d.ip.address },
        { label: 'Observed (DNS) at', value: d.dns[0].observedAt, isTime: true },
        { label: 'Domain', value: d.domain.name }
      ],
      ip: { address: d.ip.address, type: d.ip.type, shared: shared.shared, sharedReason: shared.reason },
      records: ['serverCustomer', 'billing', 'accountLoginIps', 'preserve'],
      estimate: null
    });

    // 5) Report of the phishing website to CERT-In (an incident report, not a legal notice: no provision or reply deadline).
    //    Address published by CERT-In for incident reporting; checked 22-11-2026.
    const ev = d.websiteEvidence;
    drafts.push({
      id: 'REQ-CERTIN-1', type: 'certin', notice: false,
      recipient: { name: 'CERT-In Incident Response Help Desk', contact: 'incident@cert-in.org.in', contactSource: 'CERT-In published incident-reporting address (checked 22-11-2026)', routedBy: 'Incident type', routeInput: 'Phishing website' },
      caseRefs,
      identifiers: [
        { label: 'Domain', value: d.domain.name },
        { label: 'Other names on certificate', value: d.certificate.sans.filter(x => x !== d.domain.name).join(', ') || '—' },
        { label: 'Registered (RDAP)', value: d.domain.created.value, isTime: true },
        { label: 'Certificate valid from (CT log)', value: d.certificate.validFrom.value, isTime: true },
        { label: 'IP address (DNS)', value: d.ip.address + ' · ' + d.ip.asn },
        { label: 'Observed (DNS) at', value: d.dns[0].observedAt, isTime: true },
        { label: 'UPI ID shown on the site', value: ev.vpas.join(', ') },
        { label: 'Phone shown on the site', value: ev.phones.join(', ') },
        { label: 'Victim payment', value: A.trail.rootTxn.amount, money: true, time: A.trail.rootTxn.time }
      ],
      records: ['certinExamine', 'certinCoordinate', 'certinShare'],
      estimate: null
    });
    return drafts;
  }

  /*
   * Completeness check. officer = { name, designation, station, provisionConfirmed, deadline, sourcePort }
   * Returns a list of checks; a draft is complete only when every check passes.
   */
  function checkCompleteness(draft, officer) {
    const o = officer || {};
    const checks = [
      { key: 'caseRef', ok: draft.caseRefs.every(r => !!r.value) },
      { key: 'recipient', ok: !!draft.recipient.name },
      { key: 'recipientContact', ok: !!draft.recipient.contact },
      { key: 'identifiers', ok: draft.identifiers.length > 0 && draft.identifiers.every(i => i.value !== null && i.value !== undefined && i.value !== '') },
      { key: 'timeZone', ok: draft.identifiers.filter(i => i.time || i.isTime).every(i => /[+-]\d\d:\d\d$/.test(i.time || i.value)) },
      { key: 'records', ok: draft.records.length > 0 },
      // An incident report (CERT-In) is not a legal notice: no provision or reply deadline is needed.
      ...(draft.notice === false ? [] : [{ key: 'provision', ok: !!o.provisionConfirmed }, { key: 'deadline', ok: !!o.deadline }]),
      { key: 'officerName', ok: !!(o.name && o.name.trim()) },
      { key: 'officerDesignation', ok: !!(o.designation && o.designation.trim()) }
    ];
    if (draft.ip) {
      checks.push({ key: 'cgnatPort', ok: !draft.ip.shared || !!(o.sourcePort && /^\d{1,5}$/.test(o.sourcePort)), applies: draft.ip.shared });
    }
    return { checks, complete: checks.every(c => c.ok) };
  }

  return { buildRequests, checkCompleteness, isCgnat, routeBank };
});
