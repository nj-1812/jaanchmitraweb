/*
 * FICTIONAL routing directory for the demo.
 * In a real deployment: IFSC -> bank from the public IFSC dataset; UPI handle -> bank from a maintained,
 * verified table; nodal-officer contacts from an editable directory with source notes.
 * Contacts that are not public stay as placeholders — never invented.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.JM_DIRECTORY = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  return {
    ifscPrefix: { BNKA: 'Bank A', BNKB: 'Bank B', BNKC: 'Bank C', BNKD: 'Bank D', BNKE: 'Bank E' },
    upiHandle: { banka: 'Bank A', bankb: 'Bank B', bankc: 'Bank C', bankd: 'Bank D', banke: 'Bank E' },
    nodal: {
      'Bank A': { contact: 'nodal.cyber@bank-a.example', source: 'Demo directory' },
      'Bank B': { contact: 'nodal.cyber@bank-b.example', source: 'Demo directory' },
      'Bank C': { contact: null, source: 'Not public — officer to fill' },
      'Bank D': { contact: 'nodal.cyber@bank-d.example', source: 'Demo directory' },
      'Bank E': { contact: 'nodal.cyber@bank-e.example', source: 'Demo directory' }
    },
    // Home branch of each account, looked up from its IFSC (FICTIONAL branches for the demo; real cities for realism).
    // This is where the account is HELD — not where an online payment was made.
    branches: {
      BNKA0000123: { branch: { en: 'Malviya Nagar', hi: 'मालवीय नगर' }, city: { en: 'Jaipur', hi: 'जयपुर' }, district: { en: 'Jaipur', hi: 'जयपुर' }, state: { en: 'Rajasthan', hi: 'राजस्थान' }, pin: '302017' },
      BNKB0000456: { branch: { en: 'Sardarpura', hi: 'सरदारपुरा' }, city: { en: 'Jodhpur', hi: 'जोधपुर' }, district: { en: 'Jodhpur', hi: 'जोधपुर' }, state: { en: 'Rajasthan', hi: 'राजस्थान' }, pin: '342003' },
      BNKC0000789: { branch: { en: 'Talwandi', hi: 'तलवंडी' }, city: { en: 'Kota', hi: 'कोटा' }, district: { en: 'Kota', hi: 'कोटा' }, state: { en: 'Rajasthan', hi: 'राजस्थान' }, pin: '324005' },
      BNKD0000321: { branch: { en: 'Vaishali Nagar', hi: 'वैशाली नगर' }, city: { en: 'Ajmer', hi: 'अजमेर' }, district: { en: 'Ajmer', hi: 'अजमेर' }, state: { en: 'Rajasthan', hi: 'राजस्थान' }, pin: '305004' },
      BNKB0000457: { branch: { en: 'Hiran Magri', hi: 'हिरण मगरी' }, city: { en: 'Udaipur', hi: 'उदयपुर' }, district: { en: 'Udaipur', hi: 'उदयपुर' }, state: { en: 'Rajasthan', hi: 'राजस्थान' }, pin: '313002' },
      BNKE0000654: { branch: { en: 'Pur Road', hi: 'पुर रोड' }, city: { en: 'Bhilwara', hi: 'भीलवाड़ा' }, district: { en: 'Bhilwara', hi: 'भीलवाड़ा' }, state: { en: 'Rajasthan', hi: 'राजस्थान' }, pin: '311001' },
      BNKC0000790: { branch: { en: 'Station Road', hi: 'स्टेशन रोड' }, city: { en: 'Sikar', hi: 'सीकर' }, district: { en: 'Sikar', hi: 'सीकर' }, state: { en: 'Rajasthan', hi: 'राजस्थान' }, pin: '332001' },
      BNKD0000322: { branch: { en: 'Hope Circus', hi: 'होप सर्कस' }, city: { en: 'Alwar', hi: 'अलवर' }, district: { en: 'Alwar', hi: 'अलवर' }, state: { en: 'Rajasthan', hi: 'राजस्थान' }, pin: '301001' },
      BNKA0000124: { branch: { en: 'Sector 14', hi: 'सेक्टर 14' }, city: { en: 'Gurugram', hi: 'गुरुग्राम' }, district: { en: 'Gurugram', hi: 'गुरुग्राम' }, state: { en: 'Haryana', hi: 'हरियाणा' }, pin: '122001' },
      BNKA0000125: { branch: { en: 'Johari Bazar', hi: 'जौहरी बाज़ार' }, city: { en: 'Jaipur', hi: 'जयपुर' }, district: { en: 'Jaipur', hi: 'जयपुर' }, state: { en: 'Rajasthan', hi: 'राजस्थान' }, pin: '302003' },
    },
    // Approximate city-centre coordinates (latitude, longitude) for the schematic Places view. Not addresses.
    cityCoords: { Jaipur: [26.91, 75.79], Jodhpur: [26.24, 73.02], Kota: [25.21, 75.86], Ajmer: [26.45, 74.64], Udaipur: [24.58, 73.71],
      Bhilwara: [25.35, 74.64], Sikar: [27.61, 75.14], Alwar: [27.55, 76.60], Gurugram: [28.46, 77.03] },
    // Carrier ASNs whose IPs are typically shared by many subscribers (CGNAT). Fictional numbers.
    carrierAsns: ['AS64510', 'AS64511'],
    verifiedOn: '2026-11-21'
  };
});
