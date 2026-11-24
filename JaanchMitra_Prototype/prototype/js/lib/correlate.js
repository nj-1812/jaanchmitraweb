/*
 * Cross-trail correlation and unified timeline (deterministic).
 * Identifiers are normalised before comparing (VPA: trimmed, lower-case; phone: digits only, last 10).
 * Website evidence comes only from files the investigator supplied — never from loading the live site.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.JM = Object.assign(root.JM || {}, factory());
})(typeof self !== 'undefined' ? self : this, function () {
  function normVpa(v) { return v ? String(v).trim().toLowerCase() : null; }
  function normPhone(p) { const d = String(p || '').replace(/\D/g, ''); return d.length >= 10 ? d.slice(-10) : null; }

  function crossTrailMatches(data) {
    const ev = data.digital.websiteEvidence;
    const matches = [];
    ev.vpas.forEach(v => {
      data.accounts.forEach(a => {
        if (a.vpa && normVpa(a.vpa) === normVpa(v)) {
          matches.push({ kind: 'vpa', evidenceValue: v, account: a.id, accountValue: a.vpa, strength: 'strong',
            sources: [{ file: ev.file, note: 'website evidence' }, { file: a.statement.file, note: 'bank statement' }] });
        }
      });
    });
    const unmatchedPhones = ev.phones.filter(p => !data.accounts.some(a => a.vpa && a.vpa.replace(/\D/g, '').slice(-10) === normPhone(p)));
    return { matches, unmatchedPhones };
  }

  /*
   * Event time vs observation time:
   *  kind 'event'       -> when something happened (transaction, registration, certificate valid-from)
   *  kind 'observation' -> when we SAW something (a live DNS lookup). Never used to claim order of events.
   */
  function buildTimeline(data, trail) {
    const ev = [];
    const d = data.digital;
    ev.push({ time: d.domain.created.value, kind: 'event', type: 'domainCreated', source: d.domain.created.source, ref: d.domain.name });
    ev.push({ time: d.certificate.validFrom.value, kind: 'event', type: 'certValidFrom', source: d.certificate.validFrom.source, ref: d.domain.name });
    trail.edges.forEach(e => ev.push({ time: e.txn.time, kind: 'event', type: e.txn.id === trail.rootTxn.id ? 'victimPayment' : 'transfer',
      source: 'Bank statement', txn: e.txn.id, amount: e.txn.amount, from: e.txn.from, to: e.txn.to, linkClass: e.link.cls }));
    trail.cashOuts.forEach(c => ev.push({ time: c.txn.time, kind: 'event', type: 'cashOut', source: 'Bank statement', txn: c.txn.id, amount: c.txn.amount, from: c.account }));
    d.dns.filter(r => r.type === 'A').forEach(r => ev.push({ time: r.observedAt, kind: 'observation', type: 'dnsObserved', source: r.source, ref: d.domain.name + ' → ' + r.value }));
    return ev.sort((a, b) => Date.parse(a.time) - Date.parse(b.time));
  }

  // How old the fraud infrastructure was when the victim paid (event times only, never observation times).
  function infraAgeAtPayment(data, trail) {
    const pay = Date.parse(trail.rootTxn.time);
    const mins = iso => Math.round((pay - Date.parse(iso)) / 60000);
    return {
      domainMinutes: mins(data.digital.domain.created.value),
      certMinutes: mins(data.digital.certificate.validFrom.value)
    };
  }

  /*
   * One account's statement, rebuilt from the evidence rows in time order, with a CALCULATED running balance.
   * (Printed balances and file hashes are checked by the Python parser in the real pipeline.)
   */
  function statementView(data, accountId) {
    const acct = data.accounts.find(a => a.id === accountId);
    const rows = [];
    data.transactions.forEach(t => {
      if (t.from === accountId && t.senderRow) rows.push({ t, dir: 'DR', ref: t.senderRow, counterparty: t.to });
      if (t.to === accountId && t.receiverRow) rows.push({ t, dir: 'CR', ref: t.receiverRow, counterparty: t.from });
    });
    rows.sort((a, b) => Date.parse(a.ref.time) - Date.parse(b.ref.time));
    let bal = acct.openingBalance || 0, credits = 0, debits = 0;
    const out = rows.map(r => {
      if (r.dir === 'CR') { bal += r.t.amount; credits += r.t.amount; } else { bal -= r.t.amount; debits += r.t.amount; }
      return { txn: r.t.id, time: r.ref.time, dir: r.dir, amount: r.t.amount, balance: bal, rrn: r.ref.rrn, rail: r.t.rail,
        narration: r.t.narration, file: r.ref.file, page: r.ref.page, row: r.ref.row, counterparty: r.counterparty };
    });
    return { account: accountId, available: acct.statement.available, file: acct.statement.file, period: acct.statement.period,
      opening: acct.openingBalance, closing: acct.statement.available ? bal : null, credits, debits, rows: out };
  }

  // Complaint intake facts: reporting delay and which statements on the trail we have / still need.
  function intakeStatus(data, trail) {
    const onTrail = Object.keys(trail.levels).filter(id => id !== trail.rootTxn.from);
    const byId = trail.accountsById;
    return {
      delayMinutes: Math.round((Date.parse(data.case.complaintReceived) - Date.parse(trail.rootTxn.time)) / 60000),
      trailAccounts: onTrail.length,
      received: onTrail.filter(id => byId[id].statement.available),
      missing: onTrail.filter(id => !byId[id].statement.available),
      hasWebsiteEvidence: !!(data.digital && data.digital.websiteEvidence && data.digital.websiteEvidence.file),
      hasDomain: !!(data.digital && data.digital.domain)
    };
  }


  /* ---------- Places (where money was held or taken out) ----------
   * Home branch: from the account's IFSC (directory). It is where the account is held, NOT where an online payment was made.
   * Cash withdrawals: the ATM or branch printed in the statement narration — a real physical place and time.
   * Online transfers (UPI / IMPS / NEFT): no physical place in a statement; device/login location needs the bank's records via legal process.
   */
  function branchOf(directory, ifsc) { return (directory && directory.branches && directory.branches[ifsc]) || null; }
  function txnPlace(data, directory, txn, accountsById) {
    if (txn.place) return Object.assign({ online: false }, txn.place);
    const acct = id => accountsById ? accountsById[id] : (data.accounts || []).find(a => a.id === id);
    const from = txn.from && acct(txn.from), to = txn.to && acct(txn.to);
    return { kind: 'online', online: true, rail: txn.rail, fromBranch: from ? branchOf(directory, from.ifsc) : null, toBranch: to ? branchOf(directory, to.ifsc) : null };
  }
  // Transfers between the home-branch cities of sender and receiver (statement amounts), for the Places view.
  function cityFlows(A, directory) {
    const out = {};
    A.trail.edges.forEach(e => {
      const f = branchOf(directory, A.trail.accountsById[e.txn.from].ifsc), to = branchOf(directory, A.trail.accountsById[e.txn.to].ifsc);
      if (!f || !to) return;
      const k = f.city.en + '>' + to.city.en;
      (out[k] = out[k] || { from: f.city, to: to.city, amount: 0, txns: [], cls: [] });
      out[k].amount += e.txn.amount; out[k].txns.push(e.txn.id); out[k].cls.push(e.link.cls);
    });
    return Object.keys(out).map(k => out[k]);
  }
  // One row per city: accounts on the trail held there, cash withdrawn there (with ATM/branch codes and times).
  function placesSummary(A, directory) {
    const rows = {}; const key = c => c.city.en + '|' + c.state.en;
    const row = (city, state, district) => { const k = key({ city, state }); return rows[k] || (rows[k] = { city, state, district: district || city, accounts: [], cash: [], cashTotal: 0, first: null, last: null }); };
    const touch = (r, time) => { if (!time) return; if (!r.first || time < r.first) r.first = time; if (!r.last || time > r.last) r.last = time; };
    Object.keys(A.trail.levels).forEach(id => {
      const a = A.trail.accountsById[id]; const b = branchOf(directory, a.ifsc); if (!b) return;
      const r = row(b.city, b.state, b.district); r.accounts.push({ id, branch: b.branch, pin: b.pin, level: A.trail.levels[id] });
    });
    A.trail.cashOuts.forEach(c => {
      const p = c.txn.place; if (!p) return;
      const r = row(p.city, p.state); r.cash.push({ txnId: c.txn.id, account: c.account, amount: c.txn.amount, time: c.txn.time, kind: p.kind, code: p.code, area: p.area });
      r.cashTotal += c.txn.amount; touch(r, c.txn.time);
    });
    // time money first reached an account held in that city
    A.trail.edges.forEach(e => { const a = A.trail.accountsById[e.txn.to]; const b = a && branchOf(directory, a.ifsc); if (b) touch(row(b.city, b.state, b.district), e.txn.time); });
    return Object.keys(rows).map(k => rows[k]).sort((x, y) => (Math.min.apply(null, x.accounts.map(a => a.level).concat([99])) - Math.min.apply(null, y.accounts.map(a => a.level).concat([99]))) || (x.first || '').localeCompare(y.first || ''));
  }
  return { branchOf, txnPlace, placesSummary, cityFlows, crossTrailMatches, buildTimeline, normVpa, normPhone, infraAgeAtPayment, statementView, intakeStatus };
});
