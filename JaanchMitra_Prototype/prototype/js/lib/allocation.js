/*
 * Money Trace Radar — victim-fund allocation (deterministic).
 *
 * Every account holds "lots" of money, each marked victim or other (clean / unknown origin).
 * Transactions are replayed in time order:
 *  - a credit adds a lot to the receiver. Only money traced from the victim's transaction is a victim lot.
 *  - a debit removes money from the sender's lots:
 *      FIFO = oldest lots leave first, LIFO = newest lots leave first.
 *    The victim share of what left becomes the victim share of that transaction.
 *  - victim money sent to an account whose statement we do not have becomes UNRESOLVED.
 *  - victim money withdrawn in cash is counted as WITHDRAWN.
 *
 * Per account we report three figures (never mixed up):
 *  observedBalance  : balance the statement shows at the end
 *  victimAttributed : victim money that came into the account
 *  estTraceable     : victim money estimated to remain (never more than observedBalance)
 *
 * This is an analytical estimate under a stated method, not a recovery guarantee.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.JM = Object.assign(root.JM || {}, factory());
})(typeof self !== 'undefined' ? self : this, function () {
  function allocate(data, trail, method) {
    if (method !== 'FIFO' && method !== 'LIFO') throw new Error('Unknown method ' + method);
    const accountsById = trail.accountsById;
    const lots = {};
    const result = {};
    data.accounts.forEach(a => {
      lots[a.id] = [];
      if (a.statement.available && a.openingBalance > 0) lots[a.id].push({ amount: a.openingBalance, victim: false });
      result[a.id] = { observedBalance: a.statement.available ? (a.openingBalance || 0) : null,
        victimAttributed: 0, estTraceable: 0, withdrawnVictim: 0, forwardedVictim: 0, unresolvedVictim: 0 };
    });

    const victimShare = {};   // txn id -> victim amount carried
    let unresolvedTotal = 0;
    let withdrawnTotal = 0;
    const warnings = [];

    const ordered = data.transactions.slice().sort((a, b) => Date.parse(a.time) - Date.parse(b.time));

    ordered.forEach(t => {
      // 1) Debit side
      let victimPart = 0;
      const sender = t.from ? accountsById[t.from] : null;
      if (t.id === trail.rootTxn.id) {
        victimPart = t.amount; // the victim's own payment is, by definition, victim money
        consume(lots[t.from], t.amount, method);
        result[t.from].observedBalance -= t.amount;
      } else if (sender && sender.statement.available) {
        const taken = consume(lots[t.from], t.amount, method);
        if (taken.shortfall > 0) warnings.push({ txn: t.id, shortfall: taken.shortfall });
        victimPart = taken.victim;
        result[t.from].observedBalance -= t.amount;
        if (t.rail === 'CASH') { result[t.from].withdrawnVictim += victimPart; withdrawnTotal += victimPart; }
        else if (victimPart > 0) result[t.from].forwardedVictim += victimPart;
      }
      victimShare[t.id] = victimPart;

      // 2) Credit side
      if (t.to) {
        const receiver = accountsById[t.to];
        if (receiver && receiver.statement.available) {
          if (victimPart > 0) lots[t.to].push({ amount: victimPart, victim: true });
          if (t.amount - victimPart > 0) lots[t.to].push({ amount: t.amount - victimPart, victim: false });
          result[t.to].observedBalance += t.amount;
          result[t.to].victimAttributed += victimPart;
        } else if (victimPart > 0) {
          result[t.from].unresolvedVictim += victimPart;
          result[t.to].victimAttributed += victimPart;
          unresolvedTotal += victimPart;
        }
      }
    });

    let estTraceableTotal = 0;
    data.accounts.forEach(a => {
      if (!a.statement.available || a.id === trail.rootTxn.from) return;
      const remaining = lots[a.id].filter(l => l.victim).reduce((s, l) => s + l.amount, 0);
      result[a.id].estTraceable = Math.min(remaining, result[a.id].observedBalance);
      estTraceableTotal += result[a.id].estTraceable;
    });

    const reachedCashOut = trail.cashOutAccounts.reduce((s, id) => s + result[id].victimAttributed, 0);

    return {
      method, perAccount: result, victimShare, warnings,
      totals: {
        victimLoss: trail.rootTxn.amount,
        estTraceable: estTraceableTotal,
        unresolved: unresolvedTotal,
        withdrawn: withdrawnTotal,
        reachedCashOut
      }
    };
  }

  // Remove `amount` from a lot list. FIFO takes from the front, LIFO from the back.
  function consume(lotList, amount, method) {
    let need = amount;
    let victim = 0;
    while (need > 0 && lotList.length) {
      const idx = method === 'FIFO' ? 0 : lotList.length - 1;
      const lot = lotList[idx];
      const take = Math.min(lot.amount, need);
      if (lot.victim) victim += take;
      lot.amount -= take;
      need -= take;
      if (lot.amount === 0) lotList.splice(idx, 1);
    }
    return { victim, shortfall: need };
  }

  // Ranked hold-request priority: estimated traceable amount first, then fewer hops from the victim.
  function priorityList(allocation, trail) {
    return Object.keys(allocation.perAccount)
      .filter(id => allocation.perAccount[id].estTraceable > 0)
      .map(id => ({ account: id, estTraceable: allocation.perAccount[id].estTraceable,
        observedBalance: allocation.perAccount[id].observedBalance,
        victimAttributed: allocation.perAccount[id].victimAttributed, level: trail.levels[id] }))
      .sort((a, b) => b.estTraceable - a.estTraceable || a.level - b.level);
  }

  return { allocate, priorityList, consume };
});
