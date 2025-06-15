import Link from "next/link";

export default function TermsPage() {
  const lastUpdated = "January 2024";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 lg:p-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-gray-400 text-lg">Last updated: {lastUpdated}</p>
          </div>

          <div className="prose prose-invert prose-lg max-w-none">
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  1. Acceptance of Terms
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  By accessing or using CryptoTip (&ldquo;the Service&rdquo;),
                  you agree to be bound by these Terms of Service
                  (&ldquo;Terms&rdquo;). If you do not agree to these Terms,
                  please do not use our Service. These Terms apply to all users
                  of the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  2. Description of Service
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  CryptoTip is a cryptocurrency donation platform that allows
                  users to receive and send cryptocurrency donations. Our
                  Service facilitates the creation of donation pages, processing
                  of cryptocurrency transactions, and management of donation
                  campaigns.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  3. User Accounts
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-medium text-cyan-400 mb-2">
                      Account Creation
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      To use certain features of our Service, you must create an
                      account. You are responsible for maintaining the
                      confidentiality of your account credentials and for all
                      activities that occur under your account.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-cyan-400 mb-2">
                      Account Requirements
                    </h3>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      <li>You must be at least 18 years old</li>
                      <li>
                        You must provide accurate and complete information
                      </li>
                      <li>
                        You must comply with all applicable laws and regulations
                      </li>
                      <li>
                        You must not use the Service for illegal or unauthorized
                        purposes
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  4. Cryptocurrency Transactions
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-medium text-cyan-400 mb-2">
                      Transaction Processing
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      All cryptocurrency transactions are processed on their
                      respective blockchain networks. We do not control these
                      networks and are not responsible for transaction delays,
                      failures, or network fees.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-cyan-400 mb-2">
                      Transaction Finality
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      Cryptocurrency transactions are generally irreversible.
                      Once a transaction is confirmed on the blockchain, it
                      cannot be undone. Please verify all transaction details
                      before confirming.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-cyan-400 mb-2">
                      Fees
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      We may charge platform fees for certain services. All fees
                      will be clearly disclosed before you complete a
                      transaction. Network fees charged by blockchain networks
                      are separate from our platform fees.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  5. Prohibited Uses
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  You agree not to use the Service for any unlawful or
                  prohibited purposes, including but not limited to:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>Money laundering or other financial crimes</li>
                  <li>Terrorism financing or other illegal activities</li>
                  <li>Fraud, scams, or deceptive practices</li>
                  <li>Violation of any applicable laws or regulations</li>
                  <li>Infringement of intellectual property rights</li>
                  <li>Harassment, abuse, or harmful content</li>
                  <li>Malicious software or security vulnerabilities</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  6. Content and Intellectual Property
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-medium text-cyan-400 mb-2">
                      User Content
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      You retain ownership of any content you submit to the
                      Service. However, by submitting content, you grant us a
                      non-exclusive license to use, display, and distribute your
                      content in connection with the Service.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-cyan-400 mb-2">
                      Our Intellectual Property
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      The Service and its original content, features, and
                      functionality are owned by CryptoTip and are protected by
                      copyright, trademark, and other intellectual property
                      laws.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  7. Privacy and Data Protection
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Your privacy is important to us. Please review our Privacy
                  Policy, which explains how we collect, use, and protect your
                  information when you use the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  8. Disclaimers and Limitations
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-medium text-cyan-400 mb-2">
                      Service Availability
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      We do not guarantee that the Service will be available at
                      all times. The Service may be subject to maintenance,
                      updates, or technical issues that may cause temporary
                      unavailability.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-cyan-400 mb-2">
                      Cryptocurrency Risks
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      Cryptocurrency transactions involve inherent risks,
                      including but not limited to price volatility, technical
                      failures, and regulatory changes. You acknowledge and
                      accept these risks.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-cyan-400 mb-2">
                      Limitation of Liability
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      To the maximum extent permitted by law, CryptoTip shall
                      not be liable for any indirect, incidental, special, or
                      consequential damages arising from your use of the
                      Service.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  9. Indemnification
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  You agree to indemnify and hold harmless CryptoTip and its
                  affiliates from any claims, damages, or expenses arising from
                  your use of the Service or violation of these Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  10. Termination
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  We may terminate or suspend your account and access to the
                  Service at our sole discretion, without prior notice, for any
                  reason, including if you breach these Terms. Upon termination,
                  your right to use the Service will cease immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  11. Compliance and Legal Requirements
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-medium text-cyan-400 mb-2">
                      Regulatory Compliance
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      You are responsible for complying with all applicable laws
                      and regulations in your jurisdiction, including but not
                      limited to tax obligations, anti-money laundering laws,
                      and securities regulations.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-cyan-400 mb-2">
                      Tax Obligations
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      You are solely responsible for determining and fulfilling
                      your tax obligations related to cryptocurrency
                      transactions conducted through the Service.
                    </p>
                  </div>
                </div>
              </section>

              {/* <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  12. Governing Law and Disputes
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction]. Any disputes arising from these Terms or your use of the Service shall be resolved through binding arbitration.
                </p>
              </section> */}

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  12. Changes to Terms
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  We reserve the right to modify these Terms at any time. We
                  will notify you of any material changes by posting the new
                  Terms on this page and updating the &ldquo;Last updated&rdquo;
                  date. Your continued use of the Service after such changes
                  constitutes acceptance of the new Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  13. Severability
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  If any provision of these Terms is held to be invalid or
                  unenforceable, the remaining provisions shall remain in full
                  force and effect.
                </p>
              </section>

              {/* <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  15. Contact Information
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <p className="text-gray-300">
                    <strong>Email:</strong> legal@cryptotip.com<br/>
                    <strong>Address:</strong> [Your Company Address]<br/>
                    <strong>Phone:</strong> [Your Phone Number]
                  </p>
                </div>
              </section> */}
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
