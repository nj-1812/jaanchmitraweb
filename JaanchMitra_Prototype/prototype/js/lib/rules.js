/*
 * Mule rule engine (deterministic, explainable). No machine learning.
 * Each rule has an explicit threshold and weight; every hit lists the statement rows behind it.
 * Score = min(100, sum of weights of rules that fire).
 * Bands: >= 75 Critical, >= 50 High, >= 25 Medium, else Low. "Suspected" = High or Critical.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.JM = Object.assign(root.JM || {}, factory());
})(typeof self !== 'undefined' ? self : this, function () {
  const DEFAULT_THRESHOLDS = {
    rapidMinutes: 60, rapidShare: 0.8,
    passMin: 0.9, passMax: 1.1, passMinVolume: 10000,
    drainedShare: 0.05, drainedMinPeak: 10000,
    roundShare: 0.6, roundUnit: 1000, roundMinTxns: 2,
    cashMinutes: 120
  };
  const WEIGHTS = { R1: 30, R2: 15, R3: 15, R4: 10, R5: 20, R6: 25 };

  function rowRef(t, side) {
    const r = side === 'credit' ? t.receiverRow : t.senderRow;
    return r ? { txn: t.id, file: r.file, page: r.page, row: r.row } : { txn: t.id };
  }

  function evaluateAccount(data, trail, accountId, thresholds) {
    const th = Object.assign({}, DEFAULT_THRESHOLDS, thresholds || {});
    const acct = trail.accountsById[accountId];
    const credits = data.transactions.filter(t => t.to === accountId)
      .map(t => ({ t, time: t.receiverRow ? t.receiverRow.time : t.time }))
      .sort((a, b) => Date.parse(a.time) - Date.parse(b.time));
    const debits = data.transactions.filter(t => t.from === accountId)
      .map(t => ({ t, time: t.senderRow ? t.senderRow.time : t.time }))
      .sort((a, b) => Date.parse(a.time) - Date.parse(b.time));
    const hits = [];

    // R1 rapid in-out: >= 80% of a credit leaves within 60 minutes
    credits.forEach(c => {
      if (hits.some(h => h.rule === 'R1')) return;
      let sum = 0; const rows = [];
      for (const d of debits) {
        const mins = (Date.parse(d.time) - Date.parse(c.time)) / 60000;
        if (mins < -2) continue; // same 2-minute tolerance as the tracer (minute-precision statements)
        if (mins > th.rapidMinutes) break;
        sum += d.t.amount; rows.push(rowRef(d.t, 'debit'));
        if (sum >= th.rapidShare * c.t.amount) {
          hits.push({ rule: 'R1', weight: WEIGHTS.R1, params: { amountIn: c.t.amount, amountOut: sum, minutes: Math.round(mins) },
            evidence: [rowRef(c.t, 'credit')].concat(rows) });
          break;
        }
      }
    });

    const totalIn = credits.reduce((s, c) => s + c.t.amount, 0);
    const totalOut = debits.reduce((s, d) => s + d.t.amount, 0);

    // R2 pass-through: money out / money in close to 1
    if (totalIn >= th.passMinVolume) {
      const ratio = totalOut / totalIn;
      if (ratio >= th.passMin && ratio <= th.passMax) {
        hits.push({ rule: 'R2', weight: WEIGHTS.R2, params: { ratio: Math.round(ratio * 100) / 100, totalIn, totalOut },
          evidence: credits.map(c => rowRef(c.t, 'credit')).concat(debits.map(d => rowRef(d.t, 'debit'))) });
      }
    }

    // R3 balance drained: closing balance < 5% of the peak balance
    const events = credits.map(c => ({ time: c.time, delta: c.t.amount })).concat(debits.map(d => ({ time: d.time, delta: -d.t.amount })))
      .sort((a, b) => Date.parse(a.time) - Date.parse(b.time));
    let bal = acct.openingBalance || 0; let peak = bal;
    events.forEach(e => { bal += e.delta; if (bal > peak) peak = bal; });
    if (peak >= th.drainedMinPeak && bal / peak < th.drainedShare) {
      hits.push({ rule: 'R3', weight: WEIGHTS.R3, params: { peak, closing: bal }, evidence: debits.slice(-1).map(d => rowRef(d.t, 'debit')) });
    }

    // R4 round figures: most amounts are exact multiples of ₹1,000
    const all = credits.map(c => c.t).concat(debits.map(d => d.t));
    if (all.length >= th.roundMinTxns) {
      const round = all.filter(t => t.amount % th.roundUnit === 0);
      if (round.length / all.length > th.roundShare) {
        hits.push({ rule: 'R4', weight: WEIGHTS.R4, params: { round: round.length, total: all.length },
          evidence: round.map(t => rowRef(t, t.to === accountId ? 'credit' : 'debit')) });
      }
    }

    // R5 victim-linked: on the money trail from the victim's transaction
    if (trail.levels[accountId] !== undefined && trail.levels[accountId] > 0) {
      const inEdge = trail.edges.find(e => e.txn.to === accountId);
      hits.push({ rule: 'R5', weight: WEIGHTS.R5, params: { level: trail.levels[accountId] }, evidence: inEdge ? [rowRef(inEdge.txn, 'credit')] : [] });
    }

    // R6 quick cash withdrawal within 2 hours of a credit
    const cash = debits.filter(d => d.t.rail === 'CASH');
    for (const d of cash) {
      const prior = credits.filter(c => Date.parse(c.time) <= Date.parse(d.time)).slice(-1)[0];
      if (prior && (Date.parse(d.time) - Date.parse(prior.time)) / 60000 <= th.cashMinutes) {
        hits.push({ rule: 'R6', weight: WEIGHTS.R6, params: { minutes: Math.round((Date.parse(d.time) - Date.parse(prior.time)) / 60000), amount: d.t.amount },
          evidence: [rowRef(prior.t, 'credit'), rowRef(d.t, 'debit')] });
        break;
      }
    }

    const score = Math.min(100, hits.reduce((s, h) => s + h.weight, 0));
    const band = score >= 75 ? 'critical' : score >= 50 ? 'high' : score >= 25 ? 'medium' : 'low';
    return { account: accountId, score, band, suspected: score >= 50, hits, totalIn, totalOut, closing: bal };
  }

  function evaluateAll(data, trail, thresholds) {
    return data.accounts
      .filter(a => a.statement.available && a.id !== trail.rootTxn.from)
      .map(a => evaluateAccount(data, trail, a.id, thresholds))
      .sort((a, b) => b.score - a.score);
  }

  return { evaluateAccount, evaluateAll, DEFAULT_THRESHOLDS, WEIGHTS };
});
