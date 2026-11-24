/* Fixed Hindi / English strings (no machine translation at runtime). Hindi is the default. */
(function (root) {
  const STR = {
    appName: { hi: 'जांच-मित्र', en: 'JaanchMitra' },
    appSub: { hi: 'मनी-ट्रेल और डिजिटल इन्फ्रास्ट्रक्चर जांच', en: 'Money-trail & digital infrastructure investigation' },
    protoTag: { hi: 'प्रोटोटाइप · R4C हैकाथॉन PS05 · कृत्रिम (डेमो) डेटा', en: 'Prototype · R4C Hackathon PS05 · Synthetic data' },
    helplines: { hi: 'वित्तीय साइबर धोखाधड़ी: 1930 · आपात: 112', en: 'Financial cyber fraud: 1930 · Emergency: 112' },
    langToggle: { hi: 'English', en: 'हिंदी' },
    navDashboard: { hi: 'डैशबोर्ड', en: 'Dashboard' },
    navComplaint: { hi: '1 शिकायत', en: '1 Complaint' },
    navStatements: { hi: '2 बैंक स्टेटमेंट', en: '2 Statements' },
    navTrail: { hi: '3 मनी ट्रेल', en: '3 Money Trail' },
    navWebsite: { hi: '4 वेबसाइट और नंबर', en: '4 Website & Numbers' },
    navReport: { hi: '5 रिपोर्ट और अनुरोध', en: '5 Report & Requests' },
    nextBuild: { hi: 'अगला चरण', en: 'next build' },
    caseLabel: { hi: 'केस', en: 'Case' },

    kpiLoss: { hi: 'पीड़ित का नुकसान', en: 'Victim loss' },
    kpiTraceable: { hi: 'अनुमानित ट्रेस योग्य', en: 'Est. traceable' },
    kpiHops: { hi: 'चरण (हॉप)', en: 'Hops' },
    kpiSuspected: { hi: 'संदिग्ध खाते', en: 'Suspected accounts' },
    kpiDomain: { hi: 'संदिग्ध डोमेन', en: 'Suspected domain' },
    kpiUnresolved: { hi: 'अनसुलझा', en: 'Unresolved' },
    estimateNote: { hi: 'विश्लेषणात्मक अनुमान, वसूली की गारंटी नहीं', en: 'Analytical estimate, not a recovery guarantee' },

    trailTitle: { hi: 'मनी ट्रेल — चरणबद्ध दृश्य', en: 'Money trail — layered view' },
    caption: {
      hi: '{loss} पीड़ित से निकलकर {hops} चरणों में {accounts} खातों तक पहुँचा। अनुमानित {est} अभी भी ट्रेस योग्य ({method}), {unres} अनसुलझा।',
      en: '{loss} left the victim and reached {accounts} accounts in {hops} steps. Est. {est} still traceable ({method}); {unres} unresolved.'
    },
    openFullTrail: { hi: 'पूरा मनी ट्रेल खोलें →', en: 'Open full money trail →' },

    keyFindings: { hi: 'मुख्य निष्कर्ष', en: 'Key findings' },
    findSuspected: { hi: '{n} संदिग्ध म्यूल खाते', en: '{n} suspected mule accounts' },
    findMatch: { hi: 'वेबसाइट का UPI ID = खाता {acct} का VPA', en: 'Website UPI ID = VPA of A/c {acct}' },
    findMatchSub: { hi: '{vpa} · मज़बूत कड़ी · स्रोत: स्क्रीनशॉट + स्टेटमेंट', en: '{vpa} · strong link · sources: screenshot + statement' },
    findUnresolved: { hi: '{amt} खाता {acct} को गया — स्टेटमेंट उपलब्ध नहीं', en: '{amt} went to A/c {acct} — statement missing' },
    viewAll: { hi: 'सभी देखें →', en: 'View all →' },

    actions: { hi: 'सुझाए गए अगले कदम', en: 'Recommended next steps' },
    actionsNote: { hi: 'अंतिम निर्णय जांच अधिकारी का। कुछ भी अपने-आप नहीं भेजा जाता।', en: 'The officer decides. Nothing is sent automatically.' },
    actHold: { hi: 'खाता {acct} पर होल्ड का अनुरोध तैयार करें (अनुमानित {amt}, {method})', en: 'Prepare hold request for A/c {acct} (est. {amt}, {method})' },
    actStatement: { hi: '{bank} से खाता {acct} का स्टेटमेंट मंगाने का ड्राफ्ट', en: 'Draft a statement request to {bank} for A/c {acct}' },
    actCertIn: { hi: 'फ़िशिंग डोमेन {domain} की सूचना CERT-In को (incident@cert-in.org.in)', en: 'Report phishing domain {domain} to CERT-In (incident@cert-in.org.in)' },
    moreSteps: { hi: 'और कदम — अनुरोध पेज पर →', en: 'more steps — on the Requests page →' },
    draftNext: { hi: 'ड्राफ्ट पेज: अगला चरण', en: 'Draft page: next build' },

    timelineTitle: { hi: 'घटनाक्रम (वित्तीय + डिजिटल)', en: 'Timeline (financial + digital)' },
    evDomainCreated: { hi: 'डोमेन पंजीकृत', en: 'Domain registered' },
    evCertValidFrom: { hi: 'SSL प्रमाणपत्र मान्य से', en: 'Certificate valid from' },
    evVictimPayment: { hi: 'पीड़ित ने भुगतान किया', en: 'Victim paid' },
    evTransfer: { hi: 'आगे ट्रांसफ़र', en: 'Transfer' },
    evCashOut: { hi: 'नकद निकासी', en: 'Cash withdrawal' },
    evDnsObserved: { hi: 'DNS देखा गया (अवलोकन, घटना नहीं)', en: 'DNS observed (observation, not event)' },
    evUnresolved: { hi: 'अनसुलझा ट्रांसफ़र', en: 'Unresolved transfer' },
    observed: { hi: 'अवलोकन', en: 'observed' },

    // Roles and classes
    roleVictim: { hi: 'पीड़ित', en: 'Victim' },
    roleMule: { hi: 'संदिग्ध म्यूल', en: 'Suspected mule' },
    roleOnTrail: { hi: 'ट्रेल पर खाता', en: 'On trail' },
    roleCashout: { hi: 'नकद निकासी खाता', en: 'Cash-out account' },
    roleUnresolved: { hi: 'स्टेटमेंट उपलब्ध नहीं', en: 'Statement missing' },
    linkConfirmed: { hi: 'पुष्ट', en: 'Confirmed' },
    linkProbable: { hi: 'संभावित', en: 'Probable' },
    linkUnresolved: { hi: 'अनसुलझा', en: 'Unresolved' },
    linkStrong: { hi: 'मज़बूत', en: 'Strong' },
    linkWeak: { hi: 'कमज़ोर', en: 'Weak' },
    reasonRrnInBoth: { hi: 'एक ही संदर्भ संख्या (RRN) दोनों बैंक स्टेटमेंट में', en: 'Same reference number (RRN) in both bank statements' },
    reasonAmountAndTime: { hi: 'राशि समान, समय {sec} सेकंड के अंदर; प्राप्तकर्ता की पंक्ति में RRN नहीं', en: 'Same amount within {sec} s; receiver row shows no RRN' },
    reasonNoReceiverStatement: { hi: 'प्राप्तकर्ता खाते का स्टेटमेंट उपलब्ध नहीं', en: "Receiver's statement not available" },
    bandLow: { hi: 'कम', en: 'Low' }, bandMedium: { hi: 'मध्यम', en: 'Medium' },
    bandHigh: { hi: 'उच्च', en: 'High' }, bandCritical: { hi: 'गंभीर', en: 'Critical' },

    // Rules
    R1: { hi: 'तेज़ आना-जाना', en: 'Rapid in-out' },
    R2: { hi: 'पास-थ्रू', en: 'Pass-through' },
    R3: { hi: 'खाता खाली', en: 'Balance drained' },
    R4: { hi: 'पूरे हज़ार की राशियाँ', en: 'Round figures' },
    R5: { hi: 'पीड़ित से जुड़ा', en: 'Victim-linked' },
    R6: { hi: 'तुरंत नकद निकासी', en: 'Quick cash-out' },
    R1why: { hi: '{in} आया और {min} मिनट में {out} आगे भेजा गया', en: '{in} came in and {out} went out within {min} minutes' },
    R2why: { hi: 'जितना आया लगभग उतना ही निकला (अनुपात {ratio})', en: 'Almost all money in went out (ratio {ratio})' },
    R3why: { hi: 'खाता खाली: अधिकतम {peak} से घटकर {closing}', en: 'Emptied: from a peak of {peak} down to {closing}' },
    R4why: { hi: '{total} में से {round} लेन-देन पूरे हज़ार में', en: '{round} of {total} transactions are exact thousands' },
    R5why: { hi: 'पीड़ित के पैसे की कड़ी में चरण {level} पर', en: "On the victim's money trail at hop {level}" },
    R6why: { hi: 'पैसा आने के {min} मिनट में {amount} नकद निकाला', en: '{amount} withdrawn in cash {min} minutes after money arrived' },

    // Website & numbers page
    webTitle: { hi: 'वेबसाइट और नंबर', en: 'Website & numbers' },
    domainCard: { hi: 'संदिग्ध डोमेन (सार्वजनिक रिकॉर्ड)', en: 'Suspected domain (public records)' },
    registrar: { hi: 'रजिस्ट्रार', en: 'Registrar' },
    reseller: { hi: 'रीसेलर', en: 'Reseller' },
    registered: { hi: 'पंजीकरण', en: 'Registered' },
    expires: { hi: 'समाप्ति', en: 'Expires' },
    statusLabel: { hi: 'स्थिति', en: 'Status' },
    nameservers: { hi: 'नेम सर्वर', en: 'Name servers' },
    abuse: { hi: 'शिकायत संपर्क', en: 'Abuse contact' },
    certCard: { hi: 'SSL प्रमाणपत्र (CT लॉग)', en: 'SSL certificate (CT log)' },
    issuer: { hi: 'जारीकर्ता', en: 'Issuer' },
    validFrom: { hi: 'मान्य से', en: 'Valid from' },
    validTo: { hi: 'मान्य तक', en: 'Valid to' },
    sans: { hi: 'प्रमाणपत्र पर नाम (सब-डोमेन)', en: 'Names on certificate (subdomains)' },
    ipCard: { hi: 'सर्वर IP (संकेतात्मक)', en: 'Server IP (indicative)' },
    hostType: { hi: 'होस्ट का प्रकार', en: 'Host type' },
    typeCloud: { hi: 'क्लाउड / VPS सर्वर', en: 'Cloud / VPS server' },
    rdns: { hi: 'रिवर्स DNS', en: 'Reverse DNS' },
    torVpn: { hi: 'Tor / VPN संकेत', en: 'Tor / VPN indicators' },
    none: { hi: 'नहीं मिला', en: 'none found' },
    sharedIp: { hi: 'साझा IP (CGNAT)?', en: 'Shared IP (CGNAT)?' },
    no: { hi: 'नहीं', en: 'No' },
    yes: { hi: 'हाँ', en: 'Yes' },
    evidenceCard: { hi: 'वेबसाइट सबूत (अधिकारी द्वारा दिया गया)', en: 'Website evidence (supplied by the officer)' },
    suppliedFile: { hi: 'फ़ाइल', en: 'File' },
    suppliedBy: { hi: 'किसने दिया', en: 'Supplied by' },
    upiOnSite: { hi: 'वेबसाइट पर UPI ID', en: 'UPI ID on the website' },
    phoneOnSite: { hi: 'वेबसाइट पर फ़ोन', en: 'Phone on the website' },
    matchFound: { hi: 'खाता {acct} ({vpa}) से मेल — इसी खाते में पीड़ित का पैसा आया', en: 'Matches A/c {acct} ({vpa}) — the account that received the victim\u2019s money' },
    noMatch: { hi: 'बैंक स्टेटमेंट में कोई मेल नहीं', en: 'No match in the bank statements' },
    timingCard: { hi: 'समय: घटना बनाम अवलोकन', en: 'Timing: event vs observation' },
    domainAgeLine: { hi: 'पीड़ित के भुगतान के समय डोमेन सिर्फ़ {age} पुराना था', en: 'The domain was only {age} old when the victim paid' },
    certAgeLine: { hi: 'प्रमाणपत्र भुगतान से {age} पहले से मान्य था', en: 'The certificate was valid from {age} before the payment' },
    durDH: { hi: '{d} दिन {h} घंटे {m} मिनट', en: '{d} day {h} h {m} min' },
    durHM: { hi: '{h} घंटे {m} मिनट', en: '{h} h {m} min' },
    kindEvent: { hi: 'घटना', en: 'event' },
    kindObs: { hi: 'अवलोकन', en: 'observation' },
    lookedUp: { hi: 'देखा गया {t} · {src}', en: 'Looked up {t} · {src}' },
    passiveDemo: { hi: 'पैसिव लुकअप · डेमो डेटा', en: 'Passive lookup · demo data' },
    openRelationship: { hi: 'ग्राफ़ में कड़ी देखें →', en: 'See the link in the graph →' },
    certInNote: { hi: 'फ़िशिंग साइट की सूचना CERT-In को: incident@cert-in.org.in', en: 'Report the phishing site to CERT-In: incident@cert-in.org.in' },
    hostRequest: { hi: 'होस्ट / रजिस्ट्रार अनुरोध ड्राफ्ट →', en: 'Host / registrar request drafts →' },
    // Statements page
    stTitle: { hi: 'बैंक स्टेटमेंट', en: 'Bank statements' },
    stList: { hi: 'प्राप्त स्टेटमेंट', en: 'Statements received' },
    stAvailable: { hi: 'उपलब्ध', en: 'Received' },
    stMissing: { hi: 'उपलब्ध नहीं', en: 'Missing' },
    stRows: { hi: '{n} पंक्तियाँ', en: '{n} rows' },
    stPeriod: { hi: 'अवधि', en: 'Period' },
    stOpening: { hi: 'शुरुआती शेष', en: 'Opening balance' },
    stCredits: { hi: 'कुल जमा', en: 'Total credits' },
    stDebits: { hi: 'कुल निकासी', en: 'Total debits' },
    stClosing: { hi: 'अंतिम शेष (गणना)', en: 'Closing balance (calculated)' },
    stDate: { hi: 'तारीख-समय', en: 'Date-time' },
    stCr: { hi: 'जमा', en: 'Credit' },
    stDr: { hi: 'निकासी', en: 'Debit' },
    stBalance: { hi: 'शेष (गणना)', en: 'Balance (calc.)' },
    stNarration: { hi: 'विवरण', en: 'Narration' },
    stSource: { hi: 'स्रोत', en: 'Source' },
    stPageOf: { hi: 'पृष्ठ {p} / {n}', en: 'Page {p} of {n}' },
    prev: { hi: '‹ पिछला', en: '‹ Previous' },
    next: { hi: 'अगला ›', en: 'Next ›' },
    stDemoNote: { hi: 'डेमो डेटा में मुद्रित शेष और फ़ाइलें नहीं हैं — शेष यहाँ गणना से है। असली ऐप में Python पार्सर PDF/Excel पढ़ता है, हर मुद्रित शेष जाँचता है और हर फ़ाइल का SHA-256 फ़िंगरप्रिंट रखता है।', en: 'Demo data has no printed balances or files — balances here are calculated. In the full app the Python parser reads the PDF/Excel, checks every printed balance and records each file\u2019s SHA-256 fingerprint.' },
    stMissingNote: { hi: 'इस खाते का स्टेटमेंट नहीं मिला। इसमें गया पैसा अनसुलझा दिखाया गया है।', en: 'This account\u2019s statement was not received. Money sent to it is shown as unresolved.' },
    stRequest: { hi: 'स्टेटमेंट अनुरोध ड्राफ्ट →', en: 'Statement request draft →' },
    stOnTrail: { hi: 'मनी ट्रेल में देखें →', en: 'See on money trail →' },
    outside: { hi: 'बाहरी', en: 'outside party' },
    // Complaint page
    cpTitle: { hi: 'शिकायत', en: 'Complaint' },
    stationLabel: { hi: 'थाना', en: 'Police station' },
    cpDetails: { hi: 'शिकायत का विवरण', en: 'Complaint details' },
    cpReceived: { hi: 'शिकायत मिली', en: 'Complaint received' },
    cpVictimAcct: { hi: 'पीड़ित का खाता', en: 'Victim account' },
    cpPaidAt: { hi: 'भुगतान का समय', en: 'Payment time' },
    cpDelay: { hi: 'भुगतान के {t} बाद शिकायत दर्ज हुई', en: 'Reported {t} after the payment' },
    cpGolden: { hi: 'जितनी जल्दी 1930 / NCRP पर रिपोर्ट, उतनी जल्दी बैंक पैसा रोक सकते हैं।', en: 'The sooner it is reported on 1930 / NCRP, the sooner banks can act to hold money.' },
    cpInputs: { hi: 'मिले हुए सबूत', en: 'Evidence received' },
    cpStmtCount: { hi: 'ट्रेल के {n} में से {r} खातों के स्टेटमेंट मिले', en: 'Statements received for {r} of {n} accounts on the trail' },
    cpStmtMissing: { hi: 'अभी चाहिए: खाता {acct} ({bank}) का स्टेटमेंट', en: 'Still needed: statement for A/c {acct} ({bank})' },
    cpWebsite: { hi: 'वेबसाइट सबूत (स्क्रीनशॉट)', en: 'Website evidence (screenshot)' },
    cpDomain: { hi: 'संदिग्ध डोमेन और IP', en: 'Suspected domain and IP' },
    cpHelp: { hi: 'कब कौन-सी सहायता', en: 'Which helpline, when' },
    h1930: { hi: '1930 / cybercrime.gov.in — वित्तीय साइबर धोखाधड़ी की रिपोर्ट; पैसा रोकने की प्रक्रिया यहीं से', en: '1930 / cybercrime.gov.in — report financial cyber fraud; this starts the hold process' },
    hChakshu: { hi: 'Chakshu (sancharsaathi.gov.in/sfc) — धोखाधड़ी वाली कॉल/SMS/WhatsApp की रिपोर्ट', en: 'Chakshu (sancharsaathi.gov.in/sfc) — report the fraud call, SMS or WhatsApp' },
    hCeir: { hi: 'CEIR (ceir.gov.in) — खोया/चोरी हुआ फ़ोन ब्लॉक करें', en: 'CEIR (ceir.gov.in) — block a lost or stolen phone' },
    hRbi: { hi: 'RBI लोकपाल 14448 / cms.rbi.org.in — बैंक सेवा संबंधी शिकायत', en: 'RBI Ombudsman 14448 / cms.rbi.org.in — bank service complaints' },
    h112: { hi: '112 — तुरंत खतरा हो तो', en: '112 — if there is immediate danger' },
    hNote: { hi: 'ऐप किसी को कॉल या रिपोर्ट नहीं करता — सिर्फ़ सही रास्ता दिखाता है। नंबर उपयोग से पहले जाँच लें।', en: 'The app never calls or files anything — it only shows the right channel. Verify numbers before use.' },
    cpRecorded: { hi: 'दर्ज', en: 'recorded' },
    cpStart: { hi: 'मनी ट्रेल शुरू करें →', en: 'Start the money trail →' },
    // Requests page
    reqTitle: { hi: 'अनुरोध ड्राफ्ट', en: 'Request drafts' },
    reqDraftsList: { hi: 'ड्राफ्ट सूची', en: 'Drafts' },
    reqTypeBankHold: { hi: 'बैंक: होल्ड पर विचार + रिकॉर्ड', en: 'Bank: consider hold + records' },
    reqTypeBankStatement: { hi: 'बैंक: स्टेटमेंट और KYC', en: 'Bank: statement & KYC' },
    reqTypeRegistrar: { hi: 'रजिस्ट्रार: डोमेन रिकॉर्ड', en: 'Registrar: domain records' },
    reqTypeHost: { hi: 'होस्टिंग: सर्वर रिकॉर्ड', en: 'Host: server records' },
    officer: { hi: 'जारी करने वाले अधिकारी', en: 'Issuing officer' },
    officerName: { hi: 'नाम', en: 'Name' },
    officerDesignation: { hi: 'पद', en: 'Designation' },
    deadlineLabel: { hi: 'जवाब की अंतिम तिथि', en: 'Reply deadline' },
    provisionLabel: { hi: 'मैंने कानूनी प्रावधान की जाँच कर ली है', en: 'I have verified the legal provision' },
    sourcePortLabel: { hi: 'सोर्स पोर्ट (CGNAT हेतु अनिवार्य)', en: 'Source port (mandatory for CGNAT)' },
    print: { hi: 'प्रिंट / PDF सहेजें', en: 'Print / Save PDF' },
    letterLangNote: { hi: 'पत्र का मसौदा अंग्रेज़ी में (बैंक/कंपनी के लिए)। कुछ भी भेजा नहीं जाता।', en: 'Letter drafted in English for the bank/company. Nothing is sent.' },
    checkerTitle: { hi: 'पूर्णता जाँच', en: 'Completeness check' },
    complete: { hi: 'पूर्ण', en: 'Complete' },
    incomplete: { hi: 'अधूरा', en: 'Incomplete' },
    missingN: { hi: '{n} कमी', en: '{n} missing' },
    chk_caseRef: { hi: 'FIR / NCRP संदर्भ', en: 'FIR / NCRP reference' },
    chk_recipient: { hi: 'प्राप्तकर्ता', en: 'Recipient' },
    chk_recipientContact: { hi: 'प्राप्तकर्ता का संपर्क (सार्वजनिक न हो तो अधिकारी भरें)', en: 'Recipient contact (officer fills if not public)' },
    chk_identifiers: { hi: 'सटीक पहचानकर्ता (खाता, IFSC, RRN, डोमेन, IP)', en: 'Exact identifiers (account, IFSC, RRN, domain, IP)' },
    chk_timeZone: { hi: 'हर समय के साथ टाइम-ज़ोन', en: 'Time zone on every time' },
    chk_records: { hi: 'माँगे गए रिकॉर्ड', en: 'Records requested' },
    chk_provision: { hi: 'कानूनी प्रावधान सत्यापित', en: 'Legal provision verified' },
    chk_deadline: { hi: 'जवाब की अंतिम तिथि', en: 'Reply deadline' },
    chk_officerName: { hi: 'अधिकारी का नाम', en: 'Officer name' },
    chk_officerDesignation: { hi: 'अधिकारी का पद', en: 'Officer designation' },
    chk_cgnatPort: { hi: 'साझा IP (CGNAT): सोर्स पोर्ट + सटीक समय', en: 'Shared IP (CGNAT): source port + exact time' },
    routing: { hi: 'किसे भेजें — कैसे तय हुआ', en: 'How the recipient was chosen' },
    routedBy: { hi: '{input} से {by} द्वारा तय', en: 'Chosen by {by} from {input}' },
    contactSource: { hi: 'संपर्क का स्रोत', en: 'Contact source' },
    cgnatNo: { hi: 'IP प्रकार: {type} — साझा कैरियर IP नहीं, पोर्ट अनिवार्य नहीं', en: 'IP type: {type} — not a shared carrier IP, port not mandatory' },
    cgnatYes: { hi: 'साझा कैरियर IP — सोर्स पोर्ट और सटीक समय (टाइम-ज़ोन सहित) अनिवार्य', en: 'Shared carrier IP — source port and exact time with time zone are mandatory' },
    officerDecides: { hi: 'अधिकारी जाँचकर, हस्ताक्षर करके, उचित माध्यम से स्वयं जारी करेंगे।', en: 'The officer checks, signs and issues it through the proper channel.' },
    reportTab: { hi: 'केस रिपोर्ट', en: 'Case report' },
    cashShort: { hi: 'नकद', en: 'Cash' },
    estShort: { hi: 'अनु.', en: 'Est.' },
    onScreenshot: { hi: 'स्क्रीनशॉट में', en: 'on screenshot' },
    siteLabel: { hi: 'साइट', en: 'site' },
    indicativeLoc: { hi: 'संकेतात्मक नेटवर्क स्थान', en: 'Indicative network location' },
    noteLowercase: { hi: 'तुलना से पहले UPI ID को छोटे अक्षरों में बदला गया। यह मज़बूत कड़ी है, पर व्यक्ति की पहचान का प्रमाण नहीं।', en: 'UPI IDs were lower-cased before comparing. A strong link, but not proof of a person\u2019s identity.' },
    noteDnsObserved: { hi: 'आज देखा गया DNS यह साबित नहीं करता कि डोमेन पहली बार आज इस IP पर गया।', en: 'DNS observed today does not prove the domain first pointed to this IP today.' },
    notePassive: { hi: 'सिर्फ़ सार्वजनिक (पैसिव) रिकॉर्ड — संदिग्ध सर्वर से कोई संपर्क नहीं। डेमो डेटा।', en: 'Passive public records only — no contact with the suspect server. Demo data.' },
    noteIpNotPerson: { hi: 'IP से सिर्फ़ नेटवर्क/होस्टिंग कंपनी पता चलती है, व्यक्ति नहीं। उपयोगकर्ता की जानकारी केवल कानूनी प्रक्रिया से।', en: 'An IP identifies a network/host company, not a person. User details only through legal process.' },
    noteChakshu: { hi: 'Chakshu (sancharsaathi.gov.in/sfc) पर फ़ोन नंबर की सूचना दी जा सकती है।', en: 'The phone number can be reported on Chakshu (sancharsaathi.gov.in/sfc).' },
    langLabel: { hi: 'भाषा', en: 'Language' },
    rpPlay: { hi: 'चलाएँ', en: 'Play' },
    rpPause: { hi: 'रोकें', en: 'Pause' },
    rpBack: { hi: 'पिछली घटना', en: 'Previous event' },
    rpForward: { hi: 'अगली घटना', en: 'Next event' },
    rpRestart: { hi: 'शुरू से', en: 'Restart' },
    rpEventOf: { hi: 'घटना {i} / {n}', en: 'Event {i} of {n}' },
    // Money trail page
    viewLabel: { hi: 'दृश्य', en: 'View' },
    viewLayered: { hi: 'चरणबद्ध ग्राफ़ (डिफ़ॉल्ट)', en: 'Layered graph (default)' },
    viewRelationship: { hi: 'संबंध ग्राफ़', en: 'Relationship graph' },
    viewSankey: { hi: 'सैंकी प्रवाह', en: 'Sankey flow' },
    viewTimeline: { hi: 'समय-रेखा व रीप्ले', en: 'Timeline & replay' },
    method: { hi: 'आवंटन विधि', en: 'Allocation method' },
    filterHops: { hi: 'चरण (हॉप)', en: 'Hop level' },
    filterLinks: { hi: 'कड़ी का प्रकार', en: 'Link type' },
    search: { hi: 'खाता / VPA / RRN खोजें', en: 'Search account / VPA / RRN' },
    reset: { hi: 'रीसेट', en: 'Reset' },
    detailsTitle: { hi: 'विवरण', en: 'Details' },
    detailsHint: { hi: 'किसी खाते या तीर पर क्लिक करें — उसका कारण और सबूत यहाँ दिखेंगे।', en: 'Click an account or an arrow — its reason and evidence appear here.' },
    bank: { hi: 'बैंक', en: 'Bank' },
    hop: { hi: 'चरण', en: 'Hop' },
    risk: { hi: 'जोखिम', en: 'Risk' },
    observedBalance: { hi: 'स्टेटमेंट में शेष', en: 'Observed balance' },
    victimAttributed: { hi: 'पीड़ित का आया पैसा', en: 'Victim-attributed' },
    estTraceable: { hi: 'अनुमानित ट्रेस योग्य', en: 'Est. traceable' },
    whyFlagged: { hi: 'क्यों चिह्नित', en: 'Why flagged' },
    noRules: { hi: 'कोई नियम लागू नहीं हुआ', en: 'No rule fired' },
    evidence: { hi: 'सबूत', en: 'Evidence' },
    amount: { hi: 'राशि', en: 'Amount' },
    time: { hi: 'समय', en: 'Time' },
    rail: { hi: 'माध्यम', en: 'Rail' },
    linkClass: { hi: 'कड़ी', en: 'Link' },
    senderRow: { hi: 'भेजने वाले का स्टेटमेंट', en: 'Sender statement' },
    receiverRow: { hi: 'पाने वाले का स्टेटमेंट', en: 'Receiver statement' },
    notAvailable: { hi: 'उपलब्ध नहीं', en: 'not available' },
    victimShare: { hi: 'इसमें पीड़ित का पैसा', en: 'Victim money in it' },
    page: { hi: 'पृष्ठ', en: 'p.' },
    row: { hi: 'पंक्ति', en: 'row' },
    legend: { hi: 'संकेत', en: 'Legend' },
    nodeWebsite: { hi: 'वेबसाइट सबूत', en: 'Website evidence' },
    nodeDomain: { hi: 'संदिग्ध डोमेन', en: 'Suspected domain' },
    nodeIp: { hi: 'IP (संकेतात्मक)', en: 'IP (indicative)' },
    relCaption: { hi: 'वेबसाइट पर दिखा UPI ID उसी VPA से मिलता है जिसने पीड़ित का पैसा प्राप्त किया। IP/होस्टिंग सिर्फ़ संकेत है, पहचान नहीं।', en: 'The UPI ID shown on the website matches the VPA that received the victim money. IP/hosting is an indicator, not identity.' },
    unresolvedNext: { hi: 'अगला कदम: {bank} से इस खाते का स्टेटमेंट मंगाएँ (ड्राफ्ट — अगला चरण)', en: 'Next: request this account’s statement from {bank} (draft — next build)' },
    back: { hi: '← डैशबोर्ड', en: '← Dashboard' }
  };

  const JARGON = {
    RRN: { hi: 'RRN/UTR: हर बैंक ट्रांसफ़र की संदर्भ संख्या। दोनों बैंकों के स्टेटमेंट में एक ही नंबर हो तो कड़ी पुष्ट होती है।', en: 'RRN/UTR: the reference number of a bank transfer. The same number in both banks’ statements confirms the link.' },
    VPA: { hi: 'VPA: UPI ID, जैसे name@bank, जो किसी बैंक खाते से जुड़ा होता है।', en: 'VPA: a UPI ID such as name@bank, linked to a bank account.' },
    IFSC: { hi: 'IFSC: 11 अक्षरों का बैंक शाखा कोड।', en: 'IFSC: 11-character bank branch code.' },
    ASN: { hi: 'ASN: इंटरनेट नेटवर्क चलाने वाली कंपनी का नंबर (जैसे होस्टिंग कंपनी)। यह व्यक्ति की पहचान नहीं है।', en: 'ASN: the number of the company running a network (e.g. a host). It does not identify a person.' },
    RDAP: { hi: 'RDAP: डोमेन पंजीकरण की सार्वजनिक जानकारी (रजिस्ट्रार, तारीखें)।', en: 'RDAP: public domain registration data (registrar, dates).' },
    CT: { hi: 'CT लॉग: SSL प्रमाणपत्रों का सार्वजनिक रिकॉर्ड।', en: 'CT log: public record of SSL certificates.' },
    DNS: { hi: 'DNS: डोमेन किस IP पर चल रहा है — जिस समय देखा गया।', en: 'DNS: which IP a domain points to — at the time it was observed.' }
  };


  // Hinglish: Hindi in Roman script with everyday English terms, as many officers write it.
  const HL = {
    appName: 'JaanchMitra', appSub: 'Money-trail aur digital infrastructure jaanch',
    protoTag: 'Prototype · R4C Hackathon PS05 · Synthetic (demo) data',
    helplines: 'Financial cyber fraud: 1930 · Emergency: 112', langToggle: 'Hinglish', langLabel: 'Bhasha',
    navDashboard: 'Dashboard', navComplaint: '1 Shikayat', navStatements: '2 Bank Statements', navTrail: '3 Money Trail',
    navWebsite: '4 Website aur Numbers', navReport: '5 Report aur Requests', nextBuild: 'agla step', caseLabel: 'Case',
    kpiLoss: 'Victim ka nuksaan', kpiTraceable: 'Anumanit traceable', kpiHops: 'Hops (charan)', kpiSuspected: 'Sandigdh accounts',
    kpiDomain: 'Sandigdh domain', kpiUnresolved: 'Unresolved', estimateNote: 'Analytical anumaan hai, recovery ki guarantee nahi',
    trailTitle: 'Money trail — layered view',
    caption: '{loss} victim se nikal kar {hops} steps mein {accounts} accounts tak pahuncha. Anumanit {est} abhi bhi traceable ({method}), {unres} unresolved.',
    openFullTrail: 'Poora money trail kholein →', keyFindings: 'Mukhya findings',
    findSuspected: '{n} sandigdh mule accounts', findMatch: 'Website ka UPI ID = A/c {acct} ka VPA',
    findMatchSub: '{vpa} · strong link · source: screenshot + statement', findUnresolved: '{amt} A/c {acct} ko gaya — statement uplabdh nahi',
    viewAll: 'Sab dekhein →', actions: 'Agle suggested kadam', actionsNote: 'Faisla officer ka. Kuch bhi apne-aap nahi bheja jaata.',
    actHold: 'A/c {acct} par hold request taiyaar karein (anumanit {amt}, {method})', actStatement: '{bank} se A/c {acct} ka statement maangne ka draft',
    actCertIn: 'Phishing domain {domain} ki report CERT-In ko (incident@cert-in.org.in)', moreSteps: 'aur kadam — Requests page par →',
    draftNext: 'Draft page: agla step', timelineTitle: 'Timeline (financial + digital)',
    evDomainCreated: 'Domain register hua', evCertValidFrom: 'Certificate valid from', evVictimPayment: 'Victim ne payment kiya',
    evTransfer: 'Aage transfer', evCashOut: 'Cash nikala gaya', evDnsObserved: 'DNS dekha gaya (observation, event nahi)',
    evUnresolved: 'Unresolved transfer', observed: 'dekha gaya',
    roleVictim: 'Victim', roleMule: 'Sandigdh mule', roleOnTrail: 'Trail par account', roleCashout: 'Cash-out account', roleUnresolved: 'Statement uplabdh nahi',
    linkConfirmed: 'Pakka (confirmed)', linkProbable: 'Sambhavit (probable)', linkUnresolved: 'Unresolved', linkStrong: 'Strong', linkWeak: 'Kamzor (weak)',
    reasonRrnInBoth: 'Wahi reference number (RRN) dono bank statements mein', reasonAmountAndTime: 'Same amount, {sec} second ke andar; receiver row mein RRN nahi',
    reasonNoReceiverStatement: 'Receiver account ka statement uplabdh nahi',
    bandLow: 'Kam', bandMedium: 'Madhyam', bandHigh: 'Uchch', bandCritical: 'Gambhir',
    R1: 'Tez aana-jaana', R2: 'Pass-through', R3: 'Account khaali', R4: 'Poore hazaar ki rakam', R5: 'Victim se juda', R6: 'Turant cash nikasi',
    R1why: '{in} aaya aur {min} minute mein {out} aage bhej diya', R2why: 'Jitna aaya lagbhag utna hi nikla (ratio {ratio})',
    R3why: 'Account khaali: peak {peak} se ghat kar {closing}', R4why: '{total} mein se {round} transactions poore hazaar mein',
    R5why: 'Victim ke paise ki trail mein hop {level} par', R6why: 'Paisa aane ke {min} minute mein {amount} cash nikala',
    webTitle: 'Website aur numbers', domainCard: 'Sandigdh domain (public records)', registrar: 'Registrar', reseller: 'Reseller',
    registered: 'Register hua', expires: 'Expiry', statusLabel: 'Status', nameservers: 'Name servers', abuse: 'Abuse contact',
    certCard: 'SSL certificate (CT log)', issuer: 'Issuer', validFrom: 'Valid from', validTo: 'Valid tak', sans: 'Certificate par naam (subdomains)',
    ipCard: 'Server IP (sanketik)', hostType: 'Host ka type', typeCloud: 'Cloud / VPS server', rdns: 'Reverse DNS', torVpn: 'Tor / VPN sanket',
    none: 'nahi mila', sharedIp: 'Shared IP (CGNAT)?', no: 'Nahi', yes: 'Haan', evidenceCard: 'Website saboot (officer ne diya)',
    suppliedFile: 'File', suppliedBy: 'Kisne diya', upiOnSite: 'Website par UPI ID', phoneOnSite: 'Website par phone',
    matchFound: 'A/c {acct} ({vpa}) se match — isi account mein victim ka paisa aaya', noMatch: 'Bank statements mein koi match nahi',
    timingCard: 'Samay: event vs observation', domainAgeLine: 'Victim ke payment ke samay domain sirf {age} purana tha',
    certAgeLine: 'Certificate payment se {age} pehle se valid tha', durDH: '{d} din {h} ghante {m} minute', durHM: '{h} ghante {m} minute',
    kindEvent: 'event', kindObs: 'observation', lookedUp: 'Dekha gaya {t} · {src}', passiveDemo: 'Passive lookup · demo data',
    openRelationship: 'Graph mein link dekhein →', certInNote: 'Phishing site ki report CERT-In ko: incident@cert-in.org.in',
    hostRequest: 'Host / registrar request drafts →',
    stTitle: 'Bank statements', stList: 'Mile hue statements', stAvailable: 'Mila', stMissing: 'Nahi mila', stRows: '{n} rows', stPeriod: 'Avadhi',
    stOpening: 'Shuruaati balance', stCredits: 'Kul jama', stDebits: 'Kul nikasi', stClosing: 'Antim balance (calculated)', stDate: 'Date-time',
    stCr: 'Jama', stDr: 'Nikasi', stBalance: 'Balance (calc.)', stNarration: 'Vivran', stSource: 'Source', stPageOf: 'Page {p} / {n}',
    prev: '‹ Pichhla', next: 'Agla ›',
    stDemoNote: 'Demo data mein printed balance aur files nahi hain — balance yahan calculate kiya gaya hai. Asli app mein Python parser PDF/Excel padhta hai, har printed balance check karta hai aur har file ka SHA-256 fingerprint rakhta hai.',
    stMissingNote: 'Is account ka statement nahi mila. Isme gaya paisa unresolved dikhaya gaya hai.', stRequest: 'Statement request draft →',
    stOnTrail: 'Money trail mein dekhein →', outside: 'bahari party',
    cpTitle: 'Shikayat', stationLabel: 'Thana', cpDetails: 'Shikayat ka vivran', cpReceived: 'Shikayat mili', cpVictimAcct: 'Victim ka account', cpPaidAt: 'Payment ka samay',
    cpDelay: 'Payment ke {t} baad shikayat darj hui', cpGolden: 'Jitni jaldi 1930 / NCRP par report, utni jaldi bank paisa rok sakte hain.',
    cpInputs: 'Mile hue saboot', cpStmtCount: 'Trail ke {n} mein se {r} accounts ke statements mile', cpStmtMissing: 'Abhi chahiye: A/c {acct} ({bank}) ka statement',
    cpWebsite: 'Website saboot (screenshot)', cpDomain: 'Sandigdh domain aur IP', cpHelp: 'Kab kaunsi helpline',
    h1930: '1930 / cybercrime.gov.in — financial cyber fraud ki report; paisa rokne ki prakriya yahin se',
    hChakshu: 'Chakshu (sancharsaathi.gov.in/sfc) — fraud call, SMS ya WhatsApp ki report', hCeir: 'CEIR (ceir.gov.in) — khoya/chori hua phone block karein',
    hRbi: 'RBI Ombudsman 14448 / cms.rbi.org.in — bank service ki shikayat', h112: '112 — turant khatra ho to',
    hNote: 'App kisi ko call ya report nahi karta — sirf sahi raasta dikhata hai. Numbers use se pehle check karein.', cpRecorded: 'darj', cpStart: 'Money trail shuru karein →',
    rpPlay: 'Chalayein', rpPause: 'Rokein', rpBack: 'Pichhla event', rpForward: 'Agla event', rpRestart: 'Shuru se', rpEventOf: 'Event {i} / {n}',
    reqTitle: 'Request drafts', reqDraftsList: 'Drafts', reqTypeBankHold: 'Bank: hold par vichar + records', reqTypeBankStatement: 'Bank: statement aur KYC',
    reqTypeRegistrar: 'Registrar: domain records', reqTypeHost: 'Hosting: server records', officer: 'Jaari karne wale officer',
    officerName: 'Naam', officerDesignation: 'Pad (designation)', deadlineLabel: 'Jawab ki antim tithi', provisionLabel: 'Maine legal provision check kar liya hai',
    sourcePortLabel: 'Source port (CGNAT ke liye zaroori)', print: 'Print / PDF save karein',
    letterLangNote: 'Letter English mein draft hai (bank/company ke liye). Kuch bhi bheja nahi jaata.',
    checkerTitle: 'Completeness check', complete: 'Poora', incomplete: 'Adhoora', missingN: '{n} kami',
    chk_caseRef: 'FIR / NCRP reference', chk_recipient: 'Recipient', chk_recipientContact: 'Recipient contact (public na ho to officer bharein)',
    chk_identifiers: 'Sahi identifiers (account, IFSC, RRN, domain, IP)', chk_timeZone: 'Har time ke saath time zone', chk_records: 'Maange gaye records',
    chk_provision: 'Legal provision verify kiya', chk_deadline: 'Jawab ki antim tithi', chk_officerName: 'Officer ka naam', chk_officerDesignation: 'Officer ka pad',
    chk_cgnatPort: 'Shared IP (CGNAT): source port + exact time', routing: 'Kise bhejein — kaise tay hua', routedBy: '{input} se {by} dwara tay',
    contactSource: 'Contact ka source', cgnatNo: 'IP type: {type} — shared carrier IP nahi, port zaroori nahi',
    cgnatYes: 'Shared carrier IP — source port aur exact time (time zone ke saath) zaroori', officerDecides: 'Officer check karke, sign karke, sahi channel se khud jaari karenge.',
    reportTab: 'Case report', viewLabel: 'View', viewLayered: 'Layered graph (default)', viewRelationship: 'Relationship graph', viewSankey: 'Sankey flow',
    viewTimeline: 'Timeline aur replay', method: 'Allocation method', filterHops: 'Hop level', filterLinks: 'Link ka type', search: 'Account / VPA / RRN khojein',
    reset: 'Reset', detailsTitle: 'Details', detailsHint: 'Kisi account ya arrow par click karein — uska kaaran aur saboot yahan dikhega.',
    bank: 'Bank', hop: 'Hop', risk: 'Risk', observedBalance: 'Statement mein balance', victimAttributed: 'Victim ka aaya paisa', estTraceable: 'Anumanit traceable',
    whyFlagged: 'Kyon flag hua', noRules: 'Koi rule laagu nahi hua', evidence: 'Saboot', amount: 'Rakam', time: 'Samay', rail: 'Rail', linkClass: 'Link',
    senderRow: 'Bhejne wale ka statement', receiverRow: 'Paane wale ka statement', notAvailable: 'uplabdh nahi', victimShare: 'Ismein victim ka paisa',
    page: 'p.', row: 'row', legend: 'Legend', nodeWebsite: 'Website saboot', nodeDomain: 'Sandigdh domain', nodeIp: 'IP (sanketik)',
    relCaption: 'Website par dikha UPI ID usi VPA se match karta hai jisne victim ka paisa liya. IP/hosting sirf sanket hai, pehchaan nahi.',
    unresolvedNext: 'Agla kadam: {bank} se is account ka statement maangein (Requests page par draft)', back: '← Dashboard',
    cashShort: 'Cash', estShort: 'Anu.', onScreenshot: 'screenshot mein', siteLabel: 'site', indicativeLoc: 'Sanketik network location',
    noteLowercase: 'Compare karne se pehle UPI ID ko small letters mein badla gaya. Yeh strong link hai, par kisi vyakti ki pehchaan ka saboot nahi.',
    noteDnsObserved: 'Aaj dekha gaya DNS yeh saabit nahi karta ki domain pehli baar aaj is IP par gaya.',
    notePassive: 'Sirf public (passive) records — sandigdh server se koi sampark nahi. Demo data.',
    noteIpNotPerson: 'IP se sirf network/hosting company pata chalti hai, vyakti nahi. User ki jaankari sirf kanooni prakriya se.',
    noteChakshu: 'Phone number ki report Chakshu (sancharsaathi.gov.in/sfc) par ki ja sakti hai.'
  };
  Object.keys(HL).forEach(k => { if (STR[k]) STR[k].hl = HL[k]; });
  const JARGON_HL = {
    RRN: 'RRN/UTR: bank transfer ka reference number. Dono banks ke statement mein same number ho to link pakka hota hai.',
    VPA: 'VPA: UPI ID, jaise name@bank, jo kisi bank account se juda hota hai.',
    IFSC: 'IFSC: 11 character ka bank branch code.',
    ASN: 'ASN: network chalane wali company ka number (jaise hosting company). Yeh vyakti ki pehchaan nahi hai.',
    RDAP: 'RDAP: domain registration ki public jaankari (registrar, dates).',
    CT: 'CT log: SSL certificates ka public record.',
    DNS: 'DNS: domain kis IP par chal raha hai — jis samay dekha gaya.'
  };
  Object.keys(JARGON_HL).forEach(k => { JARGON[k].hl = JARGON_HL[k]; });

  // Complaint intake (import / type manually / saved). Each entry has all three languages.
  const CP_STR = {
    cpModeView: { en: 'Case complaint', hi: 'केस की शिकायत', hl: 'Case ki shikayat' },
    cpModeImport: { en: 'Import file', hi: 'फ़ाइल से आयात', hl: 'File se import' },
    cpModeNew: { en: 'Type manually', hi: 'हाथ से भरें', hl: 'Haath se bharein' },
    cpModeSaved: { en: 'Saved ({n})', hi: 'सहेजी गई ({n})', hl: 'Saved ({n})' },
    imTitle: { en: 'Import a complaint file', hi: 'शिकायत फ़ाइल आयात करें', hl: 'Complaint file import karein' },
    imDrop: { en: 'Drop the complaint file here', hi: 'शिकायत फ़ाइल यहाँ छोड़ें', hl: 'Complaint file yahan chhodein' },
    imOr: { en: 'or', hi: 'या', hl: 'ya' },
    imPick: { en: 'Choose file', hi: 'फ़ाइल चुनें', hl: 'File chunein' },
    imFormats: { en: 'Accepted: .csv, .json or .txt (one "Label: value" per line), up to 1 MB.', hi: 'स्वीकार: .csv, .json या .txt (हर पंक्ति में "लेबल: मान"), 1 MB तक।', hl: 'Accepted: .csv, .json ya .txt (har line mein "Label: value"), 1 MB tak.' },
    imNoPdf: { en: 'PDF or scanned complaints are not read in this prototype — use "Type manually".', hi: 'PDF या स्कैन की गई शिकायत इस प्रोटोटाइप में नहीं पढ़ी जाती — "हाथ से भरें" इस्तेमाल करें।', hl: 'PDF ya scan ki gayi shikayat is prototype mein nahi padhi jaati — "Haath se bharein" use karein.' },
    imLocal: { en: 'The file is read only inside this browser. Nothing is uploaded or sent.', hi: 'फ़ाइल सिर्फ़ इसी ब्राउज़र में पढ़ी जाती है। कुछ भी अपलोड या भेजा नहीं जाता।', hl: 'File sirf isi browser mein padhi jaati hai. Kuch bhi upload ya send nahi hota.' },
    imSamples: { en: 'Sample files (fictional):', hi: 'नमूना फ़ाइलें (काल्पनिक):', hl: 'Sample files (kaalpanik):' },
    imTrySample: { en: 'Try the sample complaint →', hi: 'नमूना शिकायत आज़माएँ →', hl: 'Sample shikayat try karein →' },
    imHow: { en: 'How import works', hi: 'आयात कैसे होता है', hl: 'Import kaise hota hai' },
    imStep1: { en: 'The app reads the labels it knows (UTR, amount, date…) and fills the form.', hi: 'ऐप जाने-पहचाने लेबल (UTR, राशि, तारीख…) पढ़कर फ़ॉर्म भरता है।', hl: 'App jaane-pehchaane labels (UTR, amount, date…) padhkar form bharta hai.' },
    imStep2: { en: 'Labels it does not know are listed — never guessed.', hi: 'जो लेबल नहीं पहचाने, उनकी सूची दिखती है — अंदाज़ा नहीं लगाया जाता।', hl: 'Jo labels nahi pehchaane, unki list dikhti hai — andaaza nahi lagaya jaata.' },
    imStep3: { en: 'You check every field against the original complaint, correct it and save. Nothing is saved automatically.', hi: 'आप हर फ़ील्ड को मूल शिकायत से मिलाकर, सुधारकर सहेजते हैं। अपने-आप कुछ नहीं सहेजा जाता।', hl: 'Aap har field ko original shikayat se milaakar, sudhaar kar save karte hain. Apne-aap kuch save nahi hota.' },
    imStep4: { en: "The file's SHA-256 fingerprint is kept with the record.", hi: 'फ़ाइल का SHA-256 फ़िंगरप्रिंट रिकॉर्ड के साथ रखा जाता है।', hl: 'File ka SHA-256 fingerprint record ke saath rakha jaata hai.' },
    imErrType: { en: 'This file type cannot be read here: {name}', hi: 'यह फ़ाइल प्रकार यहाँ नहीं पढ़ा जा सकता: {name}', hl: 'Ye file type yahan nahi padha ja sakta: {name}' },
    imErrSize: { en: '{name} is larger than 1 MB.', hi: '{name} 1 MB से बड़ी है।', hl: '{name} 1 MB se badi hai.' },
    imErrEmpty: { en: 'No known complaint fields found in {name}.', hi: '{name} में कोई पहचाना हुआ शिकायत फ़ील्ड नहीं मिला।', hl: '{name} mein koi pehchaana hua complaint field nahi mila.' },
    imErrParse: { en: 'Could not read {name}: the file format is broken.', hi: '{name} नहीं पढ़ी जा सकी: फ़ाइल का फ़ॉर्मैट ख़राब है।', hl: '{name} nahi padhi ja saki: file ka format kharaab hai.' },
    imMany: { en: 'The file has {n} complaints; only the first one was read.', hi: 'फ़ाइल में {n} शिकायतें हैं; सिर्फ़ पहली पढ़ी गई।', hl: 'File mein {n} shikayatein hain; sirf pehli padhi gayi.' },
    fmTitle: { en: 'New complaint', hi: 'नई शिकायत', hl: 'Nayi shikayat' },
    fmEditTitle: { en: 'Edit complaint {id}', hi: 'शिकायत {id} बदलें', hl: 'Shikayat {id} edit karein' },
    fmFromFile: { en: 'Filled from {name} — check every field', hi: '{name} से भरा गया — हर फ़ील्ड जाँचें', hl: '{name} se bhara gaya — har field check karein' },
    fmFake: { en: 'Prototype: enter fictional details only.', hi: 'प्रोटोटाइप: सिर्फ़ काल्पनिक विवरण डालें।', hl: 'Prototype: sirf kaalpanik details daalein.' },
    fmClear: { en: 'Clear form', hi: 'फ़ॉर्म साफ़ करें', hl: 'Form saaf karein' },
    fmFileMark: { en: 'from file', hi: 'फ़ाइल से', hl: 'file se' },
    fsC: { en: 'Complaint and complainant', hi: 'शिकायत और शिकायतकर्ता', hl: 'Shikayat aur shikayatkarta' },
    fsP: { en: 'Payment made by the victim', hi: 'पीड़ित द्वारा किया गया भुगतान', hl: 'Victim ka kiya gaya payment' },
    fsS: { en: 'Suspect details as told by the victim', hi: 'पीड़ित द्वारा बताए गए संदिग्ध विवरण', hl: 'Victim ke bataye sandigdh details' },
    f_ncrpAck: { en: 'NCRP acknowledgement no.', hi: 'NCRP पावती संख्या', hl: 'NCRP acknowledgement no.' },
    f_received: { en: 'Complaint received (IST)', hi: 'शिकायत मिली (IST)', hl: 'Shikayat mili (IST)' },
    f_name: { en: 'Complainant name', hi: 'शिकायतकर्ता का नाम', hl: 'Shikayatkarta ka naam' },
    f_mobile: { en: 'Complainant mobile', hi: 'शिकायतकर्ता का मोबाइल', hl: 'Shikayatkarta ka mobile' },
    f_fraudType: { en: 'Type of fraud', hi: 'धोखाधड़ी का प्रकार', hl: 'Dhokhadhadi ka prakaar' },
    f_txnTime: { en: 'Payment date-time (IST)', hi: 'भुगतान की तारीख-समय (IST)', hl: 'Payment date-time (IST)' },
    f_amount: { en: 'Amount (₹)', hi: 'राशि (₹)', hl: 'Amount (₹)' },
    f_utr: { en: 'UTR / RRN', hi: 'UTR / RRN', hl: 'UTR / RRN' },
    f_victimBank: { en: "Victim's bank", hi: 'पीड़ित का बैंक', hl: 'Victim ka bank' },
    f_victimAcct: { en: "Victim's account no.", hi: 'पीड़ित का खाता नंबर', hl: 'Victim ka account no.' },
    f_ifsc: { en: 'IFSC', hi: 'IFSC', hl: 'IFSC' },
    f_payee: { en: 'Paid to (UPI ID or account)', hi: 'किसे भेजा (UPI ID या खाता)', hl: 'Kise bheja (UPI ID ya account)' },
    f_website: { en: 'Website / link', hi: 'वेबसाइट / लिंक', hl: 'Website / link' },
    f_suspectPhone: { en: 'Suspect phone(s)', hi: 'संदिग्ध फ़ोन', hl: 'Sandigdh phone' },
    f_description: { en: "What happened (in the complainant's words)", hi: 'क्या हुआ (शिकायतकर्ता के शब्दों में)', hl: 'Kya hua (shikayatkarta ke shabdon mein)' },
    ftChoose: { en: 'Choose…', hi: 'चुनें…', hl: 'Chunein…' },
    ft_investment: { en: 'Investment scheme', hi: 'निवेश योजना', hl: 'Investment scheme' },
    ft_task: { en: 'Online job / task', hi: 'ऑनलाइन नौकरी / टास्क', hl: 'Online job / task' },
    ft_kyc: { en: 'KYC / OTP / fake call', hi: 'KYC / OTP / फ़र्ज़ी कॉल', hl: 'KYC / OTP / fake call' },
    ft_loan: { en: 'Loan app', hi: 'लोन ऐप', hl: 'Loan app' },
    ft_shopping: { en: 'Online shopping', hi: 'ऑनलाइन शॉपिंग', hl: 'Online shopping' },
    ft_sextortion: { en: 'Sextortion / blackmail', hi: 'सेक्सटॉर्शन / ब्लैकमेल', hl: 'Sextortion / blackmail' },
    ft_other: { en: 'Other', hi: 'अन्य', hl: 'Anya' },
    ckTitle: { en: 'Check before saving', hi: 'सहेजने से पहले जाँच', hl: 'Save se pehle check' },
    ckAllGood: { en: 'No format problems found.', hi: 'फ़ॉर्मैट में कोई समस्या नहीं मिली।', hl: 'Format mein koi problem nahi mili.' },
    ckMore: { en: '+{n} more', hi: '+{n} और', hl: '+{n} aur' },
    v_required: { en: '{f}: required', hi: '{f}: ज़रूरी है', hl: '{f}: zaroori hai' },
    v_mobile: { en: '{f}: must be a 10-digit Indian mobile number', hi: '{f}: 10 अंकों का भारतीय मोबाइल नंबर होना चाहिए', hl: '{f}: 10 digit ka Indian mobile number hona chahiye' },
    v_amount: { en: '{f}: enter a number greater than 0 (e.g. 450000)', hi: '{f}: 0 से बड़ी संख्या डालें (जैसे 450000)', hl: '{f}: 0 se badi sankhya daalein (jaise 450000)' },
    v_utr: { en: '{f}: UPI/IMPS RRN has 12 digits; NEFT/RTGS UTR has 16–22 letters/digits', hi: '{f}: UPI/IMPS RRN 12 अंकों का; NEFT/RTGS UTR 16–22 अक्षर/अंक', hl: '{f}: UPI/IMPS RRN 12 digit ka; NEFT/RTGS UTR 16–22 letters/digits' },
    v_ifsc: { en: '{f}: 4 letters, then 0, then 6 letters/digits', hi: '{f}: 4 अक्षर, फिर 0, फिर 6 अक्षर/अंक', hl: '{f}: 4 letters, phir 0, phir 6 letters/digits' },
    v_vpa: { en: '{f}: a UPI ID looks like name@bank', hi: '{f}: UPI ID name@bank जैसी होती है', hl: '{f}: UPI ID name@bank jaisi hoti hai' },
    v_date: { en: '{f}: not a valid date and time', hi: '{f}: सही तारीख-समय नहीं है', hl: '{f}: sahi date-time nahi hai' },
    v_future: { en: '{f}: is in the future', hi: '{f}: भविष्य का समय है', hl: '{f}: future ka samay hai' },
    v_order: { en: '{f}: is after the complaint time', hi: '{f}: शिकायत के समय के बाद का है', hl: '{f}: shikayat ke samay ke baad ka hai' },
    v_url: { en: '{f}: not a web address', hi: '{f}: वेब पता नहीं है', hl: '{f}: web address nahi hai' },
    v_noUtr: { en: 'No UTR/RRN — ask the victim\'s bank; the money trail starts from it', hi: 'UTR/RRN नहीं है — पीड़ित के बैंक से लें; मनी ट्रेल इसी से शुरू होती है', hl: 'UTR/RRN nahi hai — victim ke bank se lein; money trail isi se shuru hoti hai' },
    v_ncrp: { en: '{f}: usually 14 digits — please check', hi: '{f}: आम तौर पर 14 अंक — कृपया जाँचें', hl: '{f}: aam taur par 14 digit — please check karein' },
    v_phone: { en: '{f}: "{v}" is not a 10-digit mobile number', hi: '{f}: "{v}" 10 अंकों का मोबाइल नंबर नहीं है', hl: '{f}: "{v}" 10 digit ka mobile number nahi hai' },
    xTitle: { en: "Matches with this case's evidence", hi: 'इस केस के सबूत से मेल', hl: 'Is case ke saboot se match' },
    xNote: { en: 'Same identifier found — a lead to verify, not proof of who did it.', hi: 'एक ही पहचान-संख्या मिली — यह जाँचने की कड़ी है, किसने किया इसका सबूत नहीं।', hl: 'Same identifier mila — ye check karne ki kadi hai, kisne kiya iska saboot nahi.' },
    xUtr: { en: 'UTR = payment {txn} in {file} (row {row})', hi: 'UTR = भुगतान {txn}, {file} (पंक्ति {row})', hl: 'UTR = payment {txn}, {file} (row {row})' },
    xAmtSame: { en: 'amount matches', hi: 'राशि मेल खाती है', hl: 'amount match' },
    xAmtDiff: { en: 'amount differs: statement shows {a}', hi: 'राशि अलग: स्टेटमेंट में {a}', hl: 'amount alag: statement mein {a}' },
    xVpaAcct: { en: '{vpa} is the UPI ID of A/c {acct} ({bank}) in the statements', hi: '{vpa} स्टेटमेंट में खाता {acct} ({bank}) की UPI ID है', hl: '{vpa} statements mein A/c {acct} ({bank}) ki UPI ID hai' },
    xVpaSite: { en: '{vpa} is also on the website screenshot', hi: '{vpa} वेबसाइट स्क्रीनशॉट पर भी है', hl: '{vpa} website screenshot par bhi hai' },
    xPhone: { en: '{p} is also on the website screenshot', hi: '{p} वेबसाइट स्क्रीनशॉट पर भी है', hl: '{p} website screenshot par bhi hai' },
    xDomain: { en: '{d} is the suspected domain in this case', hi: '{d} इस केस का संदिग्ध डोमेन है', hl: '{d} is case ka sandigdh domain hai' },
    xNone: { en: "No match with this case's statements or website evidence.", hi: 'इस केस के स्टेटमेंट या वेबसाइट सबूत से कोई मेल नहीं।', hl: 'Is case ke statements ya website saboot se koi match nahi.' },
    xNotVisited: { en: 'The app never opens the website — links are only recorded.', hi: 'ऐप वेबसाइट कभी नहीं खोलता — लिंक सिर्फ़ दर्ज होते हैं।', hl: 'App website kabhi nahi kholta — links sirf darj hote hain.' },
    srcTitle: { en: 'Source', hi: 'स्रोत', hl: 'Source' },
    srcTyped: { en: 'Typed by the officer', hi: 'अधिकारी ने टाइप किया', hl: 'Officer ne type kiya' },
    srcFile: { en: 'File {name} · {size}', hi: 'फ़ाइल {name} · {size}', hl: 'File {name} · {size}' },
    srcFilled: { en: '{n} fields filled from the file', hi: 'फ़ाइल से {n} फ़ील्ड भरे गए', hl: 'File se {n} fields bhare gaye' },
    srcUnused: { en: 'Labels not used: {list}', hi: 'इस्तेमाल न हुए लेबल: {list}', hl: 'Use na hue labels: {list}' },
    srcNoHash: { en: 'SHA-256 not available in this browser', hi: 'इस ब्राउज़र में SHA-256 उपलब्ध नहीं', hl: 'Is browser mein SHA-256 available nahi' },
    cfConfirm: { en: 'I have checked these details against the original complaint', hi: 'मैंने ये विवरण मूल शिकायत से मिला लिए हैं', hl: 'Maine ye details original shikayat se mila liye hain' },
    cfSave: { en: 'Save complaint', hi: 'शिकायत सहेजें', hl: 'Shikayat save karein' },
    cfLocal: { en: 'Saved only in this browser (prototype).', hi: 'सिर्फ़ इसी ब्राउज़र में सहेजा जाता है (प्रोटोटाइप)।', hl: 'Sirf isi browser mein save hota hai (prototype).' },
    cfNoStore: { en: 'This browser blocks storage — the record stays only until the page is closed.', hi: 'यह ब्राउज़र स्टोरेज रोकता है — रिकॉर्ड पेज बंद होने तक ही रहेगा।', hl: 'Ye browser storage rokta hai — record page band hone tak hi rahega.' },
    svTitle: { en: 'Saved complaints', hi: 'सहेजी गई शिकायतें', hl: 'Saved shikayatein' },
    svEmpty: { en: 'No complaints saved yet.', hi: 'अभी कोई शिकायत सहेजी नहीं गई।', hl: 'Abhi koi shikayat save nahi hui.' },
    svPick: { en: 'Choose a complaint on the left.', hi: 'बाईं ओर से शिकायत चुनें।', hl: 'Left se shikayat chunein.' },
    svSaved: { en: 'Saved {t}', hi: 'सहेजा गया {t}', hl: 'Save hua {t}' },
    svJustSaved: { en: 'Saved as {id}.', hi: '{id} के रूप में सहेजा गया।', hl: '{id} ke roop mein save hua.' },
    svEdit: { en: 'Edit', hi: 'बदलें', hl: 'Edit' },
    svDelete: { en: 'Delete', hi: 'हटाएँ', hl: 'Delete' },
    svConfirmDel: { en: 'Click again to delete', hi: 'हटाने के लिए फिर क्लिक करें', hl: 'Delete ke liye phir click karein' },
    svNew: { en: '+ New complaint', hi: '+ नई शिकायत', hl: '+ Nayi shikayat' }
  };
  Object.assign(STR, CP_STR);

  // Case report (report.html). Each entry has all three languages.
  const RP_STR = {
    rpTitle: { en: 'Case report (draft)', hi: 'केस रिपोर्ट (ड्राफ़्ट)', hl: 'Case report (draft)' },
    rpContents: { en: 'Contents', hi: 'विषय-सूची', hl: 'Vishay-soochi' },
    rpS1: { en: 'Summary', hi: 'सारांश', hl: 'Saaraansh' },
    rpS2: { en: 'Complaint', hi: 'शिकायत', hl: 'Shikayat' },
    rpS3: { en: 'Timeline: events and observations', hi: 'घटनाक्रम: घटनाएँ और अवलोकन', hl: 'Ghatnakram: events aur observations' },
    rpS4: { en: 'Money trail', hi: 'मनी ट्रेल', hl: 'Money trail' },
    rpS5: { en: 'Transfers and evidence rows', hi: 'ट्रांसफ़र और सबूत की पंक्तियाँ', hl: 'Transfers aur saboot ki rows' },
    rpS6: { en: 'Accounts on the trail', hi: 'ट्रेल पर खाते', hl: 'Trail par accounts' },
    rpS7: { en: 'Why accounts were flagged', hi: 'खाते क्यों फ़्लैग हुए', hl: 'Accounts kyon flag hue' },
    rpS8: { en: 'Website and server', hi: 'वेबसाइट और सर्वर', hl: 'Website aur server' },
    rpS9: { en: 'Requests and next steps', hi: 'अनुरोध और अगले कदम', hl: 'Requests aur agle kadam' },
    rpS10: { en: 'Method and limits', hi: 'तरीका और सीमाएँ', hl: 'Tareeka aur seemayein' },
    rpContinued: { en: '(continued)', hi: '(जारी)', hl: '(jaari)' },
    rpGenerated: { en: 'Generated {t}', hi: 'तैयार {t}', hl: 'Banaya gaya {t}' },
    rpPreparedBy: { en: 'Prepared by', hi: 'तैयारकर्ता', hl: 'Taiyaar kiya' },
    rpReviewedYes: { en: 'Reviewed by the officer', hi: 'अधिकारी द्वारा जाँचा गया', hl: 'Officer ne check kiya' },
    rpReviewedNo: { en: 'NOT yet reviewed by an officer', hi: 'अभी अधिकारी द्वारा जाँचा नहीं गया', hl: 'Abhi officer ne check nahi kiya' },
    rpPageFoot: { en: 'Page {p} of {n}', hi: 'पृष्ठ {p} / {n}', hl: 'Page {p} / {n}' },
    rpFoot: { en: 'DRAFT · JaanchMitra prototype · fictional data · computed by fixed rules from the listed evidence · not a finding of guilt', hi: 'ड्राफ़्ट · जांच-मित्र प्रोटोटाइप · काल्पनिक डेटा · सूचीबद्ध सबूतों से तय नियमों द्वारा गणना · दोष का निष्कर्ष नहीं', hl: 'DRAFT · JaanchMitra prototype · kaalpanik data · list kiye saboot se fixed rules se calculate · dosh ka nishkarsh nahi' },
    rpKeyFigures: { en: 'Key figures', hi: 'मुख्य आँकड़े', hl: 'Mukhya aankde' },
    rpWithdrawn: { en: 'Withdrawn as cash', hi: 'नकद निकाला गया', hl: 'Cash nikala gaya' },
    rpReach: { en: 'Accounts reached', hi: 'पहुँचे खाते', hl: 'Accounts tak pahuncha' },
    rpFindings: { en: 'Findings in brief', hi: 'संक्षेप में निष्कर्ष', hl: 'Sankshep mein nishkarsh' },
    rpF1: { en: '{loss} left the victim\'s account and reached {n} accounts in {hops} hops within {dur}.', hi: '{loss} पीड़ित के खाते से निकलकर {dur} के अंदर {hops} चरणों में {n} खातों तक पहुँचे।', hl: '{loss} victim ke account se nikalkar {dur} ke andar {hops} steps mein {n} accounts tak pahunche.' },
    rpF2: { en: '{n} accounts meet the suspected-mule threshold (score 50 or more out of 100): {list}.', hi: '{n} खाते संदिग्ध म्यूल की सीमा (100 में से 50 या अधिक स्कोर) पार करते हैं: {list}।', hl: '{n} accounts sandigdh mule ki seema (100 mein se 50 ya zyada score) paar karte hain: {list}.' },
    rpF3: { en: 'The UPI ID on the website evidence ({vpa}) is the UPI ID of A/c {acct}, which received the victim\'s payment.', hi: 'वेबसाइट सबूत पर दी गई UPI ID ({vpa}) खाता {acct} की UPI ID है, जिसमें पीड़ित का भुगतान आया।', hl: 'Website saboot par di gayi UPI ID ({vpa}) A/c {acct} ki UPI ID hai, jisme victim ka payment aaya.' },
    rpF4: { en: '{amt} was withdrawn as cash from {n} accounts.', hi: '{n} खातों से {amt} नकद निकाले गए।', hl: '{n} accounts se {amt} cash nikala gaya.' },
    rpF5: { en: 'An estimated {est} (FIFO; LIFO {lifo}) may still be traceable in {n} accounts. This is an estimate, not a recovery guarantee.', hi: 'अनुमानित {est} (FIFO; LIFO {lifo}) अभी भी {n} खातों में ट्रेस हो सकते हैं। यह अनुमान है, वसूली की गारंटी नहीं।', hl: 'Andaazan {est} (FIFO; LIFO {lifo}) abhi bhi {n} accounts mein trace ho sakte hain. Ye andaaza hai, recovery ki guarantee nahi.' },
    rpIsNot: { en: 'What this report is not', hi: 'यह रिपोर्ट क्या नहीं है', hl: 'Ye report kya nahi hai' },
    rpIsNotText: { en: 'It does not say who committed the fraud. An account, UPI ID, IP address or domain is not a person. Every figure comes from the statements and lookups listed in this report; estimates are not recovery guarantees.', hi: 'यह नहीं बताती कि धोखाधड़ी किसने की। खाता, UPI ID, IP पता या डोमेन कोई व्यक्ति नहीं है। हर आँकड़ा इस रिपोर्ट में दिए स्टेटमेंट और लुकअप से है; अनुमान वसूली की गारंटी नहीं हैं।', hl: 'Ye nahi batati ki dhokhadhadi kisne ki. Account, UPI ID, IP address ya domain koi vyakti nahi hai. Har aankda is report mein diye statements aur lookups se hai; andaaze recovery ki guarantee nahi hain.' },
    rpLinkedCmp: { en: 'Complaints saved in this browser that match this case: {list}', hi: 'इस ब्राउज़र में सहेजी गई शिकायतें जो इस केस से मेल खाती हैं: {list}', hl: 'Is browser mein saved shikayatein jo is case se match karti hain: {list}' },
    rpColTime: { en: 'Time (IST)', hi: 'समय (IST)', hl: 'Samay (IST)' },
    rpColKind: { en: 'Type', hi: 'प्रकार', hl: 'Prakaar' },
    rpColWhat: { en: 'What happened', hi: 'क्या हुआ', hl: 'Kya hua' },
    rpColSource: { en: 'Source', hi: 'स्रोत', hl: 'Source' },
    rpTlNote: { en: 'Event = when it happened, from the records. Observation = when it was looked up; it does not show when something started.', hi: 'घटना = कब हुआ, रिकॉर्ड से। अवलोकन = कब देखा गया; इससे यह पता नहीं चलता कि कब शुरू हुआ।', hl: 'Event = kab hua, records se. Observation = kab dekha gaya; isse ye pata nahi chalta ki kab shuru hua.' },
    rpGraphNote: { en: 'Layered view, FIFO. Solid line = confirmed (same RRN in both statements); dashed = probable; dotted = unresolved.', hi: 'चरणबद्ध दृश्य, FIFO। ठोस रेखा = पुष्ट (दोनों स्टेटमेंट में एक ही RRN); डैश = संभावित; बिंदु = अनसुलझा।', hl: 'Layered view, FIFO. Solid line = confirmed (dono statements mein same RRN); dashed = probable; dotted = unresolved.' },
    rpDrawing: { en: 'Drawing the money trail…', hi: 'मनी ट्रेल बनाई जा रही है…', hl: 'Money trail ban rahi hai…' },
    rpColId: { en: 'ID', hi: 'ID', hl: 'ID' },
    rpColFromTo: { en: 'From → To', hi: 'से → को', hl: 'Se → Ko' },
    rpColRows: { en: 'Statement rows (sender · receiver)', hi: 'स्टेटमेंट पंक्तियाँ (भेजने वाला · पाने वाला)', hl: 'Statement rows (bhejne wala · paane wala)' },
    rpCash: { en: 'Cash withdrawal', hi: 'नकद निकासी', hl: 'Cash nikasi' },
    rpColAcct: { en: 'Account', hi: 'खाता', hl: 'Account' },
    rpColRole: { en: 'Role', hi: 'भूमिका', hl: 'Role' },
    rpColScore: { en: 'Score', hi: 'स्कोर', hl: 'Score' },
    rpColRules: { en: 'Rules', hi: 'नियम', hl: 'Rules' },
    rpColEst: { en: 'Est. traceable FIFO / LIFO', hi: 'अनुमानित ट्रेस योग्य FIFO / LIFO', hl: 'Est. traceable FIFO / LIFO' },
    rpEvRows: { en: 'Evidence: {list}', hi: 'सबूत: {list}', hl: 'Saboot: {list}' },
    rpNotIdentity: { en: 'An IP address or domain is not a person\'s identity. All lookups are passive public records; the app never visits or scans the server.', hi: 'IP पता या डोमेन किसी व्यक्ति की पहचान नहीं है। सभी लुकअप निष्क्रिय सार्वजनिक रिकॉर्ड हैं; ऐप कभी सर्वर पर नहीं जाता या उसे स्कैन नहीं करता।', hl: 'IP address ya domain kisi vyakti ki pehchaan nahi hai. Saare lookups passive public records hain; app kabhi server par nahi jaata ya scan nahi karta.' },
    rpItem: { en: 'Item', hi: 'विषय', hl: 'Item' },
    rpValue: { en: 'Value', hi: 'मान', hl: 'Value' },
    rpStatus: { en: 'Status', hi: 'स्थिति', hl: 'Status' },
    rpNotSent: { en: 'Draft — not sent', hi: 'ड्राफ़्ट — भेजा नहीं गया', hl: 'Draft — bheja nahi gaya' },
    rpDraftsHead: { en: 'Request drafts', hi: 'अनुरोध ड्राफ़्ट', hl: 'Request drafts' },
    rpNextHead: { en: 'Suggested next steps (the officer decides)', hi: 'सुझाए गए अगले कदम (निर्णय अधिकारी का)', hl: 'Sujhaaye gaye agle kadam (faisla officer ka)' },
    rpSignoff: { en: 'Officer\'s review', hi: 'अधिकारी की समीक्षा', hl: 'Officer ki samiksha' },
    rpSignLine: { en: 'Name · Designation · Signature · Date', hi: 'नाम · पद · हस्ताक्षर · तारीख', hl: 'Naam · Pad · Hastakshar · Taareekh' },
    rpRulesHead: { en: 'Mule rules: fixed weights; score 50+ = suspected, 75+ = critical', hi: 'म्यूल नियम: तय वज़न; 50+ स्कोर = संदिग्ध, 75+ = गंभीर', hl: 'Mule rules: fixed weights; 50+ score = sandigdh, 75+ = gambhir' },
    rpLinkRules: { en: 'Links: Confirmed = same RRN in both statements. Probable = same amount within 300 seconds and the receiver row has no RRN. Unresolved = receiver statement not available.', hi: 'कड़ियाँ: पुष्ट = दोनों स्टेटमेंट में एक ही RRN। संभावित = 300 सेकंड के अंदर एक ही राशि और पाने वाले की पंक्ति में RRN नहीं। अनसुलझा = पाने वाले का स्टेटमेंट उपलब्ध नहीं।', hl: 'Links: Confirmed = dono statements mein same RRN. Probable = 300 second ke andar same amount aur receiver row mein RRN nahi. Unresolved = receiver ka statement available nahi.' },
    rpFifo: { en: 'FIFO assumes the oldest money in an account leaves first; LIFO assumes the newest leaves first. Both are shown because the true order is not known.', hi: 'FIFO मानता है कि खाते का सबसे पुराना पैसा पहले निकलता है; LIFO मानता है कि सबसे नया पहले। दोनों दिखाए गए हैं क्योंकि असली क्रम पता नहीं।', hl: 'FIFO maanta hai ki account ka sabse purana paisa pehle nikalta hai; LIFO maanta hai ki sabse naya pehle. Dono dikhaye gaye hain kyonki asli order pata nahi.' },
    rpWindow: { en: 'The trail follows money forward for up to 72 hours from the victim\'s payment.', hi: 'ट्रेल पीड़ित के भुगतान से 72 घंटे तक पैसे का पीछा करती है।', hl: 'Trail victim ke payment se 72 ghante tak paise ka peecha karti hai.' },
    rpNoAi: { en: 'No AI model makes any decision in this report. Every flag comes from the fixed rules above, with the statement rows that triggered it.', hi: 'इस रिपोर्ट में कोई AI मॉडल कोई निर्णय नहीं लेता। हर फ़्लैग ऊपर के तय नियमों से है, उन स्टेटमेंट पंक्तियों के साथ जिनसे वह लगा।', hl: 'Is report mein koi AI model koi faisla nahi leta. Har flag upar ke fixed rules se hai, un statement rows ke saath jinse wo laga.' },
    rpSources: { en: 'Evidence files', hi: 'सबूत की फ़ाइलें', hl: 'Saboot ki files' },
    rpReviewLabel: { en: 'I have reviewed this report against the evidence', hi: 'मैंने यह रिपोर्ट सबूतों से जाँच ली है', hl: 'Maine ye report saboot se check kar li hai' },
    rpBefore: { en: 'Before signing', hi: 'हस्ताक्षर से पहले', hl: 'Sign karne se pehle' },
    rpChkStmt: { en: 'Statements received: {r} of {n}', hi: 'स्टेटमेंट मिले: {n} में से {r}', hl: 'Statements mile: {n} mein se {r}' },
    rpChkProb: { en: '{n} probable link(s) to confirm with the bank', hi: '{n} संभावित कड़ी बैंक से पुष्ट करनी है', hl: '{n} probable link bank se confirm karna hai' },
    rpChkUnres: { en: '{amt} unresolved — statement awaited', hi: '{amt} अनसुलझा — स्टेटमेंट का इंतज़ार', hl: '{amt} unresolved — statement ka intezaar' },
    rpChkReviewed: { en: 'Reviewed by the officer', hi: 'अधिकारी ने जाँचा', hl: 'Officer ne check kiya' },
    rpPrintNote: { en: 'Prints all {n} pages as one DRAFT document. Choose "Save as PDF" in the print window to keep a file.', hi: 'सभी {n} पृष्ठ एक ड्राफ़्ट दस्तावेज़ के रूप में छपते हैं। फ़ाइल रखने के लिए प्रिंट विंडो में "Save as PDF" चुनें।', hl: 'Saare {n} pages ek DRAFT document ke roop mein print hote hain. File rakhne ke liye print window mein "Save as PDF" chunein.' },
    rpLangNote: { en: 'The report prints in the language chosen at the top.', hi: 'रिपोर्ट ऊपर चुनी गई भाषा में छपती है।', hl: 'Report upar chuni gayi bhasha mein print hoti hai.' }
  };
  Object.assign(STR, RP_STR);

  // Helplines (js/data/helplines.js): descriptions without numbers; numbers and sites come from the data file.
  const HL_STR = {
    hd1930: { en: 'Report financial cyber fraud — this starts the hold process', hi: 'वित्तीय साइबर धोखाधड़ी की रिपोर्ट — पैसा रोकने की प्रक्रिया यहीं से शुरू', hl: 'Financial cyber fraud ki report — paisa rokne ki prakriya yahin se shuru' },
    hdChakshu: { en: 'Report the fraud call, SMS or WhatsApp', hi: 'धोखाधड़ी वाली कॉल, SMS या WhatsApp की रिपोर्ट', hl: 'Fraud call, SMS ya WhatsApp ki report' },
    hdCeir: { en: 'Block a lost or stolen phone', hi: 'खोया या चोरी हुआ फ़ोन ब्लॉक करें', hl: 'Khoya ya chori hua phone block karein' },
    hdRbi: { en: 'Bank service complaints', hi: 'बैंक सेवा संबंधी शिकायत', hl: 'Bank service ki shikayat' },
    hd112: { en: 'If there is immediate danger', hi: 'अगर तुरंत खतरा हो', hl: 'Agar turant khatra ho' },
    hlCall: { en: 'Call {n}', hi: '{n} पर कॉल', hl: '{n} par call' },
    hlCallAria: { en: 'Call {n} (opens your phone dialler)', hi: '{n} पर कॉल करें (फ़ोन का डायलर खुलेगा)', hl: '{n} par call karein (phone ka dialer khulega)' },
    hlOpenAria: { en: 'Open {site} in a new tab (official site)', hi: '{site} नए टैब में खोलें (आधिकारिक साइट)', hl: '{site} naye tab mein kholein (official site)' },
    hlChecked: { en: 'Official numbers and sites · checked {d}', hi: 'आधिकारिक नंबर और साइट · जाँचे गए {d}', hl: 'Official numbers aur sites · check kiye {d}' },
    hlFraud: { en: 'Financial cyber fraud:', hi: 'वित्तीय साइबर धोखाधड़ी:', hl: 'Financial cyber fraud:' },
    hlEmergency: { en: 'Emergency:', hi: 'आपात:', hl: 'Emergency:' },
    hNote2: { en: 'A call button opens your phone\'s dialler — you place the call. Sites open in a new tab. The app never calls or reports on anyone\'s behalf.', hi: 'कॉल बटन आपके फ़ोन का डायलर खोलता है — कॉल आप करते हैं। साइट नए टैब में खुलती है। ऐप किसी की ओर से कॉल या रिपोर्ट नहीं करता।', hl: 'Call button aapke phone ka dialer kholta hai — call aap karte hain. Site naye tab mein khulti hai. App kisi ki taraf se call ya report nahi karta.' }
  };
  Object.assign(STR, HL_STR);

  // Sankey view (money-trail page). All three languages.
  const SK_STR = {
    skTitle: { en: 'Where the money went', hi: 'पैसा कहाँ गया', hl: 'Paisa kahan gaya' },
    skCaption: { en: '{loss} left the victim: {cash} withdrawn as cash · {held} estimated still in accounts ({method}) · {unres} unresolved. Band width = amount.', hi: '{loss} पीड़ित से निकले: {cash} नकद निकाले गए · {held} अनुमानित अभी खातों में ({method}) · {unres} अनसुलझा। पट्टी की चौड़ाई = राशि।', hl: '{loss} victim se nikle: {cash} cash nikala gaya · {held} andaazan abhi accounts mein ({method}) · {unres} unresolved. Patti ki chaudai = rakam.' },
    skAdds: { en: 'Adds up: {cash} + {held} + {unres} = {loss} ✓', hi: 'जोड़ सही: {cash} + {held} + {unres} = {loss} ✓', hl: 'Jod sahi: {cash} + {held} + {unres} = {loss} ✓' },
    skNotAdds: { en: 'Does not add up: {diff} not explained — check the statements', hi: 'जोड़ मेल नहीं खाता: {diff} का हिसाब नहीं — स्टेटमेंट जाँचें', hl: 'Jod match nahi: {diff} ka hisaab nahi — statements check karein' },
    skCash: { en: 'Withdrawn as cash', hi: 'नकद निकाला गया', hl: 'Cash nikala gaya' },
    skHeld: { en: 'Est. still in account', hi: 'अनुमानित अभी खाते में', hl: 'Andaazan abhi account mein' },
    skUnres: { en: 'Unresolved (statement missing)', hi: 'अनसुलझा (स्टेटमेंट नहीं)', hl: 'Unresolved (statement nahi)' },
    skBandTransfer: { en: 'Transfer (victim share)', hi: 'ट्रांसफ़र (पीड़ित का हिस्सा)', hl: 'Transfer (victim ka hissa)' },
    skBandProbable: { en: 'Probable transfer (hatched)', hi: 'संभावित ट्रांसफ़र (धारीदार)', hl: 'Probable transfer (dhaaridaar)' },
    skHint: { en: 'Tap a band or an account for details.', hi: 'विवरण के लिए किसी पट्टी या खाते पर टैप करें।', hl: 'Details ke liye kisi patti ya account par tap karein.' },
    skScroll: { en: 'Swipe sideways to see the whole flow →', hi: 'पूरा प्रवाह देखने के लिए बगल में स्वाइप करें →', hl: 'Poora flow dekhne ke liye side mein swipe karein →' },
    skSinkCashText: { en: 'Cash withdrawals of victim money, from the bank statements:', hi: 'पीड़ित के पैसे की नकद निकासी, बैंक स्टेटमेंट से:', hl: 'Victim ke paise ki cash nikasi, bank statements se:' },
    skSinkHeldText: { en: 'Victim money estimated to be still in these accounts ({method}). An estimate, not a recovery guarantee:', hi: 'इन खातों में अनुमानित रूप से बचा पीड़ित का पैसा ({method})। यह अनुमान है, वसूली की गारंटी नहीं:', hl: 'In accounts mein andaazan bacha victim ka paisa ({method}). Ye andaaza hai, recovery ki guarantee nahi:' },
    skSinkUnresText: { en: 'Money that reached accounts whose statements are not available yet:', hi: 'वह पैसा जो उन खातों में गया जिनके स्टेटमेंट अभी उपलब्ध नहीं:', hl: 'Wo paisa jo un accounts mein gaya jinke statements abhi available nahi:' },
    skTableCap: { en: 'Money flows shown in the diagram', hi: 'आरेख में दिखाए गए पैसे के प्रवाह', hl: 'Diagram mein dikhaye gaye paise ke flow' },
    skFrom: { en: 'From', hi: 'से', hl: 'Se' },
    skTo: { en: 'To', hi: 'को', hl: 'Ko' },
    rsVictim: { en: 'victim', hi: 'पीड़ित', hl: 'victim' },
    rsMule: { en: 'suspected mule', hi: 'संदिग्ध म्यूल', hl: 'sandigdh mule' },
    rsOnTrail: { en: 'on trail', hi: 'ट्रेल पर', hl: 'trail par' },
    rsCashout: { en: 'cash-out', hi: 'नकद निकासी', hl: 'cash-out' },
    rsUnresolved: { en: 'no statement', hi: 'स्टेटमेंट नहीं', hl: 'statement nahi' }
  };
  Object.assign(STR, SK_STR);

  Object.assign(STR, {
    reqTypeCertIn: { en: 'CERT-In: phishing site report', hi: 'CERT-In: फ़िशिंग साइट की रिपोर्ट', hl: 'CERT-In: phishing site report' },
    unresolvedNext2: { en: 'Next: request this account\'s statement from {bank}.', hi: 'अगला कदम: {bank} से इस खाते का स्टेटमेंट मंगाएँ।', hl: 'Agla kadam: {bank} se is account ka statement mangaayein.' }
  });

  Object.assign(STR, {
      "fdColFinding": {
          "en": "Finding",
          "hi": "निष्कर्ष",
          "hl": "Nishkarsh"
      },
      "fdColFigure": {
          "en": "Figure",
          "hi": "आँकड़ा",
          "hl": "Aankda"
      },
      "fdColBasis": {
          "en": "Based on",
          "hi": "आधार",
          "hl": "Aadhaar"
      },
      "fdMules": {
          "en": "Suspected mule accounts",
          "hi": "संदिग्ध म्यूल खाते",
          "hl": "Sandigdh mule accounts"
      },
      "fdLink": {
          "en": "Website UPI ID = account",
          "hi": "वेबसाइट UPI ID = खाता",
          "hl": "Website UPI ID = account"
      },
      "fdLinkBasis": {
          "en": "Screenshot + statement (strong)",
          "hi": "स्क्रीनशॉट + स्टेटमेंट (मज़बूत)",
          "hl": "Screenshot + statement (strong)"
      },
      "fdCash": {
          "en": "Cash withdrawn",
          "hi": "नकद निकाला गया",
          "hl": "Cash nikala gaya"
      },
      "fdMissing": {
          "en": "Statement missing",
          "hi": "स्टेटमेंट नहीं मिला",
          "hl": "Statement nahi mila"
      },
      "fdColStep": {
          "en": "Step",
          "hi": "कदम",
          "hl": "Kadam"
      },
      "fdColEst": {
          "en": "Est.",
          "hi": "अनुमान",
          "hl": "Andaaza"
      },
      "fdColWhere": {
          "en": "Bank · branch",
          "hi": "बैंक · शाखा",
          "hl": "Bank · branch"
      },
      "actHoldShort": {
          "en": "Hold request: A/c {acct}",
          "hi": "होल्ड अनुरोध: खाता {acct}",
          "hl": "Hold request: A/c {acct}"
      },
      "plOnline": {
          "en": "Online ({rail}) — no physical place",
          "hi": "ऑनलाइन ({rail}) — कोई भौतिक जगह नहीं",
          "hl": "Online ({rail}) — koi physical jagah nahi"
      },
      "plBranch": {
          "en": "{b} branch",
          "hi": "{b} शाखा",
          "hl": "{b} branch"
      }
  });

  Object.assign(STR, {
      "fdMulesBasis": {
          "en": "Fixed rules R1–R6 + statement rows",
          "hi": "तय नियम R1–R6 + स्टेटमेंट पंक्तियाँ",
          "hl": "Fixed rules R1–R6 + statement rows"
      }
  });

  Object.assign(STR, {
      "stColBankCity": {
          "en": "Bank · city",
          "hi": "बैंक · शहर",
          "hl": "Bank · shahar"
      },
      "stColRows": {
          "en": "Rows",
          "hi": "पंक्तियाँ",
          "hl": "Rows"
      },
      "stColRole": {
          "en": "On the trail",
          "hi": "ट्रेल पर",
          "hl": "Trail par"
      },
      "stMissingShort": {
          "en": "Missing",
          "hi": "नहीं मिला",
          "hl": "Nahi mila"
      },
      "stNotOnTrail": {
          "en": "Not on the trail",
          "hi": "ट्रेल पर नहीं",
          "hl": "Trail par nahi"
      },
      "stHomeBranch": {
          "en": "Home branch (from IFSC)",
          "hi": "मूल शाखा (IFSC से)",
          "hl": "Home branch (IFSC se)"
      },
      "stPlace": {
          "en": "Place / area",
          "hi": "जगह / क्षेत्र",
          "hl": "Jagah / area"
      },
      "plOnlineShort": {
          "en": "Online ({rail})",
          "hi": "ऑनलाइन ({rail})",
          "hl": "Online ({rail})"
      }
  });

  Object.assign(STR, {
      "mtCashWhere": {
          "en": "Cash taken out — where",
          "hi": "नकद निकासी — कहाँ",
          "hl": "Cash nikasi — kahan"
      },
      "mtColSeen": {
          "en": "What was seen (statement rows)",
          "hi": "क्या दिखा (स्टेटमेंट पंक्तियाँ)",
          "hl": "Kya dikha (statement rows)"
      },
      "mtColPts": {
          "en": "Pts",
          "hi": "अंक",
          "hl": "Ank"
      },
      "plHomeNote": {
          "en": "home branches, not where the payment was made",
          "hi": "मूल शाखाएँ, भुगतान की जगह नहीं",
          "hl": "home branches, payment ki jagah nahi"
      }
  });

  Object.assign(STR, {
      "wbColObserved": {
          "en": "Kind · when",
          "hi": "प्रकार · कब",
          "hl": "Prakaar · kab"
      }
  });

  Object.assign(STR, {
      "reqTypeCctv": {
          "en": "Bank: ATM / branch CCTV",
          "hi": "बैंक: ATM / शाखा CCTV",
          "hl": "Bank: ATM / branch CCTV"
      }
  });

  Object.assign(STR, {
      "cpEvCol": {
          "en": "Evidence",
          "hi": "सबूत",
          "hl": "Saboot"
      },
      "cpEvCount": {
          "en": "Count",
          "hi": "संख्या",
          "hl": "Sankhya"
      },
      "cpEvStatements": {
          "en": "Bank statements of trail accounts",
          "hi": "ट्रेल खातों के बैंक स्टेटमेंट",
          "hl": "Trail accounts ke bank statements"
      },
      "cpRecv": {
          "en": "Received",
          "hi": "मिला",
          "hl": "Mila"
      },
      "hlColName": {
          "en": "Helpline",
          "hi": "हेल्पलाइन",
          "hl": "Helpline"
      },
      "hlColWhen": {
          "en": "When to use",
          "hi": "कब इस्तेमाल करें",
          "hl": "Kab use karein"
      },
      "hlColAct": {
          "en": "Call / open",
          "hi": "कॉल / खोलें",
          "hl": "Call / kholein"
      }
  });

  Object.assign(STR, {
      "srcFileShort": {
          "en": "File",
          "hi": "फ़ाइल",
          "hl": "File"
      },
      "srcTypedShort": {
          "en": "Typed",
          "hi": "टाइप किया",
          "hl": "Type kiya"
      }
  });

  Object.assign(STR, {
      "viewPlaces": {
          "en": "Places (where)",
          "hi": "जगहें (कहाँ)",
          "hl": "Jagahein (kahan)"
      },
      "plCaption": {
          "en": "Trail accounts are held in {n} cities. {cash} was taken out as cash in {cities}.",
          "hi": "ट्रेल के खाते {n} शहरों में हैं। {cities} में {cash} नकद निकाले गए।",
          "hl": "Trail ke accounts {n} shahron mein hain. {cities} mein {cash} cash nikala gaya."
      },
      "plHint": {
          "en": "Tap a city on the map or a row in the table.",
          "hi": "नक्शे पर कोई शहर या तालिका में कोई पंक्ति चुनें।",
          "hl": "Map par koi shahar ya table mein koi row chunein."
      },
      "plColCity": {
          "en": "City",
          "hi": "शहर",
          "hl": "Shahar"
      },
      "plColAccts": {
          "en": "Accounts held here",
          "hi": "यहाँ के खाते",
          "hl": "Yahan ke accounts"
      },
      "plColCash": {
          "en": "Cash taken out here",
          "hi": "यहाँ नकद निकासी",
          "hl": "Yahan cash nikasi"
      },
      "plColBranch": {
          "en": "Branch",
          "hi": "शाखा",
          "hl": "Branch"
      },
      "plAcctsHere": {
          "en": "Accounts held in this city (home branch from IFSC)",
          "hi": "इस शहर में रखे खाते (IFSC से मूल शाखा)",
          "hl": "Is shahar mein rakhe accounts (IFSC se home branch)"
      },
      "plCashHere": {
          "en": "Cash taken out here",
          "hi": "यहाँ नकद निकासी",
          "hl": "Yahan cash nikasi"
      },
      "plCctvDraft": {
          "en": "CCTV request draft →",
          "hi": "CCTV अनुरोध ड्राफ़्ट →",
          "hl": "CCTV request draft →"
      },
      "plFlows": {
          "en": "Transfers to / from this city",
          "hi": "इस शहर से / को ट्रांसफ़र",
          "hl": "Is shahar se / ko transfers"
      },
      "plNote": {
          "en": "A home branch is where an account is held, not where the holder was. Cash withdrawals show a real ATM or branch, from the statement narration.",
          "hi": "मूल शाखा वह जगह है जहाँ खाता है, खाताधारक कहाँ था यह नहीं। नकद निकासी असली ATM या शाखा दिखाती है, स्टेटमेंट विवरण से।",
          "hl": "Home branch wo jagah hai jahan account hai, account holder kahan tha ye nahi. Cash nikasi asli ATM ya branch dikhati hai, statement narration se."
      },
      "plFoot": {
          "en": "Cities from IFSC home branches; ATM / branch codes from statement narrations.",
          "hi": "शहर IFSC मूल शाखाओं से; ATM / शाखा कोड स्टेटमेंट विवरण से।",
          "hl": "Shahar IFSC home branches se; ATM / branch codes statement narration se."
      },
      "plMapLabel": {
          "en": "Schematic map: cities where trail accounts are held and where cash was taken out, with transfers between them",
          "hi": "योजनाबद्ध नक्शा: ट्रेल खातों के शहर और नकद निकासी की जगहें, उनके बीच ट्रांसफ़र के साथ",
          "hl": "Schematic map: trail accounts ke shahar aur cash nikasi ki jagahein, unke beech transfers ke saath"
      },
      "plSchematic": {
          "en": "Schematic — cities at approximate coordinates, not a street map",
          "hi": "योजनाबद्ध — शहर अनुमानित निर्देशांक पर, सड़क नक्शा नहीं",
          "hl": "Schematic — shahar approx coordinates par, street map nahi"
      },
      "plLgMule": {
          "en": "City with a suspected mule account",
          "hi": "संदिग्ध म्यूल खाते वाला शहर",
          "hl": "Sandigdh mule account wala shahar"
      },
      "plLgCash": {
          "en": "Cash taken out here",
          "hi": "यहाँ नकद निकासी",
          "hl": "Yahan cash nikasi"
      },
      "plLgFlow": {
          "en": "Transfer between home-branch cities (width = amount)",
          "hi": "मूल शाखा शहरों के बीच ट्रांसफ़र (चौड़ाई = राशि)",
          "hl": "Home-branch shahron ke beech transfer (chaudai = rakam)"
      },
      "plAcctsN": {
          "en": "{n} account(s)",
          "hi": "{n} खाते",
          "hl": "{n} account"
      }
  });

  Object.assign(STR, {
      "tipClick": {
          "en": "Click for full details",
          "hi": "पूरे विवरण के लिए क्लिक करें",
          "hl": "Poori details ke liye click karein"
      },
      "graphKbdHelp": {
          "en": "Money trail graph. Arrow keys move between accounts, Enter shows details, Escape clears.",
          "hi": "मनी ट्रेल ग्राफ़। तीर कुंजियों से खातों के बीच जाएँ, Enter से विवरण, Escape से हटाएँ।",
          "hl": "Money trail graph. Arrow keys se accounts ke beech jaayein, Enter se details, Escape se hatayein."
      },
      "gMoving": {
          "en": "Show money moving",
          "hi": "पैसे का चलना दिखाएँ",
          "hl": "Paise ka chalna dikhayein"
      },
      "gPng": {
          "en": "Download this graph as an image (PNG)",
          "hi": "यह ग्राफ़ इमेज (PNG) के रूप में डाउनलोड करें",
          "hl": "Ye graph image (PNG) ke roop mein download karein"
      },
      "gReset": {
          "en": "Reset layout and fit",
          "hi": "लेआउट रीसेट करें और फ़िट करें",
          "hl": "Layout reset aur fit karein"
      },
      "gHelp": {
          "en": "Hover for facts · drag to rearrange · ▶₹ shows money moving · arrows + Enter",
          "hi": "तथ्य के लिए होवर · खींचकर जमाएँ · ▶₹ पैसे का चलना · तीर + Enter",
          "hl": "Facts ke liye hover · drag karke jamaayein · ▶₹ paise ka chalna · arrows + Enter"
      }
  });

  const LANGS = ['en', 'hi', 'hl'];
  let lang = 'hi';
  try { const saved = localStorage.getItem('jm-lang'); if (LANGS.indexOf(saved) !== -1) lang = saved; } catch (e) { /* storage unavailable */ }
  try {
    const fromUrl = new URLSearchParams(location.search).get('lang');
    if (LANGS.indexOf(fromUrl) !== -1) { lang = fromUrl; try { localStorage.setItem('jm-lang', fromUrl); } catch (e) { /* ignore */ } }
  } catch (e) { /* not in a browser */ }

  function t(key, params) {
    const entry = STR[key];
    let s = entry ? (entry[lang] || entry.en) : key;
    if (params) Object.keys(params).forEach(k => { s = s.split('{' + k + '}').join(params[k]); });
    return s;
  }
  function pick(obj) { return obj && typeof obj === 'object' ? (obj[lang] || obj.en) : obj; }
  function htmlLang() { return lang === 'hl' ? 'hi-Latn' : lang; }
  function jargon(key) { return JARGON[key] ? (JARGON[key][lang] || JARGON[key].en) : ''; }
  function getLang() { return lang; }
  function setLang(l) {
    if (LANGS.indexOf(l) === -1) return;
    lang = l;
    try { localStorage.setItem('jm-lang', l); } catch (e) { /* ignore */ }
    if (typeof document !== 'undefined') document.documentElement.lang = htmlLang();
  }
  function applyStatic(rootEl) {
    (rootEl || document).querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.getAttribute('data-i18n')); });
    (rootEl || document).querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.getAttribute('data-i18n-placeholder')); });
    (rootEl || document).querySelectorAll('[data-jargon]').forEach(el => { el.title = jargon(el.getAttribute('data-jargon')); el.tabIndex = 0; el.setAttribute('role', 'button'); });
  }

  root.JMI18N = { t, pick, jargon, getLang, setLang, applyStatic, htmlLang, LANGS, _STR: STR, _JARGON: JARGON };
  if (typeof module === 'object' && module.exports) module.exports = root.JMI18N;
})(typeof self !== 'undefined' ? self : this);
