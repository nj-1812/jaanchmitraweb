/* Website & Numbers page: passive domain / certificate / IP records, website evidence match, event vs observation timing. */
(function (root) {
  const I = root.JMI18N; const t = I.t;
  const S = root.JMShell; const esc = S.esc;
  const F = root.JM;
  const A = S.analyse();
  const D = A.data.digital;

  function dur(mins) {
    const d = Math.floor(mins / 1440), h = Math.floor((mins % 1440) / 60), m = mins % 60;
    return d >= 1 ? t('durDH', { d, h, m }) : t('durHM', { h, m });
  }
  const row = (k, v) => '<dt>' + k + '</dt><dd>' + v + '</dd>';
  const src = (when, source) => '<div class="ev">' + esc(t('lookedUp', { t: F.istDateTime(when), src: source })) + '</div>';

  function domainCard() {
    const dm = D.domain, c = D.certificate;
    return '<section class="card panel"><h3><span class="jargon" data-jargon="RDAP">' + t('domainCard') + '</span></h3>' +
      '<div class="big-id">' + esc(dm.name) + '</div>' +
      '<dl class="kv">' + row(t('registrar'), esc(dm.registrar)) + row(t('reseller'), esc(dm.reseller)) +
        row(t('registered'), F.istDateTime(dm.created.value) + ' <span class="pill confirmed">' + t('kindEvent') + '</span>') +
        row(t('expires'), F.istDate(dm.expires.value)) + row(t('statusLabel'), esc(dm.status.join(', '))) +
        row(t('nameservers'), dm.nameservers.map(esc).join('<br>')) + row(t('abuse'), esc(dm.abuseContact)) + '</dl>' +
      src(dm.lookedUpAt, 'RDAP (demo)') +
      '<h3 style="margin-top:6px"><span class="jargon" data-jargon="CT">' + t('certCard') + '</span></h3>' +
      '<dl class="kv">' + row(t('issuer'), esc(c.issuer)) + row(t('validFrom'), F.istDateTime(c.validFrom.value)) +
        row(t('validTo'), F.istDate(c.validTo.value)) + row(t('sans'), c.sans.map(esc).join('<br>')) + '</dl>' +
      src(c.lookedUpAt, c.validFrom.source) + '</section>';
  }

  function ipCard() {
    const ip = D.ip;
    const shared = F.isCgnat(ip.address, ip.asn, root.JM_DIRECTORY);
    const flags = [ip.tor ? 'Tor' : null, ip.vpn ? 'VPN' : null].filter(Boolean);
    return '<section class="card panel"><h3>' + t('ipCard') + '</h3>' +
      '<div class="big-id">' + esc(ip.address) + ' <span class="small muted">' + esc(ip.version) + '</span></div>' +
      '<dl class="kv">' + row('<span class="jargon" data-jargon="ASN">ASN</span>', esc(ip.asn) + ' · ' + esc(ip.asnName)) +
        row(t('hostType'), ip.type === 'cloud' ? t('typeCloud') : esc(ip.type)) + row(t('rdns'), esc(ip.reverseDns)) +
        row(t('torVpn'), flags.length ? flags.join(', ') : t('none')) +
        row(t('sharedIp'), shared.shared ? t('yes') : t('no')) +
        row(t('indicativeLoc'), esc(I.pick(ip.indicativeLocation.value)) + '<div class="ev">source: ' + esc(ip.indicativeLocation.source) + '</div>') +
        row(t('abuse'), esc(ip.abuseContact)) + '</dl>' +
      '<div class="note">' + esc(t('noteIpNotPerson')) + '</div>' +
      S.table(['<span class="jargon" data-jargon="DNS">DNS</span>', t('rpValue'), t('wbColObserved')],
        D.dns.map(r => [esc(r.type), esc(r.value), '<span class="pill probable">' + t('kindObs') + '</span><div class="sub">' + F.istDateTime(r.observedAt) + '</div>']), { cls: 'compact' }) +
      '</section>';
  }

  function evidenceCard() {
    const ev = D.websiteEvidence;
    const m = A.match;
    const vpaRows = ev.vpas.map(v => {
      const hit = m.matches.find(x => x.evidenceValue === v);
      return '<div class="match ' + (hit ? 'yes' : 'no') + '"><b>' + esc(v) + '</b><br>' +
        (hit ? '<span aria-hidden="true">✓</span> ' + esc(t('matchFound', { acct: S.masked(A, hit.account), vpa: hit.accountValue })) +
          ' <span class="pill strong">' + t('linkStrong') + '</span>' : esc(t('noMatch'))) + '</div>';
    }).join('');
    const phoneRows = ev.phones.map(p => '<div class="match no"><b>' + esc(p) + '</b><br>' + esc(t('noMatch')) + '<div class="ev">' + esc(t('noteChakshu')) + '</div></div>').join('');
    const age = F.infraAgeAtPayment(A.data, A.trail);
    const hit = m.matches[0];
    return '<div class="web-right">' +
      '<section class="card panel"><h3>' + t('evidenceCard') + '</h3>' +
        '<dl class="kv">' + row(t('suppliedFile'), esc(ev.file)) + row(t('suppliedBy'), esc(I.pick(ev.suppliedBy))) + '</dl>' +
        '<h3>' + t('upiOnSite') + '</h3>' + vpaRows + '<h3>' + t('phoneOnSite') + '</h3>' + phoneRows +
        '<div class="small" style="margin-top:4px">' + esc(t('noteLowercase')) + '</div>' +
        (hit ? '<a class="card-link" style="margin:6px 0 0" href="money-trail.html?view=relationship&focus=' + hit.account + '">' + t('openRelationship') + '</a>' : '') +
      '</section>' +
      '<section class="card panel"><h3>' + t('timingCard') + '</h3>' +
        '<div class="age"><b>' + esc(t('domainAgeLine', { age: dur(age.domainMinutes) })) + '</b></div>' +
        '<div class="small">' + esc(t('certAgeLine', { age: dur(age.certMinutes) })) + '</div>' +
        '<div class="note">' + esc(t('noteDnsObserved')) + '</div>' +
        '<div class="small">' + esc(t('certInNote')) + '</div>' +
        '<a class="card-link" style="margin:2px 0 0" href="requests.html?id=REQ-REG-1">' + t('hostRequest') + '</a>' +
      '</section></div>';
  }

  function render() {
    const main = document.getElementById('main');
    main.innerHTML = '<div class="web-wrap"><div class="breadcrumb">' + t('caseLabel') + ' ' + esc(A.data.case.id) + ' › ' + t('webTitle') +
      ' · <span class="muted">' + t('passiveDemo') + '</span> · <span class="muted">' + esc(t('notePassive')) + '</span></div>' +
      '<div class="web">' + domainCard() + ipCard() + evidenceCard() + '</div></div>';
    I.applyStatic(main);
  }

  S.renderShell('website', render);
  render();
})(typeof self !== 'undefined' ? self : this);
