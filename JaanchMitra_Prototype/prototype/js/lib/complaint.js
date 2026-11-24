/*
 * Complaint intake: read a complaint from an imported file or the typed form,
 * normalise values, check their format, and cross-check identifiers against the
 * case's evidence. Deterministic only: unknown labels are listed, never guessed;
 * nothing is saved or sent from here.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.JM = Object.assign(root.JM || {}, factory());
})(typeof self !== 'undefined' ? self : this, function () {

  // Field order is also the form order.
  const FIELDS = [
    { key: 'ncrpAck', type: 'text', group: 'c' },
    { key: 'received', type: 'datetime', group: 'c', required: true },
    { key: 'name', type: 'text', group: 'c', required: true },
    { key: 'mobile', type: 'mobile', group: 'c', required: true },
    { key: 'fraudType', type: 'select', group: 'c', required: true },
    { key: 'txnTime', type: 'datetime', group: 'p', required: true },
    { key: 'amount', type: 'amount', group: 'p', required: true },
    { key: 'utr', type: 'ref', group: 'p' },
    { key: 'victimBank', type: 'text', group: 'p' },
    { key: 'victimAcct', type: 'text', group: 'p' },
    { key: 'ifsc', type: 'ifsc', group: 'p' },
    { key: 'payee', type: 'payee', group: 's' },
    { key: 'website', type: 'url', group: 's' },
    { key: 'suspectPhone', type: 'phones', group: 's' },
    { key: 'description', type: 'textarea', group: 'd', required: true }
  ];
  const FRAUD_TYPES = ['investment', 'task', 'kyc', 'loan', 'shopping', 'sextortion', 'other'];

  // Labels a complaint file may use for each field (compared after normaliseLabel).
  const ALIASES = {
    ncrpAck: ['ncrp', 'ncrpack', 'ncrpackno', 'ackno', 'acknowledgementno', 'acknowledgementnumber', 'ncrpacknowledgementno', 'complaintno', 'पावतीसंख्या'],
    received: ['received', 'complaintreceived', 'complaintdate', 'complaintdatetime', 'dateofcomplaint', 'reportedon', 'शिकायतकीतारीख'],
    name: ['name', 'complainantname', 'victimname', 'नाम', 'शिकायतकर्ताकानाम'],
    mobile: ['mobile', 'mobileno', 'phone', 'phoneno', 'contactno', 'complainantmobile', 'victimmobile', 'मोबाइल'],
    fraudType: ['fraudtype', 'typeoffraud', 'category', 'subcategory', 'धोखाधड़ीकाप्रकार'],
    txnTime: ['txntime', 'txndate', 'transactiondate', 'transactiondatetime', 'transactiontime', 'dateoftransaction', 'paymenttime', 'paymentdate'],
    amount: ['amount', 'amountrs', 'amountlost', 'fraudamount', 'transactionamount', 'राशि'],
    utr: ['utr', 'utrno', 'utrnumber', 'rrn', 'rrnno', 'utrrrn', 'transactionid', 'txnid', 'referenceno', 'यूटीआर'],
    victimBank: ['victimbank', 'bank', 'bankname', 'bankwalletmerchant'],
    victimAcct: ['victimacct', 'victimaccount', 'victimaccountno', 'accountno', 'accountnumber'],
    ifsc: ['ifsc', 'ifsccode'],
    payee: ['payee', 'paidto', 'payeevpa', 'suspectupi', 'upiid', 'beneficiary', 'beneficiaryaccount', 'suspectaccount'],
    website: ['website', 'url', 'link', 'suspectwebsite'],
    suspectPhone: ['suspectphone', 'suspectmobile', 'suspectnumber', 'fraudsternumber'],
    description: ['description', 'details', 'incidentdetails', 'complaintdetails', 'whathappened', 'विवरण']
  };
  const FRAUD_ALIASES = {
    investment: ['investment', 'investmentscam', 'investmentfraud', 'trading'], task: ['task', 'job', 'onlinejob', 'parttimejob'],
    kyc: ['kyc', 'otp', 'kycfraud', 'fakecall'], loan: ['loan', 'loanapp'], shopping: ['shopping', 'onlineshopping', 'ecommerce'],
    sextortion: ['sextortion', 'blackmail'], other: ['other', 'others']
  };

  const normaliseLabel = s => String(s || '').toLowerCase().replace(/[\s_\-.:()/#*]+/g, '');
  const LABEL_TO_KEY = {};
  Object.keys(ALIASES).forEach(k => ALIASES[k].forEach(a => { LABEL_TO_KEY[a] = k; }));
  FIELDS.forEach(f => { LABEL_TO_KEY[normaliseLabel(f.key)] = f.key; });

  /* ---------- value normalisers (return null when the value cannot be read) ---------- */
  function parseAmount(v) {
    if (typeof v === 'number') return v > 0 ? v : null;
    const s = String(v || '').replace(/₹|rs\.?|inr|\/-|,|\s/gi, '');
    if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
    const n = Number(s);
    return n > 0 ? n : null;
  }
  const pad = n => String(n).padStart(2, '0');
  // Returns local IST 'YYYY-MM-DDTHH:MM:SS' (the form's value) or null.
  function parseDateTime(v) {
    const s = String(v || '').trim();
    let m = s.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?\s*(Z|[+-]\d{2}:?\d{2})?$/i);
    let y, mo, d, h, mi, se, ap = null, off = null;
    if (m) { [y, mo, d, h, mi, se, off] = [m[1], m[2], m[3], m[4], m[5], m[6] || '0', m[7] || null]; }
    else {
      m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})[ ,T]+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])?$/);
      if (!m) return null;
      [d, mo, y, h, mi, se, ap] = [m[1], m[2], m[3], m[4], m[5], m[6] || '0', m[7] || null];
    }
    y = +y; mo = +mo; d = +d; h = +h; mi = +mi; se = +se;
    if (ap) { if (h < 1 || h > 12) return null; h = (h % 12) + (/p/i.test(ap) ? 12 : 0); }
    if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59 || se > 59) return null;
    let ms = Date.UTC(y, mo - 1, d, h, mi, se);
    const chk = new Date(ms);
    if (chk.getUTCDate() !== d || chk.getUTCMonth() !== mo - 1) return null; // e.g. 31-02
    if (off) { // convert an explicit offset to IST wall time
      const offMin = off.toUpperCase() === 'Z' ? 0 : (off[0] === '-' ? -1 : 1) * (+off.slice(1, 3) * 60 + +off.slice(-2));
      ms = ms - offMin * 60000 + 330 * 60000;
    }
    const x = new Date(ms);
    return x.getUTCFullYear() + '-' + pad(x.getUTCMonth() + 1) + '-' + pad(x.getUTCDate()) + 'T' + pad(x.getUTCHours()) + ':' + pad(x.getUTCMinutes()) + ':' + pad(x.getUTCSeconds());
  }
  const istIso = local => local ? (local.length === 16 ? local + ':00' : local) + '+05:30' : null;
  function normMobile(v) {
    let s = String(v || '').replace(/[\s\-()]/g, '');
    s = s.replace(/^(\+91|0091|91(?=\d{10}$)|0(?=\d{10}$))/, '');
    return /^[6-9]\d{9}$/.test(s) ? s : null;
  }
  const normVpa = v => String(v || '').trim().toLowerCase();
  const isVpa = v => /^[a-z0-9.\-_]{2,256}@[a-z][a-z0-9]{1,63}$/.test(normVpa(v));
  function host(v) {
    const s = String(v || '').trim().toLowerCase().replace(/^[a-z]+:\/\//, '').replace(/^www\./, '').split(/[/?#:]/)[0];
    return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(s) ? s : null;
  }
  const splitList = v => String(v || '').split(/[,;|]/).map(s => s.trim()).filter(Boolean);
  function fraudTypeOf(v) {
    const n = normaliseLabel(v);
    if (FRAUD_TYPES.indexOf(n) !== -1) return n;
    return Object.keys(FRAUD_ALIASES).find(k => FRAUD_ALIASES[k].indexOf(n) !== -1) || null;
  }

  /* ---------- file parsers: all return { pairs: [[label, value]...], records } ---------- */
  function parseCsvRows(text) {
    const rows = []; let row = [], cell = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; }
      else if (ch === '"') q = true;
      else if (ch === ',') { row.push(cell); cell = ''; }
      else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
      else cell += ch;
    }
    if (q) throw new Error('unclosed quote');
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return rows.map(r => r.map(c => c.trim())).filter(r => r.some(c => c !== ''));
  }
  function fromCsv(text) {
    const rows = parseCsvRows(text);
    if (!rows.length) return { pairs: [], records: 0 };
    // Two columns and the first column is labels -> "label,value" layout.
    const labelCol = rows.every(r => r.length <= 2) && rows.filter(r => LABEL_TO_KEY[normaliseLabel(r[0])]).length >= Math.min(2, rows.length);
    if (labelCol) {
      const body = /^(field|label)$/i.test(rows[0][0]) ? rows.slice(1) : rows;
      return { pairs: body.map(r => [r[0], r[1] || '']), records: 1 };
    }
    const head = rows[0];
    return { pairs: head.map((h, i) => [h, (rows[1] || [])[i] || '']), records: Math.max(0, rows.length - 1) };
  }
  function fromJson(text) {
    let o = JSON.parse(text); let records = 1;
    if (Array.isArray(o)) { records = o.length; o = o[0] || {}; }
    if (o && typeof o.complaint === 'object' && !Array.isArray(o.complaint)) o = o.complaint;
    if (!o || typeof o !== 'object') throw new Error('not an object');
    return { pairs: Object.keys(o).map(k => [k, Array.isArray(o[k]) ? o[k].join(', ') : (o[k] == null ? '' : String(o[k]))]), records };
  }
  function fromText(text) {
    const pairs = []; let last = null;
    text.split(/\r?\n/).forEach(line => {
      const m = line.match(/^\s*([^:]{1,60}?)\s*:\s*(.*)$/);
      if (m && LABEL_TO_KEY[normaliseLabel(m[1])]) { last = [m[1], m[2].trim()]; pairs.push(last); }
      else if (m && !last) { last = [m[1], m[2].trim()]; pairs.push(last); }
      else if (line.trim() && last) last[1] = (last[1] + '\n' + line.trim()).trim(); // continuation line
    });
    return { pairs, records: pairs.length ? 1 : 0 };
  }

  // Turn label/value pairs into form values. Values that cannot be read are kept as typed
  // so the officer sees them and the format check flags them.
  function mapPairs(pairs) {
    const values = {}, filled = [], unused = [];
    pairs.forEach(([label, raw]) => {
      const key = LABEL_TO_KEY[normaliseLabel(label)];
      const v = String(raw == null ? '' : raw).trim();
      if (!key) { if (String(label).trim()) unused.push(String(label).trim()); return; }
      if (!v || values[key] != null) return;
      values[key] = normaliseValue(key, v);
      filled.push(key);
    });
    return { values, filled, unused };
  }
  function normaliseValue(key, v) {
    const f = FIELDS.find(x => x.key === key);
    switch (f.type) {
      case 'datetime': return parseDateTime(v) || v;
      case 'amount': { const n = parseAmount(v); return n != null ? String(n) : v; }
      case 'mobile': return normMobile(v) || v;
      case 'ref': return v.replace(/\s/g, '').toUpperCase();
      case 'ifsc': return v.replace(/\s/g, '').toUpperCase();
      case 'select': return fraudTypeOf(v) || 'other';
      default: return v;
    }
  }
  function parseComplaintFile(name, text) {
    const ext = (String(name).split('.').pop() || '').toLowerCase();
    const clean = String(text || '').replace(/^﻿/, '');
    let res;
    if (ext === 'json') res = fromJson(clean);
    else if (ext === 'csv') res = fromCsv(clean);
    else if (ext === 'txt') res = fromText(clean);
    else throw Object.assign(new Error('unsupported'), { code: 'type' });
    const m = mapPairs(res.pairs);
    return Object.assign(m, { records: res.records });
  }

  /* ---------- format check ---------- */
  // Returns { errors: [{field, code}], warnings: [{field, code, value?}] }. Codes map to i18n keys v_<code>.
  function validate(values, nowMs) {
    const v = values || {}; const errors = [], warnings = [];
    const now = nowMs == null ? Date.now() : nowMs;
    const has = k => v[k] != null && String(v[k]).trim() !== '';
    FIELDS.forEach(f => { if (f.required && !has(f.key)) errors.push({ field: f.key, code: 'required' }); });
    const times = {};
    ['received', 'txnTime'].forEach(k => {
      if (!has(k)) return;
      const p = parseDateTime(v[k]);
      if (!p) { errors.push({ field: k, code: 'date' }); return; }
      times[k] = Date.parse(istIso(p));
      if (times[k] > now + 60000) errors.push({ field: k, code: 'future' });
    });
    if (times.received != null && times.txnTime != null && times.txnTime > times.received) errors.push({ field: 'txnTime', code: 'order' });
    if (has('mobile') && !normMobile(v.mobile)) errors.push({ field: 'mobile', code: 'mobile' });
    if (has('amount') && parseAmount(v.amount) == null) errors.push({ field: 'amount', code: 'amount' });
    if (has('fraudType') && FRAUD_TYPES.indexOf(v.fraudType) === -1) errors.push({ field: 'fraudType', code: 'required' });
    if (has('utr')) { const u = String(v.utr).replace(/\s/g, '').toUpperCase(); if (!/^\d{12}$/.test(u) && !/^[A-Z0-9]{16,22}$/.test(u)) errors.push({ field: 'utr', code: 'utr' }); }
    else warnings.push({ field: 'utr', code: 'noUtr' });
    if (has('ifsc') && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(String(v.ifsc).trim().toUpperCase())) errors.push({ field: 'ifsc', code: 'ifsc' });
    if (has('payee') && String(v.payee).indexOf('@') !== -1 && !isVpa(v.payee)) errors.push({ field: 'payee', code: 'vpa' });
    if (has('website') && !host(v.website)) errors.push({ field: 'website', code: 'url' });
    if (has('suspectPhone')) splitList(v.suspectPhone).forEach(p => { if (!normMobile(p)) warnings.push({ field: 'suspectPhone', code: 'phone', value: p }); });
    if (has('ncrpAck') && !/^\d{14}$/.test(String(v.ncrpAck).replace(/\s/g, ''))) warnings.push({ field: 'ncrpAck', code: 'ncrp' });
    const delayMinutes = times.received != null && times.txnTime != null && times.txnTime <= times.received ? Math.round((times.received - times.txnTime) / 60000) : null;
    return { errors, warnings, delayMinutes, ok: errors.length === 0 };
  }

  /* ---------- cross-check identifiers against the case evidence (same identifier != identity) ---------- */
  function crossCheck(values, data) {
    const v = values || {}; const out = [];
    const utr = String(v.utr || '').replace(/\s/g, '').toUpperCase();
    if (utr) {
      (data.transactions || []).forEach(tx => {
        ['senderRow', 'receiverRow'].forEach(side => {
          const r = tx[side];
          if (r && r.rrn && r.rrn.toUpperCase() === utr && !out.some(o => o.kind === 'utr' && o.txnId === tx.id))
            out.push({ kind: 'utr', txnId: tx.id, file: r.file, row: r.row, amount: tx.amount, amountMatches: parseAmount(v.amount) === tx.amount });
        });
      });
    }
    if (v.payee && isVpa(v.payee)) {
      const p = normVpa(v.payee);
      (data.accounts || []).forEach(a => { if (a.vpa && normVpa(a.vpa) === p) out.push({ kind: 'vpaAcct', vpa: v.payee.trim(), acctId: a.id, masked: a.masked, bank: a.bank }); });
      const ev = data.digital && data.digital.websiteEvidence;
      if (ev && ev.vpas.some(x => normVpa(x) === p)) out.push({ kind: 'vpaSite', vpa: v.payee.trim() });
    }
    const ev = data.digital && data.digital.websiteEvidence;
    if (ev && v.suspectPhone) splitList(v.suspectPhone).forEach(ph => {
      const n = normMobile(ph);
      if (n && ev.phones.some(x => normMobile(x) === n)) out.push({ kind: 'phoneSite', phone: ph });
    });
    const h = host(v.website);
    const dom = data.digital && data.digital.domain && data.digital.domain.name;
    if (h && dom && (h === dom || h.endsWith('.' + dom))) out.push({ kind: 'domain', domain: dom });
    return out;
  }

  function maskName(s) { const w = String(s || '').trim().split(/\s+/).filter(Boolean); return w.length ? w.map(x => x[0] + '•••').join(' ') : ''; }
  function maskMobile(s) { const n = normMobile(s); return n ? '******' + n.slice(-4) : ''; }
  function maskAcct(s) { const d = String(s || '').replace(/\s/g, ''); return d.length > 4 ? '****' + d.slice(-4) : d; }

  return {
    COMPLAINT_FIELDS: FIELDS, FRAUD_TYPES, parseComplaintFile, mapComplaintPairs: mapPairs, validateComplaint: validate,
    crossCheckComplaint: crossCheck, parseAmountIN: parseAmount, parseDateTimeIST: parseDateTime, istIso, normMobile,
    complaintHost: host, maskName, maskMobile, maskAcct, parseCsvRows
  };
});
