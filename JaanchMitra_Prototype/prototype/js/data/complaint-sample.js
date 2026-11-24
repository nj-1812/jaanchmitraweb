/* Embedded copy of samples/complaint_sample.csv (fictional) so "Try the sample" works offline and from file://. A test keeps them identical. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.JM_COMPLAINT_SAMPLE = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  return { name: 'complaint_sample.csv', text: "Field,Value\nNCRP Acknowledgement No,31411260012345\nComplaint Date,21-11-2026 12:05\nComplainant Name,Demo Complainant\nMobile,+91 90000 00099\nType of Fraud,Investment\nTransaction Date,21/11/2026 10:24:31\nAmount,\"₹4,50,000\"\nUTR No,632510241531\nBank,Bank A\nAccount No,000012341284\nIFSC,BNKA0000123\nPaid To,GrowthPay@BankB\nWebsite,https://invest-growth.example/plans\nSuspect Phone,+91 90000 00001\nPolice Station,Cyber Police Station Jaipur (demo)\nDescription,\"Saw an advert promising 30% monthly returns. Joined a chat group, opened an account on the website and paid ₹4,50,000 by UPI. Could not withdraw; the group was deleted. (Fictional sample.)\"\n" };
});
