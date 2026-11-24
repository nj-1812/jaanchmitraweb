/*
 * Official helplines shown to officers and victims. REAL numbers and sites (not demo data).
 * Checked against official sources on 22-11-2026: cybercrime.gov.in / MHA (1930), Sanchar Saathi (Chakshu, CEIR),
 * RBI RB-IOS 2026 FAQ (cms.rbi.org.in, 14448). Re-check before any release.
 * "tel:" links open the phone's dialler — the person places the call; the app never calls or reports for anyone.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.JM_HELPLINES = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  return {
    checkedOn: '2026-11-22',
    list: [
      { id: '1930', name: '1930 · NCRP', desc: 'hd1930', urgent: true,
        actions: [{ kind: 'tel', value: '1930' }, { kind: 'web', url: 'https://cybercrime.gov.in/', label: 'cybercrime.gov.in' }] },
      { id: 'chakshu', name: 'Chakshu', desc: 'hdChakshu',
        actions: [{ kind: 'web', url: 'https://sancharsaathi.gov.in/sfc/', label: 'sancharsaathi.gov.in/sfc' }] },
      { id: 'ceir', name: 'CEIR', desc: 'hdCeir',
        actions: [{ kind: 'web', url: 'https://www.ceir.gov.in/', label: 'ceir.gov.in' }] },
      { id: 'rbi', name: 'RBI Ombudsman', desc: 'hdRbi',
        actions: [{ kind: 'tel', value: '14448' }, { kind: 'web', url: 'https://cms.rbi.org.in/', label: 'cms.rbi.org.in' }] },
      { id: '112', name: '112', desc: 'hd112', urgent: true,
        actions: [{ kind: 'tel', value: '112' }] }
    ]
  };
});
