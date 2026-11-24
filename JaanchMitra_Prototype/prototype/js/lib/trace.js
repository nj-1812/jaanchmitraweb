/*
 * Money-trail tracer (deterministic).
 *
 * Method:
 *  1. Start from the victim's transaction (case.victimTxnId). Its receiver is hop level 1.
 *  2. From each account, follow outgoing transactions that happen AFTER the money arrived
 *     and within the time window (default 72 h). Money can only leave after it arrives — with a
 *     small tolerance (default 2 min), because some banks print times only to the minute and
 *     credit and debit times come from different banks' clocks.
 *  3. Breadth-first, up to maxDepth hops. If two branches merge into one account (fan-in), the
 *     EARLIEST arrival is used, so transfers funded by either branch are followed.
 *  4. Cash withdrawals end a branch (cash-out). A receiver without a statement ends a branch
 *     as an UNRESOLVED hop — we never guess where that money went next.
 *
 * Link classes (per transaction, from the statement rows):
 *  - confirmed : the same reference number (UTR/RRN) appears in BOTH sender and receiver statements
 *  - probable  : receiver row shows no reference number, but amount matches and times are within 5 minutes
 *  - unresolved: we do not have the receiver's statement row
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.JM = Object.assign(root.JM || {}, factory());
})(typeof self !== 'undefined' ? self : this, function () {
  const PROBABLE_MAX_SECONDS = 300;

  function indexAccounts(data) {
    const byId = {};
    data.accounts.forEach(a => { byId[a.id] = a; });
    return byId;
  }

  function classifyLink(txn, accountsById) {
    if (!txn.to) return null;
    const receiver = accountsById[txn.to];
    if (!receiver || !receiver.statement.available || !txn.receiverRow) {
      return { cls: 'unresolved', reason: 'noReceiverStatement' };
    }
    if (txn.senderRow && txn.senderRow.rrn && txn.receiverRow.rrn && txn.senderRow.rrn === txn.receiverRow.rrn) {
      return { cls: 'confirmed', reason: 'rrnInBoth', rrn: txn.senderRow.rrn };
    }
    const seconds = Math.abs(Date.parse(txn.receiverRow.time) - Date.parse(txn.senderRow.time)) / 1000;
    if (seconds <= PROBABLE_MAX_SECONDS) {
      return { cls: 'probable', reason: 'amountAndTime', seconds };
    }
    return { cls: 'possible', reason: 'amountOnly', seconds };
  }

  // When money landed in an account (receiver's own statement time if we have it).
  function arrivalTime(txn) { return txn.receiverRow ? txn.receiverRow.time : txn.time; }

  function buildTrail(data, opts) {
    const options = Object.assign({ windowHours: 72, maxDepth: 8, orderToleranceSec: 120 }, opts || {});
    const accountsById = indexAccounts(data);
    const rootTxn = data.transactions.find(t => t.id === data.case.victimTxnId);
    if (!rootTxn) throw new Error('Victim transaction not found');

    const levels = {};
    levels[rootTxn.from] = 0;
    levels[rootTxn.to] = 1;
    const edges = [{ txn: rootTxn, link: classifyLink(rootTxn, accountsById) }];
    const seenTxn = new Set([rootTxn.id]);
    const arrived = {};          // earliest time victim money is known to have reached each account
    const cashOuts = [];
    const unresolved = [];
    const queue = [];
    if (accountsById[rootTxn.to].statement.available) {
      arrived[rootTxn.to] = arrivalTime(rootTxn);
      queue.push({ account: rootTxn.to, arrivedAt: arrived[rootTxn.to] });
    }

    while (queue.length) {
      const { account, arrivedAt } = queue.shift();
      if (arrivedAt !== arrived[account]) continue; // a newer, earlier arrival superseded this visit
      if (levels[account] >= options.maxDepth) continue;
      const windowEnd = Date.parse(arrivedAt) + options.windowHours * 3600000;
      const outgoing = data.transactions
        .filter(t => t.from === account && Date.parse(t.time) >= Date.parse(arrivedAt) - options.orderToleranceSec * 1000 && Date.parse(t.time) <= windowEnd)
        .sort((a, b) => Date.parse(a.time) - Date.parse(b.time));

      outgoing.forEach(t => {
        if (seenTxn.has(t.id)) return;
        seenTxn.add(t.id);
        if (t.rail === 'CASH') { cashOuts.push({ account, txn: t }); return; }
        if (!t.to) return; // payment to an outside party not in our evidence
        const link = classifyLink(t, accountsById);
        edges.push({ txn: t, link });
        if (levels[t.to] === undefined || levels[t.to] > levels[account] + 1) levels[t.to] = levels[account] + 1;
        if (link.cls === 'unresolved') {
          if (!unresolved.some(u => u.account === t.to)) unresolved.push({ account: t.to, txn: t });
          return;
        }
        // Fan-in: if money reaches an account EARLIER than we knew, look at its outgoing transfers again
        const at = arrivalTime(t);
        if (arrived[t.to] === undefined || Date.parse(at) < Date.parse(arrived[t.to])) {
          arrived[t.to] = at;
          queue.push({ account: t.to, arrivedAt: at });
        }
      });
    }

    const cashOutAccounts = Array.from(new Set(cashOuts.map(c => c.account)));
    const maxLevel = Math.max.apply(null, Object.values(levels));
    return { rootTxn, levels, edges, cashOuts, cashOutAccounts, unresolved, maxLevel, accountsById };
  }

  // Role of an account in the trail, derived only from the trail itself.
  function trailRole(trail, accountId) {
    if (accountId === trail.rootTxn.from) return 'victim';
    if (trail.unresolved.some(u => u.account === accountId)) return 'unresolved';
    if (trail.cashOutAccounts.indexOf(accountId) !== -1) return 'cashout';
    if (trail.levels[accountId] !== undefined) return 'onTrail';
    return 'offTrail';
  }

  return { buildTrail, classifyLink, trailRole, arrivalTime, PROBABLE_MAX_SECONDS };
});
