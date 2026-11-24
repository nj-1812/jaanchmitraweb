/* Formatting helpers: Indian rupee grouping and IST/UTC times. Pure functions. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.JM = Object.assign(root.JM || {}, factory());
})(typeof self !== 'undefined' ? self : this, function () {
  // ₹4,50,000 style grouping (last 3 digits, then pairs). Amounts are whole rupees in the demo.
  function formatINR(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) return '—';
    const negative = amount < 0;
    const rounded = Math.round(Math.abs(amount));
    const s = String(rounded);
    let out;
    if (s.length <= 3) out = s;
    else {
      const last3 = s.slice(-3);
      let rest = s.slice(0, -3);
      const parts = [];
      while (rest.length > 2) { parts.unshift(rest.slice(-2)); rest = rest.slice(0, -2); }
      if (rest) parts.unshift(rest);
      out = parts.join(',') + ',' + last3;
    }
    return (negative ? '-₹' : '₹') + out;
  }

  // Times are stored as ISO strings with +05:30; read the printed clock time without locale surprises.
  function istTime(iso) { return iso ? iso.slice(11, 19) + ' IST' : '—'; }
  function istShortTime(iso) { return iso ? iso.slice(11, 16) : '—'; }
  function istDate(iso) { return iso ? iso.slice(0, 10) : '—'; }
  function istDateTime(iso) { return iso ? iso.slice(0, 10) + ' ' + iso.slice(11, 19) + ' IST' : '—'; }
  function utcString(iso) {
    if (!iso) return '—';
    return new Date(Date.parse(iso)).toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  }
  function minutesBetween(aIso, bIso) { return (Date.parse(bIso) - Date.parse(aIso)) / 60000; }

  return { formatINR, istTime, istShortTime, istDate, istDateTime, utcString, minutesBetween };
});
