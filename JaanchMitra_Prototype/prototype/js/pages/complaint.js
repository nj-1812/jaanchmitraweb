/*
 * Complaint page.
 *   view   — the case complaint, reporting delay, evidence received, helplines
 *   import — read a complaint file (.csv / .json / .txt) into the form; nothing is saved automatically
 *   new    — type a complaint by hand (also the review step after an import)
 *   saved  — complaints saved in this browser, with cross-checks against the case evidence
 * The officer checks and confirms every record before it is saved. Nothing is sent anywhere.
 */
(function (root) {
  const I = root.JMI18N; const t = I.t;
  const S = root.JMShell; const esc = S.esc;
  const F = root.JM;
  const A = S.analyse();
  const STORE_KEY = 'jm-complaints';
  const PER_PAGE = 7;
  const MAX_BYTES = 1024 * 1024;

  /* ---------- state ---------- */
  const params = new URLSearchParams(location.search);
  const MODES = ['view', 'import', 'new', 'saved'];
  const state = {
    mode: MODES.indexOf(params.get('mode')) !== -1 ? params.get('mode') : 'view',
    sel: params.get('id'), page: 1,
    values: {}, source: { type: 'typed' }, editId: null, confirmed: false, touched: {},
    importError: null, flash: null, delArmed: null
  };
  let memoryStore = null; // used only if the browser blocks localStorage
  let storageOk = true;

  function loadAll() {
    if (memoryStore) return memoryStore;
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); } catch (e) { storageOk = false; memoryStore = []; return memoryStore; }
  }
  function saveAll(list) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); memoryStore = null; } catch (e) { storageOk = false; memoryStore = list; }
  }
  function saveDraft() {
    try { sessionStorage.setItem('jm-cp-draft', JSON.stringify({ values: state.values, source: state.source, editId: state.editId })); } catch (e) { /* in-memory only */ }
  }
  function loadDraft() {
    try { const d = JSON.parse(sessionStorage.getItem('jm-cp-draft') || 'null'); if (d) { state.values = d.values || {}; state.source = d.source || { type: 'typed' }; state.editId = d.editId || null; } } catch (e) { /* ignore */ }
  }
  function clearDraft() { try { sessionStorage.removeItem('jm-cp-draft'); } catch (e) { /* ignore */ } }

  function go(mode, extra) {
    state.mode = mode; Object.assign(state, extra || {});
    const q = new URLSearchParams(); if (mode !== 'view') q.set('mode', mode); if (mode === 'saved' && state.sel) q.set('id', state.sel);
    try { history.pushState(null, '', 'complaint.html' + (q.toString() ? '?' + q : '')); } catch (e) { /* file:// may refuse */ }
    render();
  }
  root.addEventListener && root.addEventListener('popstate', () => {
    const p = new URLSearchParams(location.search);
    state.mode = MODES.indexOf(p.get('mode')) !== -1 ? p.get('mode') : 'view'; state.sel = p.get('id'); render();
  });

  /* ---------- helpers ---------- */
  function dur(mins) { return t('durHM', { h: Math.floor(mins / 60), m: mins % 60 }); }
  const row = (k, v) => '<dt>' + k + '</dt><dd>' + v + '</dd>';
  const check = (ok, text, extra) => '<li class="' + (ok ? 'ok' : 'bad') + '"><span aria-hidden="true">' + (ok ? '✓' : '✗') + '</span> <span>' + text + (extra || '') + '</span></li>';
  const fLabel = k => t('f_' + k);
  const kb = n => n < 1024 ? n + ' B' : (n / 1024).toFixed(1) + ' KB';
  const pad = n => String(n).padStart(2, '0');
  // Form shows Indian order DD-MM-YYYY HH:MM:SS; storage keeps YYYY-MM-DDTHH:MM:SS (IST wall time).
  function toDisplay(local) {
    const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/.exec(local || '');
    return m ? m[3] + '-' + m[2] + '-' + m[1] + ' ' + m[4] + ':' + m[5] + ':' + m[6] : (local || '');
  }
  const showTime = local => local ? F.istDateTime(F.istIso(local)) : '—';
  function displayValues(values) {
    const v = Object.assign({}, values);
    ['received', 'txnTime'].forEach(k => { if (v[k]) v[k] = toDisplay(v[k]); });
    return v;
  }
  function msg(item) { return t('v_' + item.code, { f: fLabel(item.field), v: item.value || '' }); }

  function modeBar() {
    const n = loadAll().length;
    const tabs = [['view', t('cpModeView')], ['import', t('cpModeImport')], ['new', t('cpModeNew')], ['saved', t('cpModeSaved', { n })]];
    return '<div class="cp-modes" role="tablist">' + tabs.map(([m, label]) =>
      '<a class="tab' + (state.mode === m ? ' on' : '') + '" role="tab" aria-selected="' + (state.mode === m) + '" href="complaint.html' + (m === 'view' ? '' : '?mode=' + m) + '" data-mode="' + m + '">' + esc(label) + '</a>').join('') +
      '<span class="cp-modes-note muted small">' + esc(t('cfLocal')) + '</span></div>';
  }

  /* ---------- view: the case complaint ---------- */
  function viewHtml() {
    const c = A.data.case;
    const root0 = A.trail.rootTxn;
    const victim = A.trail.accountsById[root0.from];
    const st = F.intakeStatus(A.data, A.trail);
    const ev = A.data.digital.websiteEvidence;
    const details = '<section class="card panel"><div class="breadcrumb">' + t('caseLabel') + ' ' + esc(c.id) + ' › ' + t('cpTitle') + '</div>' +
      '<h2 style="margin:0;font-size:18px">' + esc(I.pick(c.title)) + ' <span class="pill status">' + esc(I.pick(c.status)) + '</span></h2>' +
      '<div class="small">' + esc(I.pick(c.summary)) + '</div>' +
      '<dl class="kv">' + row(t('stationLabel'), esc(I.pick(c.station))) + row('FIR', esc(c.firNo)) + row('NCRP', esc(c.ncrpAck) + ' <span class="pill ok">' + t('cpRecorded') + '</span>') +
        row(t('cpReceived'), F.istDateTime(c.complaintReceived)) + row(t('kpiLoss'), '<b>' + F.formatINR(root0.amount) + '</b>') +
        row(t('cpPaidAt'), F.istDateTime(root0.time)) + row('<span class="jargon" data-jargon="RRN">UTR/RRN</span>', esc(root0.senderRow.rrn)) +
        row(t('cpVictimAcct'), esc(victim.masked) + ' · ' + esc(victim.bank) + ' · <span class="jargon" data-jargon="IFSC">IFSC</span> ' + esc(victim.ifsc)) +
        row(t('upiOnSite'), esc(ev.vpas.join(', '))) + row(t('phoneOnSite'), esc(ev.phones.join(', '))) +
        row(t('kpiDomain'), esc(A.data.digital.domain.name)) + '</dl>' +
      '<div class="age">' + esc(t('cpDelay', { t: dur(st.delayMinutes) })) + '</div>' +
      '<div class="small muted">' + esc(t('cpGolden')) + '</div>' +
      '<a class="btn primary" href="money-trail.html">' + t('cpStart') + '</a></section>';
    // Evidence received, as a table: what · status · where to act.
    const stat = ok => '<span class="pill ' + (ok ? 'ok' : 'unresolved') + '">' + (ok ? '✓ ' + esc(t('cpRecv')) : '✗ ' + esc(t('stMissingShort'))) + '</span>';
    const evRows = [
      { href: 'statements.html', cells: ['<a href="statements.html">' + esc(t('cpEvStatements')) + '</a>', esc(st.received.length + ' / ' + st.trailAccounts), stat(st.missing.length === 0)] }
    ].concat(st.missing.map(id => ({ href: 'requests.html?id=REQ-STMT-' + S.masked(A, id).slice(-4), cells: [
      '<a href="requests.html?id=REQ-STMT-' + S.masked(A, id).slice(-4) + '">' + esc(S.masked(A, id) + ' · ' + A.trail.accountsById[id].bank) + '</a><div class="sub">' + esc(t('stRequest')) + '</div>', '—', stat(false)] })))
      .concat([{ href: 'website.html', cells: ['<a href="website.html">' + esc(t('cpWebsite')) + '</a><div class="sub">' + esc(ev.file) + '</div>', '1', stat(st.hasWebsiteEvidence)] },
        { href: 'website.html', cells: ['<a href="website.html">' + esc(t('cpDomain')) + '</a><div class="sub">RDAP · CT · DNS</div>', '3', stat(st.hasDomain)] }]);
    const inputs = '<section class="card panel"><h3>' + t('cpInputs') + '</h3>' + S.table([t('cpEvCol'), { label: t('cpEvCount'), num: true }, t('rpStatus')], evRows, { cls: 'compact stack', caption: t('cpInputs') }) + '</section>';
    const help = '<section class="card panel cp-help"><h3>' + t('cpHelp') + '</h3>' + S.helplinesHtml() +
      '<div class="note">' + esc(t('hNote2')) + '</div></section>';
    return '<div class="cp">' + details + '<div class="cp-right">' + inputs + help + '</div></div>';
  }

  /* ---------- import ---------- */
  function importHtml() {
    const err = state.importError ? '<div class="cp-err" role="alert">✗ ' + esc(state.importError) + '</div>' : '';
    const left = '<section class="card panel"><h3>' + t('imTitle') + '</h3>' +
      '<div class="drop" id="drop"><div class="drop-ic" aria-hidden="true">⇪</div><div class="drop-main">' + esc(t('imDrop')) + '</div>' +
        '<div class="muted small">' + esc(t('imOr')) + '</div>' +
        '<label class="btn primary" for="cp-file">' + esc(t('imPick')) + '</label>' +
        '<input id="cp-file" class="sr" type="file" accept=".csv,.json,.txt,text/csv,application/json,text/plain"></div>' +
      err +
      '<ul class="checks"><li class="ok"><span aria-hidden="true">✓</span><span>' + esc(t('imFormats')) + '</span></li>' +
        '<li class="ok"><span aria-hidden="true">✓</span><span>' + esc(t('imLocal')) + '</span></li>' +
        '<li class="info"><span aria-hidden="true">i</span><span>' + esc(t('imNoPdf')) + '</span></li></ul>' +
      '<div class="cp-samples small"><b>' + esc(t('imSamples')) + '</b> ' +
        ['csv', 'json', 'txt'].map(e => '<a href="samples/complaint_sample.' + e + '" download>.' + e + '</a>').join(' · ') +
        ' <button class="btn" type="button" id="cp-try">' + esc(t('imTrySample')) + '</button></div>' +
      '<div class="note">' + esc(t('fmFake')) + '</div></section>';
    const right = '<section class="card panel"><h3>' + t('imHow') + '</h3><ol class="cp-steps">' +
      ['imStep1', 'imStep2', 'imStep3', 'imStep4'].map(k => '<li>' + esc(t(k)) + '</li>').join('') + '</ol></section>';
    return '<div class="cp">' + left + '<div class="cp-right one">' + right + '</div></div>';
  }

  async function sha256Hex(buf) {
    try {
      if (!root.crypto || !root.crypto.subtle) return null;
      const h = await root.crypto.subtle.digest('SHA-256', buf);
      return Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) { return null; }
  }
  async function importBuffer(name, size, buf) {
    state.importError = null;
    const ext = (name.split('.').pop() || '').toLowerCase();
    if (['csv', 'json', 'txt'].indexOf(ext) === -1) { state.importError = t('imErrType', { name }) + ' ' + t('imNoPdf'); return render(); }
    if (size > MAX_BYTES) { state.importError = t('imErrSize', { name }); return render(); }
    const text = new TextDecoder('utf-8').decode(buf);
    let res;
    try { res = F.parseComplaintFile(name, text); } catch (e) { state.importError = t('imErrParse', { name }); return render(); }
    if (!res.filled.length) { state.importError = t('imErrEmpty', { name }); return render(); }
    const hash = await sha256Hex(buf);
    state.values = displayValues(res.values); state.editId = null; state.confirmed = false; state.touched = {};
    state.source = { type: 'file', name, size, sha256: hash, filled: res.filled, unused: res.unused, records: res.records, importedAt: new Date().toISOString() };
    saveDraft(); go('new');
  }
  function importFile(file) {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => importBuffer(file.name, file.size, r.result);
    r.onerror = () => { state.importError = t('imErrParse', { name: file.name }); render(); };
    r.readAsArrayBuffer(file);
  }

  /* ---------- form (type manually / review an import) ---------- */
  function fieldHtml(f, errFields) {
    const v = state.values[f.key] == null ? '' : String(state.values[f.key]);
    const bad = errFields[f.key] && (state.touched[f.key] || errFields[f.key] !== 'required');
    const fromFile = state.source.type === 'file' && (state.source.filled || []).indexOf(f.key) !== -1;
    const id = 'f-' + f.key;
    const lab = '<span class="lab">' + esc(fLabel(f.key)) + (f.required ? ' <span aria-hidden="true">*</span>' : '') +
      (bad ? ' <span class="mk-bad" aria-hidden="true">✗</span>' : '') + (fromFile ? ' <span class="chip-file">' + esc(t('fmFileMark')) + '</span>' : '') + '</span>';
    const common = ' id="' + id + '" name="' + f.key + '"' + (bad ? ' aria-invalid="true"' : '') + (f.required ? ' aria-required="true"' : '');
    let input;
    if (f.type === 'select') {
      input = '<select' + common + '><option value="">' + esc(t('ftChoose')) + '</option>' +
        F.FRAUD_TYPES.map(x => '<option value="' + x + '"' + (v === x ? ' selected' : '') + '>' + esc(t('ft_' + x)) + '</option>').join('') + '</select>';
    } else if (f.type === 'textarea') {
      input = '<textarea' + common + ' rows="2">' + esc(v) + '</textarea>';
    } else {
      const ph = f.type === 'datetime' ? 'DD-MM-YYYY HH:MM' : f.type === 'amount' ? '450000' : f.type === 'ref' ? '632510241531' :
        f.type === 'ifsc' ? 'BNKA0000123' : f.type === 'payee' ? 'name@bank' : f.type === 'url' ? 'site.example' : f.type === 'mobile' ? '98XXXXXXXX' : '';
      const im = f.type === 'amount' ? ' inputmode="decimal"' : (f.type === 'mobile' || f.type === 'ref' || f.type === 'datetime') ? ' inputmode="text"' : '';
      input = '<input' + common + ' type="text" autocomplete="off" spellcheck="false" value="' + esc(v) + '" placeholder="' + esc(ph) + '"' + im + '>';
    }
    return '<label class="fld' + (bad ? ' bad' : '') + (f.type === 'textarea' ? ' wide' : '') + '" for="' + id + '">' + lab + input + '</label>';
  }
  function formHtml() {
    const val = F.validateComplaint(state.values);
    const errFields = {}; val.errors.forEach(e => { if (!errFields[e.field]) errFields[e.field] = e.code; });
    const groups = [['c', 'fsC'], ['p', 'fsP'], ['s', 'fsS']];
    const banner = state.source.type === 'file'
      ? '<div class="cp-banner file">📄 ' + esc(t('fmFromFile', { name: state.source.name })) + '</div>'
      : '<div class="cp-banner">' + esc(t('fmFake')) + '</div>';
    const title = state.editId ? t('fmEditTitle', { id: state.editId }) : t('fmTitle');
    const left = '<section class="card panel cpf"><div class="card-h"><h3>' + esc(title) + '</h3><button class="btn" type="button" id="cp-clear">' + esc(t('fmClear')) + '</button></div>' + banner +
      '<form id="cp-form" autocomplete="off" novalidate>' +
      groups.map(([g, lk]) => '<fieldset><legend>' + esc(t(lk)) + '</legend><div class="grid3">' +
        F.COMPLAINT_FIELDS.filter(f => f.group === g).map(f => fieldHtml(f, errFields)).join('') + '</div></fieldset>').join('') +
      fieldHtml(F.COMPLAINT_FIELDS.find(f => f.group === 'd'), errFields) + '</form></section>';
    return '<div class="cp cp-form">' + left + '<div class="cp-right one"><section class="card panel ck" id="cp-checks">' + checksHtml(val) + '</section></div></div>';
  }
  function crossHtml(values) {
    const xs = F.crossCheckComplaint(values, A.data);
    const items = xs.map(x => {
      if (x.kind === 'utr') return t('xUtr', { txn: x.txnId, file: x.file, row: x.row }) + ' · ' + (x.amountMatches ? t('xAmtSame') : t('xAmtDiff', { a: F.formatINR(x.amount) }));
      if (x.kind === 'vpaAcct') return t('xVpaAcct', { vpa: x.vpa, acct: x.masked, bank: x.bank });
      if (x.kind === 'vpaSite') return t('xVpaSite', { vpa: x.vpa });
      if (x.kind === 'phoneSite') return t('xPhone', { p: x.phone });
      return t('xDomain', { d: x.domain });
    });
    return '<h4>' + esc(t('xTitle')) + '</h4>' + (items.length
      ? '<ul class="checks">' + items.map(s => '<li class="ok"><span aria-hidden="true">✓</span><span>' + esc(s) + '</span></li>').join('') + '</ul><div class="small muted">' + esc(t('xNote')) + '</div>'
      : '<div class="small muted">' + esc(t('xNone')) + '</div>') +
      (values.website ? '<div class="small muted">' + esc(t('xNotVisited')) + '</div>' : '');
  }
  function sourceHtml(src) {
    if (!src || src.type !== 'file') return '<h4>' + esc(t('srcTitle')) + '</h4><div class="small">⌨ ' + esc(t('srcTyped')) + '</div>';
    return '<h4>' + esc(t('srcTitle')) + '</h4><div class="small">📄 ' + esc(t('srcFile', { name: src.name, size: kb(src.size) })) + ' · ' + esc(t('srcFilled', { n: (src.filled || []).length })) + '</div>' +
      '<div class="small mono" title="' + esc(src.sha256 || '') + '">' + (src.sha256 ? 'SHA-256 ' + esc(src.sha256.slice(0, 32)) + '…' : esc(t('srcNoHash'))) + '</div>' +
      (src.unused && src.unused.length ? '<div class="small warn-t">' + esc(t('srcUnused', { list: src.unused.join(', ') })) + '</div>' : '') +
      (src.records > 1 ? '<div class="small warn-t">' + esc(t('imMany', { n: src.records })) + '</div>' : '');
  }
  function checksHtml(val) {
    // Real mistakes in what was typed come first; empty required fields after them.
    const errs = val.errors.filter(e => e.code !== 'required').concat(val.errors.filter(e => e.code === 'required'));
    const items = errs.map(e => ({ cls: 'bad', ic: '✗', s: msg(e) })).concat(val.warnings.map(w => ({ cls: 'warn', ic: '!', s: msg(w) })));
    const shown = items.slice(0, 5);
    const list = items.length
      ? '<ul class="checks">' + shown.map(i => '<li class="' + i.cls + '"><span aria-hidden="true">' + i.ic + '</span><span>' + esc(i.s) + '</span></li>').join('') +
        (items.length > shown.length ? '<li class="muted">' + esc(t('ckMore', { n: items.length - shown.length })) + '</li>' : '') + '</ul>'
      : '<ul class="checks"><li class="ok"><span aria-hidden="true">✓</span><span>' + esc(t('ckAllGood')) + '</span></li></ul>';
    const delay = val.delayMinutes != null ? '<div class="age small-age">' + esc(t('cpDelay', { t: dur(val.delayMinutes) })) + '</div>' : '';
    const canSave = val.ok && state.confirmed;
    return '<h3>' + esc(t('ckTitle')) + '</h3>' + list + delay +
      '<div class="ck-sec">' + crossHtml(state.values) + '</div>' +
      '<div class="ck-sec">' + sourceHtml(state.source) + '</div>' +
      '<div class="ck-sec ck-save"><label class="opt"><input type="checkbox" id="cp-confirm"' + (state.confirmed ? ' checked' : '') + (val.ok ? '' : ' disabled') + '> <span>' + esc(t('cfConfirm')) + '</span></label>' +
      '<button class="btn primary" type="button" id="cp-save"' + (canSave ? '' : ' disabled') + '>' + esc(t('cfSave')) + '</button>' +
      (storageOk ? '' : '<div class="small warn-t">' + esc(t('cfNoStore')) + '</div>') + '</div>';
  }
  function refreshChecks() {
    const val = F.validateComplaint(state.values);
    const errFields = {}; val.errors.forEach(e => { if (!errFields[e.field]) errFields[e.field] = e.code; });
    F.COMPLAINT_FIELDS.forEach(f => {
      const el = document.getElementById('f-' + f.key); if (!el) return;
      const bad = !!errFields[f.key] && (state.touched[f.key] || errFields[f.key] !== 'required');
      el.toggleAttribute('aria-invalid', bad);
      const lab = el.closest('.fld'); lab.classList.toggle('bad', bad);
      const mk = lab.querySelector('.mk-bad');
      if (bad && !mk) lab.querySelector('.lab').insertAdjacentHTML('beforeend', ' <span class="mk-bad" aria-hidden="true">✗</span>');
      if (!bad && mk) mk.remove();
    });
    document.getElementById('cp-checks').innerHTML = checksHtml(val);
    bindChecks();
  }
  function bindChecks() {
    const c = document.getElementById('cp-confirm');
    if (c) c.addEventListener('change', () => { state.confirmed = c.checked; refreshChecks(); });
    const s = document.getElementById('cp-save');
    if (s) s.addEventListener('click', saveRecord);
  }
  function saveRecord() {
    const val = F.validateComplaint(state.values);
    if (!val.ok || !state.confirmed) return;
    const v = {}; F.COMPLAINT_FIELDS.forEach(f => { const x = state.values[f.key]; if (x != null && String(x).trim() !== '') v[f.key] = String(x).trim(); });
    v.received = F.parseDateTimeIST(v.received); v.txnTime = F.parseDateTimeIST(v.txnTime);
    v.amount = String(F.parseAmountIN(v.amount));
    v.mobile = F.normMobile(v.mobile);
    if (v.utr) v.utr = v.utr.replace(/\s/g, '').toUpperCase();
    if (v.ifsc) v.ifsc = v.ifsc.toUpperCase();
    const list = loadAll();
    let id = state.editId;
    const now = new Date(Date.now() + 330 * 60000).toISOString().slice(0, 19) + '+05:30';
    if (id && list.some(r => r.id === id)) {
      const r = list.find(x => x.id === id); r.values = v; r.updatedAt = now; r.source = state.source;
    } else {
      const next = list.reduce((m, r) => Math.max(m, +String(r.id).replace(/\D/g, '') || 0), 0) + 1;
      id = 'CMP-' + String(next).padStart(3, '0');
      list.unshift({ id, values: v, source: state.source, savedAt: now, confirmedByOfficer: true });
    }
    saveAll(list); clearDraft();
    state.values = {}; state.source = { type: 'typed' }; state.editId = null; state.confirmed = false; state.touched = {};
    go('saved', { sel: id, page: 1, flash: t('svJustSaved', { id }) });
  }

  /* ---------- saved ---------- */
  function savedHtml() {
    const list = loadAll();
    const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    if (state.sel) { const i = list.findIndex(r => r.id === state.sel); if (i !== -1) state.page = Math.floor(i / PER_PAGE) + 1; }
    state.page = Math.min(Math.max(1, state.page), pages);
    const slice = list.slice((state.page - 1) * PER_PAGE, state.page * PER_PAGE);
    // Saved complaints as a table: ID · type · amount · received · source.
    const items = S.table(['ID', t('f_fraudType'), { label: t('amount'), num: true }, t('f_received'), t('srcTitle')], slice.map(r => {
      const v = r.values; const href = 'complaint.html?mode=saved&id=' + encodeURIComponent(r.id);
      return { href, cls: r.id === state.sel ? 'on' : '', cells: [
        '<a class="sv-go" href="' + href + '" data-id="' + esc(r.id) + '">' + esc(r.id) + '</a><div class="sub">' + esc(F.maskName(v.name)) + '</div>',
        esc(t('ft_' + v.fraudType)), F.formatINR(+v.amount), showTime(v.received),
        '<span title="' + esc(r.source && r.source.type === 'file' ? r.source.name : t('srcTyped')) + '">' + (r.source && r.source.type === 'file' ? '📄 ' + esc(t('srcFileShort')) : '⌨ ' + esc(t('srcTypedShort'))) + '</span>'] };
    }), { cls: 'compact stack', caption: t('svTitle') });
    const pager = list.length > PER_PAGE ? '<div class="pager"><button class="btn" id="pg-prev" type="button"' + (state.page <= 1 ? ' disabled' : '') + '>' + t('prev') + '</button>' +
      '<span>' + t('stPageOf', { p: state.page, n: pages }) + '</span><button class="btn" id="pg-next" type="button"' + (state.page >= pages ? ' disabled' : '') + '>' + t('next') + '</button></div>' : '';
    const left = '<section class="card panel"><div class="card-h"><h3>' + esc(t('svTitle')) + '</h3><a class="btn" href="complaint.html?mode=new" data-mode="new">' + esc(t('svNew')) + '</a></div>' +
      (state.flash ? '<div class="cp-banner ok" role="status">✓ ' + esc(state.flash) + '</div>' : '') +
      (list.length ? '<div class="tbl-wrap flush">' + items + '</div>' + pager : '<div class="muted">' + esc(t('svEmpty')) + '</div>') + '</section>';
    const rec = list.find(r => r.id === state.sel);
    const right = '<section class="card panel sv-detail">' + (rec ? detailHtml(rec) : '<div class="muted">' + esc(t(list.length ? 'svPick' : 'svEmpty')) + '</div>') + '</section>';
    return '<div class="cp cp-saved">' + left + '<div class="cp-right one">' + right + '</div></div>';
  }
  function detailHtml(r) {
    const v = r.values;
    const val = F.validateComplaint(v);
    const kvs = [
      ['ncrpAck', esc(v.ncrpAck || '—')], ['received', showTime(v.received)], ['name', esc(v.name)], ['mobile', esc(v.mobile)],
      ['fraudType', esc(t('ft_' + v.fraudType))], ['txnTime', showTime(v.txnTime)], ['amount', '<b>' + F.formatINR(+v.amount) + '</b>'],
      ['utr', esc(v.utr || '—')], ['victimBank', esc([v.victimBank, v.victimAcct ? F.maskAcct(v.victimAcct) : '', v.ifsc].filter(Boolean).join(' · ') || '—')],
      ['payee', esc(v.payee || '—')], ['website', esc(v.website || '—')], ['suspectPhone', esc(v.suspectPhone || '—')]
    ];
    return '<div class="card-h"><h3>' + esc(r.id) + '</h3><span class="small muted">' + esc(t('svSaved', { t: F.istDateTime(r.updatedAt || r.savedAt) })) + '</span></div>' +
      '<dl class="sv-grid">' + kvs.map(([k, h]) => '<div><dt>' + esc(fLabel(k)) + '</dt><dd>' + h + '</dd></div>').join('') + '</dl>' +
      '<div class="small sv-desc" title="' + esc(v.description) + '">' + esc(v.description) + '</div>' +
      (val.delayMinutes != null ? '<div class="age small-age">' + esc(t('cpDelay', { t: dur(val.delayMinutes) })) + '</div>' : '') +
      '<div class="ck-sec">' + crossHtml(v) + '</div><div class="ck-sec">' + sourceHtml(r.source) + '</div>' +
      '<div class="sv-actions"><button class="btn" type="button" id="sv-edit">' + esc(t('svEdit')) + '</button>' +
      '<button class="btn danger" type="button" id="sv-del">' + esc(state.delArmed === r.id ? t('svConfirmDel') : t('svDelete')) + '</button></div>';
  }

  /* ---------- render + events ---------- */
  function render() {
    const main = document.getElementById('main');
    if (state.mode !== 'saved') state.flash = null;
    const body = state.mode === 'import' ? importHtml() : state.mode === 'new' ? formHtml() : state.mode === 'saved' ? savedHtml() : viewHtml();
    main.innerHTML = '<div class="cp-wrap">' + modeBar() + body + '</div>';
    I.applyStatic(main);
    main.querySelectorAll('[data-mode]').forEach(a => a.addEventListener('click', e => {
      e.preventDefault(); const m = a.getAttribute('data-mode');
      if (m === 'new' && state.mode !== 'new' && state.editId) { state.values = {}; state.source = { type: 'typed' }; state.editId = null; state.confirmed = false; }
      go(m, { importError: null });
    }));
    if (state.mode === 'import') bindImport();
    if (state.mode === 'new') bindForm();
    if (state.mode === 'saved') bindSaved();
  }
  function bindImport() {
    const input = document.getElementById('cp-file');
    input.addEventListener('change', () => importFile(input.files[0]));
    const drop = document.getElementById('drop');
    ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
    ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
    drop.addEventListener('drop', e => importFile(e.dataTransfer && e.dataTransfer.files[0]));
    document.getElementById('cp-try').addEventListener('click', () => {
      const s = root.JM_COMPLAINT_SAMPLE; const buf = new TextEncoder().encode(s.text);
      importBuffer(s.name, buf.byteLength, buf.buffer);
    });
  }
  function bindForm() {
    const form = document.getElementById('cp-form');
    const onEdit = e => {
      const el = e.target; if (!el.name) return;
      state.values[el.name] = el.value;
      if (state.confirmed) state.confirmed = false; // any change needs a fresh check by the officer
      saveDraft(); refreshChecks();
    };
    form.addEventListener('input', onEdit);
    form.addEventListener('change', onEdit);
    form.addEventListener('focusout', e => { if (e.target.name) { state.touched[e.target.name] = true; refreshChecks(); } });
    form.addEventListener('submit', e => e.preventDefault());
    document.getElementById('cp-clear').addEventListener('click', () => {
      state.values = {}; state.source = { type: 'typed' }; state.editId = null; state.confirmed = false; state.touched = {};
      clearDraft(); render();
    });
    bindChecks();
  }
  function bindSaved() {
    document.querySelectorAll('.sv-go[data-id]').forEach(a => a.addEventListener('click', e => {
      e.preventDefault(); state.delArmed = null; go('saved', { sel: a.getAttribute('data-id'), flash: null }); S.revealOnSmall(document.querySelector('.sv-detail'));
    }));
    const prev = document.getElementById('pg-prev'), next = document.getElementById('pg-next');
    if (prev) prev.addEventListener('click', () => { state.page--; state.sel = null; render(); });
    if (next) next.addEventListener('click', () => { state.page++; state.sel = null; render(); });
    const edit = document.getElementById('sv-edit');
    if (edit) edit.addEventListener('click', () => {
      const r = loadAll().find(x => x.id === state.sel); if (!r) return;
      state.values = displayValues(r.values); state.source = r.source || { type: 'typed' }; state.editId = r.id; state.confirmed = false; state.touched = {};
      saveDraft(); go('new');
    });
    const del = document.getElementById('sv-del');
    if (del) del.addEventListener('click', () => {
      if (state.delArmed !== state.sel) { state.delArmed = state.sel; return render(); }
      saveAll(loadAll().filter(x => x.id !== state.sel)); state.delArmed = null; state.flash = null; go('saved', { sel: null });
    });
  }

  if (state.mode === 'new') loadDraft();
  S.renderShell('complaint', render);
  render();
})(typeof self !== 'undefined' ? self : this);
