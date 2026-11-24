/*
 * JaanchMitra prototype — FICTIONAL demo case.
 * Every name, account, IP, domain and phone number here is invented.
 * IPs use the documentation range 203.0.113.0/24; domains end in .example.
 *
 * This file holds RAW evidence only (what the statements and lookups say).
 * Nothing here is a conclusion: flags, link classes, levels and money figures
 * are all computed by the functions in js/lib/.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.JM_CASE = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  return {
    case: {
      id: 'JM/2026/0142',
      title: { hi: 'UPI निवेश धोखाधड़ी', en: 'UPI investment scheme fraud', hl: 'UPI investment dhokhadhadi' },
      station: { hi: 'साइबर पुलिस थाना, जयपुर (डेमो)', en: 'Cyber Police Station, Jaipur (demo)', hl: 'Cyber Police Thana, Jaipur (demo)' },
      status: { hi: 'जांच जारी', en: 'Under investigation', hl: 'Jaanch jaari' },
      ncrpAck: '31411260012345 (demo)',
      firNo: '0142/2026 (demo)',
      complaintReceived: '2026-11-21T12:05:00+05:30',
      victimTxnId: 'T1',
      summary: {
        hi: 'पीड़ित ने एक फ़र्ज़ी निवेश वेबसाइट के कहने पर UPI से ₹4,50,000 भेजे।',
        en: 'The victim sent ₹4,50,000 by UPI after being lured by a fake investment website.',
        hl: 'Victim ne ek fake investment website ke jhaanse mein aakar UPI se ₹4,50,000 bheje.'
      }
    },

    // statement.available = false means we do NOT have this account's statement.
    accounts: [
      { id: 'A1284', masked: '****1284', bank: 'Bank A', ifsc: 'BNKA0000123', vpa: 'victim.demo@banka', role: 'victim',
        holder: { hi: 'पीड़ित (डेमो)', en: 'Victim (demo)' }, openingBalance: 500000,
        statement: { available: true, file: 'stmt_1284_bankA.pdf', period: '2026-11-01 to 2026-11-21' } },
      { id: 'A7841', masked: '****7841', bank: 'Bank B', ifsc: 'BNKB0000456', vpa: 'growthpay@bankb', role: 'account',
        holder: { hi: 'खाताधारक B1 (डेमो)', en: 'Holder B1 (demo)' }, openingBalance: 0,
        statement: { available: true, file: 'stmt_7841_bankB.xlsx', period: '2026-11-01 to 2026-11-21' } },
      { id: 'A3321', masked: '****3321', bank: 'Bank C', ifsc: 'BNKC0000789', vpa: 'quickfunds3321@bankc', role: 'account',
        holder: { hi: 'खाताधारक C1 (डेमो)', en: 'Holder C1 (demo)' }, openingBalance: 0,
        statement: { available: true, file: 'stmt_3321_bankC.pdf', period: '2026-11-01 to 2026-11-21' } },
      { id: 'A7654', masked: '****7654', bank: 'Bank D', ifsc: 'BNKD0000321', vpa: 'rkstore7654@bankd', role: 'account',
        holder: { hi: 'खाताधारक D1 (डेमो)', en: 'Holder D1 (demo)' }, openingBalance: 0,
        statement: { available: true, file: 'stmt_7654_bankD.pdf', period: '2026-11-01 to 2026-11-21' } },
      { id: 'A9011', masked: '****9011', bank: 'Bank B', ifsc: 'BNKB0000457', vpa: 'payhub9011@bankb', role: 'account',
        holder: { hi: 'खाताधारक B2 (डेमो)', en: 'Holder B2 (demo)' }, openingBalance: 0,
        statement: { available: true, file: 'stmt_9011_bankB.xlsx', period: '2026-11-01 to 2026-11-21' } },
      { id: 'A4408', masked: '****4408', bank: 'Bank E', ifsc: 'BNKE0000654', vpa: 'shreeent4408@banke', role: 'account',
        holder: { hi: 'खाताधारक E1 (डेमो)', en: 'Holder E1 (demo)' }, openingBalance: 0,
        statement: { available: true, file: 'stmt_4408_bankE.pdf', period: '2026-11-01 to 2026-11-21' } },
      { id: 'A5566', masked: '****5566', bank: 'Bank C', ifsc: 'BNKC0000790', vpa: 'cash5566@bankc', role: 'account',
        holder: { hi: 'खाताधारक C2 (डेमो)', en: 'Holder C2 (demo)' }, openingBalance: 0,
        statement: { available: true, file: 'stmt_5566_bankC.pdf', period: '2026-11-01 to 2026-11-21' } },
      { id: 'A6788', masked: '****6788', bank: 'Bank D', ifsc: 'BNKD0000322', vpa: 'mart6788@bankd', role: 'account',
        holder: { hi: 'खाताधारक D2 (डेमो)', en: 'Holder D2 (demo)' }, openingBalance: 0,
        statement: { available: true, file: 'stmt_6788_bankD.xlsx', period: '2026-11-01 to 2026-11-21' } },
      { id: 'A2290', masked: '****2290', bank: 'Bank A', ifsc: 'BNKA0000124', vpa: null, role: 'account',
        holder: { hi: 'अज्ञात', en: 'Unknown' }, openingBalance: null,
        statement: { available: false, file: null, period: null } },
      // An innocent shop account in the same data set: rules must NOT flag it.
      { id: 'A5120', masked: '****5120', bank: 'Bank A', ifsc: 'BNKA0000125', vpa: 'kiranastore5120@banka', role: 'account',
        holder: { hi: 'किराना दुकान (डेमो)', en: 'Grocery shop (demo)' }, openingBalance: 40000,
        statement: { available: true, file: 'stmt_5120_bankA.pdf', period: '2026-11-01 to 2026-11-21' } }
    ],

    /*
     * Each transaction records what each statement row shows.
     * senderRow / receiverRow: { file, page, row, rrn, time } as printed.
     * receiverRow.rrn === null  -> the receiver's statement row shows no reference number.
     * receiverRow === null      -> no receiver statement row exists in our evidence.
     * to === null with rail CASH -> cash withdrawal (ATM / cheque self-withdrawal).
     */
    transactions: [
      { id: 'T1', from: 'A1284', to: 'A7841', amount: 450000, rail: 'UPI', time: '2026-11-21T10:24:31+05:30',
        senderRow: { file: 'stmt_1284_bankA.pdf', page: 1, row: 14, rrn: '632510241531', time: '2026-11-21T10:24:31+05:30' },
        receiverRow: { file: 'stmt_7841_bankB.xlsx', page: 1, row: 3, rrn: '632510241531', time: '2026-11-21T10:24:33+05:30' },
        narration: 'UPI/632510241531/GROWTH PAY/growthpay@bankb/Investment' },
      { id: 'T2', from: 'A7841', to: 'A3321', amount: 250000, rail: 'IMPS', time: '2026-11-21T10:28:47+05:30',
        senderRow: { file: 'stmt_7841_bankB.xlsx', page: 1, row: 4, rrn: '632510284712', time: '2026-11-21T10:28:47+05:30' },
        receiverRow: { file: 'stmt_3321_bankC.pdf', page: 1, row: 2, rrn: '632510284712', time: '2026-11-21T10:28:49+05:30' },
        narration: 'IMPS/P2A/632510284712/XXXXXX3321/Sent' },
      { id: 'T3', from: 'A7841', to: 'A7654', amount: 200000, rail: 'IMPS', time: '2026-11-21T10:29:10+05:30',
        senderRow: { file: 'stmt_7841_bankB.xlsx', page: 1, row: 5, rrn: '632510291034', time: '2026-11-21T10:29:10+05:30' },
        receiverRow: { file: 'stmt_7654_bankD.pdf', page: 1, row: 2, rrn: null, time: '2026-11-21T10:29:58+05:30' },
        narration: 'IMPS/P2A/632510291034/XXXXXX7654/Sent' },
      { id: 'T4', from: 'A3321', to: 'A9011', amount: 250000, rail: 'UPI', time: '2026-11-21T10:33:52+05:30',
        senderRow: { file: 'stmt_3321_bankC.pdf', page: 1, row: 3, rrn: '632510335290', time: '2026-11-21T10:33:52+05:30' },
        receiverRow: { file: 'stmt_9011_bankB.xlsx', page: 1, row: 2, rrn: '632510335290', time: '2026-11-21T10:33:53+05:30' },
        narration: 'UPI/632510335290/PAY HUB/payhub9011@bankb' },
      { id: 'T5', from: 'A7654', to: 'A4408', amount: 200000, rail: 'IMPS', time: '2026-11-21T10:35:05+05:30',
        senderRow: { file: 'stmt_7654_bankD.pdf', page: 1, row: 3, rrn: '632510350511', time: '2026-11-21T10:35:05+05:30' },
        receiverRow: { file: 'stmt_4408_bankE.pdf', page: 1, row: 2, rrn: null, time: '2026-11-21T10:36:40+05:30' },
        narration: 'IMPS/P2A/632510350511/XXXXXX4408/Sent' },
      { id: 'T6', from: 'A9011', to: 'A5566', amount: 230000, rail: 'IMPS', time: '2026-11-21T10:37:26+05:30',
        senderRow: { file: 'stmt_9011_bankB.xlsx', page: 1, row: 3, rrn: '632510372608', time: '2026-11-21T10:37:26+05:30' },
        receiverRow: { file: 'stmt_5566_bankC.pdf', page: 1, row: 2, rrn: '632510372608', time: '2026-11-21T10:37:27+05:30' },
        narration: 'IMPS/P2A/632510372608/XXXXXX5566/Sent' },
      { id: 'T7', from: 'A4408', to: 'A6788', amount: 90000, rail: 'IMPS', time: '2026-11-21T10:41:02+05:30',
        senderRow: { file: 'stmt_4408_bankE.pdf', page: 1, row: 3, rrn: '632510410277', time: '2026-11-21T10:41:02+05:30' },
        receiverRow: { file: 'stmt_6788_bankD.xlsx', page: 1, row: 2, rrn: null, time: '2026-11-21T10:42:30+05:30' },
        narration: 'IMPS/P2A/632510410277/XXXXXX6788/Sent' },
      { id: 'T8', from: 'A4408', to: 'A2290', amount: 20000, rail: 'UPI', time: '2026-11-21T10:52:00+05:30',
        senderRow: { file: 'stmt_4408_bankE.pdf', page: 1, row: 4, rrn: '632510520015', time: '2026-11-21T10:52:00+05:30' },
        receiverRow: null,
        narration: 'UPI/632510520015/XXXXXX2290/Transfer' },

      // Cash withdrawals from the two cash-out accounts
      { id: 'C1', from: 'A5566', to: null, amount: 100000, rail: 'CASH', time: '2026-11-21T11:02:10+05:30',
        senderRow: { file: 'stmt_5566_bankC.pdf', page: 1, row: 3, rrn: null, time: '2026-11-21T11:02:10+05:30' },
        receiverRow: null, narration: 'CHQ SELF WDL/000231/BR 0790 STATION RD SIKAR',
        place: { kind: 'branch', code: 'BR 0790', area: { en: 'Station Road branch counter', hi: 'स्टेशन रोड शाखा काउंटर' }, city: { en: 'Sikar', hi: 'सीकर' }, state: { en: 'Rajasthan', hi: 'राजस्थान' }, source: 'statement narration' } },
      { id: 'C2', from: 'A5566', to: null, amount: 100000, rail: 'CASH', time: '2026-11-21T11:20:44+05:30',
        senderRow: { file: 'stmt_5566_bankC.pdf', page: 1, row: 4, rrn: null, time: '2026-11-21T11:20:44+05:30' },
        receiverRow: null, narration: 'CASH WDL/BR 0790 STATION RD SIKAR',
        place: { kind: 'branch', code: 'BR 0790', area: { en: 'Station Road branch counter', hi: 'स्टेशन रोड शाखा काउंटर' }, city: { en: 'Sikar', hi: 'सीकर' }, state: { en: 'Rajasthan', hi: 'राजस्थान' }, source: 'statement narration' } },
      { id: 'C3', from: 'A5566', to: null, amount: 30000, rail: 'CASH', time: '2026-11-21T11:41:05+05:30',
        senderRow: { file: 'stmt_5566_bankC.pdf', page: 1, row: 5, rrn: null, time: '2026-11-21T11:41:05+05:30' },
        receiverRow: null, narration: 'ATM WDL/BNKC ATM SKR014/PIPRALI RD SIKAR',
        place: { kind: 'atm', code: 'SKR014', area: { en: 'Piprali Road', hi: 'पिपराली रोड' }, city: { en: 'Sikar', hi: 'सीकर' }, state: { en: 'Rajasthan', hi: 'राजस्थान' }, source: 'statement narration' } },
      { id: 'C4', from: 'A6788', to: null, amount: 40000, rail: 'CASH', time: '2026-11-21T11:10:19+05:30',
        senderRow: { file: 'stmt_6788_bankD.xlsx', page: 1, row: 3, rrn: null, time: '2026-11-21T11:10:19+05:30' },
        receiverRow: null, narration: 'ATM WDL/BNKD ATM ALW022/RLY STN ALWAR',
        place: { kind: 'atm', code: 'ALW022', area: { en: 'Railway Station area', hi: 'रेलवे स्टेशन क्षेत्र' }, city: { en: 'Alwar', hi: 'अलवर' }, state: { en: 'Rajasthan', hi: 'राजस्थान' }, source: 'statement narration' } },
      { id: 'C5', from: 'A6788', to: null, amount: 50000, rail: 'CASH', time: '2026-11-21T11:25:52+05:30',
        senderRow: { file: 'stmt_6788_bankD.xlsx', page: 1, row: 4, rrn: null, time: '2026-11-21T11:25:52+05:30' },
        receiverRow: null, narration: 'ATM WDL/BNKD ATM ALW031/MANU MARG ALWAR',
        place: { kind: 'atm', code: 'ALW031', area: { en: 'Manu Marg', hi: 'मनु मार्ग' }, city: { en: 'Alwar', hi: 'अलवर' }, state: { en: 'Rajasthan', hi: 'राजस्थान' }, source: 'statement narration' } },

      // Innocent shop account: many small, unrelated credits; spending spread over days
      { id: 'M1', from: null, to: 'A5120', amount: 240, rail: 'UPI', time: '2026-11-14T09:12:00+05:30', receiverRow: { file: 'stmt_5120_bankA.pdf', page: 1, row: 2, rrn: '631809120011', time: '2026-11-14T09:12:00+05:30' }, senderRow: null, narration: 'UPI/631809120011/CUSTOMER' },
      { id: 'M2', from: null, to: 'A5120', amount: 560, rail: 'UPI', time: '2026-11-14T18:40:00+05:30', receiverRow: { file: 'stmt_5120_bankA.pdf', page: 1, row: 3, rrn: '631818400012', time: '2026-11-14T18:40:00+05:30' }, senderRow: null, narration: 'UPI/631818400012/CUSTOMER' },
      { id: 'M3', from: null, to: 'A5120', amount: 1180, rail: 'UPI', time: '2026-11-15T11:05:00+05:30', receiverRow: { file: 'stmt_5120_bankA.pdf', page: 1, row: 4, rrn: '631911050013', time: '2026-11-15T11:05:00+05:30' }, senderRow: null, narration: 'UPI/631911050013/CUSTOMER' },
      { id: 'M4', from: null, to: 'A5120', amount: 320, rail: 'UPI', time: '2026-11-16T08:55:00+05:30', receiverRow: { file: 'stmt_5120_bankA.pdf', page: 1, row: 5, rrn: '632008550014', time: '2026-11-16T08:55:00+05:30' }, senderRow: null, narration: 'UPI/632008550014/CUSTOMER' },
      { id: 'M5', from: null, to: 'A5120', amount: 875, rail: 'UPI', time: '2026-11-17T19:20:00+05:30', receiverRow: { file: 'stmt_5120_bankA.pdf', page: 1, row: 6, rrn: '632119200015', time: '2026-11-17T19:20:00+05:30' }, senderRow: null, narration: 'UPI/632119200015/CUSTOMER' },
      { id: 'M6', from: 'A5120', to: null, amount: 9000, rail: 'NEFT', time: '2026-11-18T12:00:00+05:30', senderRow: { file: 'stmt_5120_bankA.pdf', page: 1, row: 7, rrn: null, time: '2026-11-18T12:00:00+05:30' }, receiverRow: null, narration: 'NEFT/SUPPLIER PAYMENT/WHOLESALE (demo)', payee: 'external' },
      { id: 'M7', from: null, to: 'A5120', amount: 2150, rail: 'UPI', time: '2026-11-18T17:45:00+05:30', receiverRow: { file: 'stmt_5120_bankA.pdf', page: 1, row: 8, rrn: '632217450017', time: '2026-11-18T17:45:00+05:30' }, senderRow: null, narration: 'UPI/632217450017/CUSTOMER' },
      { id: 'M8', from: null, to: 'A5120', amount: 460, rail: 'UPI', time: '2026-11-19T10:10:00+05:30', receiverRow: { file: 'stmt_5120_bankA.pdf', page: 1, row: 9, rrn: '632310100018', time: '2026-11-19T10:10:00+05:30' }, senderRow: null, narration: 'UPI/632310100018/CUSTOMER' },
      { id: 'M9', from: null, to: 'A5120', amount: 999, rail: 'UPI', time: '2026-11-20T13:30:00+05:30', receiverRow: { file: 'stmt_5120_bankA.pdf', page: 1, row: 10, rrn: '632413300019', time: '2026-11-20T13:30:00+05:30' }, senderRow: null, narration: 'UPI/632413300019/CUSTOMER' },
      { id: 'M10', from: 'A5120', to: null, amount: 1850, rail: 'BBPS', time: '2026-11-20T16:00:00+05:30', senderRow: { file: 'stmt_5120_bankA.pdf', page: 1, row: 11, rrn: null, time: '2026-11-20T16:00:00+05:30' }, receiverRow: null, narration: 'BBPS/ELECTRICITY BILL (demo)', payee: 'external' },
      { id: 'M11', from: null, to: 'A5120', amount: 1350, rail: 'UPI', time: '2026-11-21T09:40:00+05:30', receiverRow: { file: 'stmt_5120_bankA.pdf', page: 1, row: 12, rrn: '632509400021', time: '2026-11-21T09:40:00+05:30' }, senderRow: null, narration: 'UPI/632509400021/CUSTOMER' },
      { id: 'M12', from: null, to: 'A5120', amount: 700, rail: 'UPI', time: '2026-11-21T18:15:00+05:30', receiverRow: { file: 'stmt_5120_bankA.pdf', page: 1, row: 13, rrn: '632518150022', time: '2026-11-21T18:15:00+05:30' }, senderRow: null, narration: 'UPI/632518150022/CUSTOMER' }
    ],

    // Passive intelligence records: each with its source and when we looked it up.
    digital: {
      domain: {
        name: 'invest-growth.example',
        registrar: 'Registrar A (demo)', reseller: 'Reseller A (demo)',
        created: { value: '2026-11-20T09:58:00+05:30', kind: 'event', source: 'RDAP' },
        expires: { value: '2027-11-20T09:58:00+05:30', kind: 'event', source: 'RDAP' },
        status: ['clientTransferProhibited'],
        nameservers: ['ns1.dns-park.example', 'ns2.dns-park.example'],
        abuseContact: 'abuse@registrar-a.example',
        lookedUpAt: '2026-11-22T09:15:00+05:30'
      },
      certificate: {
        issuer: 'Demo DV CA', sans: ['invest-growth.example', 'www.invest-growth.example', 'pay.invest-growth.example'],
        validFrom: { value: '2026-11-20T10:02:00+05:30', kind: 'event', source: 'CT log (crt.sh, demo)' },
        validTo: { value: '2027-02-18T10:02:00+05:30', kind: 'event', source: 'CT log (crt.sh, demo)' },
        lookedUpAt: '2026-11-22T09:16:00+05:30'
      },
      dns: [
        { type: 'A', value: '203.0.113.45', observedAt: '2026-11-22T09:15:30+05:30', source: 'Public resolver lookup (demo)' },
        { type: 'NS', value: 'ns1.dns-park.example', observedAt: '2026-11-22T09:15:30+05:30', source: 'Public resolver lookup (demo)' },
        { type: 'MX', value: 'none', observedAt: '2026-11-22T09:15:30+05:30', source: 'Public resolver lookup (demo)' }
      ],
      ip: {
        address: '203.0.113.45', version: 'IPv4', asn: 'AS64500', asnName: 'Host A Cloud (demo)',
        type: 'cloud', reverseDns: 'vps-45.host-a.example', tor: false, vpn: false,
        indicativeLocation: { value: { hi: 'सिंगापुर', en: 'Singapore', hl: 'Singapore' }, source: 'GeoLite2 (demo)' },
        abuseContact: 'abuse@host-a.example', lookedUpAt: '2026-11-22T09:17:00+05:30'
      },
      // Supplied by the investigator (screenshot from the victim's phone) — never fetched from the live site.
      websiteEvidence: {
        file: 'victim_screenshot_01.png', suppliedBy: { hi: 'जांच अधिकारी', en: 'Investigating officer', hl: 'Jaanch adhikari (IO)' },
        vpas: ['GrowthPay@BankB'], phones: ['+91 90000 00001']
      }
    }
  };
});
