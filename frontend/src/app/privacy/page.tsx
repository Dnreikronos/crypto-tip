import Link from "next/link";

export default function PrivacyPage() {
  const lastUpdated = "January 2024";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 lg:p-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-400 text-lg">Last updated: {lastUpdated}</p>
          </div>

          <div className="prose prose-invert prose-lg max-w-none">
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  1. Introduction
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Welcome to CryptoTip (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or
                  &ldquo;us&rdquo;). We are committed to protecting your
                  personal information and your right to privacy. This Privacy
                  Policy explains how we collect, use, and share information
                  about you when you use our cryptocurrency donation platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  2. Information We Collect
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-medium text-cyan-400 mb-2">
                      Personal Information
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      We may collect personal information that you provide
                      directly to us, including:
                    </p>
                    <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
                      <li>Email address</li>
                      <li>Username or display name</li>
                      <li>Profile information and bio</li>
                      <li>Cryptocurrency wallet addresses</li>
                      <li>Communication preferences</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-cyan-400 mb-2">
                      Transaction Information
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      We collect information about cryptocurrency transactions
                      made through our platform, including transaction amounts,
                      wallet addresses, and transaction timestamps. Note that
                      blockchain transactions are public by nature.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-cyan-400 mb-2">
                      Technical Information
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      We automatically collect certain technical information
                      when you use our platform, including IP address, browser
                      type, device information, and usage patterns.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  3. How We Use Your Information
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>
                    Provide and maintain our cryptocurrency donation services
                  </li>
                  <li>Process and facilitate donations and transactions</li>
                  <li>Authenticate users and prevent fraud</li>
                  <li>Send you service-related communications</li>
                  <li>Improve our platform and develop new features</li>
                  <li>Comply with legal obligations and enforce our terms</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  4. Information Sharing
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We do not sell, trade, or rent your personal information to
                  third parties. We may share your information in the following
                  circumstances:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>With your explicit consent</li>
                  <li>To comply with legal obligations or court orders</li>
                  <li>To protect our rights, property, or safety</li>
                  <li>
                    With service providers who assist in operating our platform
                  </li>
                  <li>In connection with a business transfer or merger</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  5. Blockchain Transparency
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Please note that cryptocurrency transactions are recorded on
                  public blockchains. While we do not publish your personal
                  information, transaction details including wallet addresses
                  and amounts may be publicly visible on the respective
                  blockchain networks.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  6. Data Security
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  We implement appropriate technical and organizational security
                  measures to protect your personal information against
                  unauthorized access, alteration, disclosure, or destruction.
                  However, no method of transmission over the internet is 100%
                  secure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  7. Your Rights
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Depending on your location, you may have certain rights
                  regarding your personal information, including:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>Access to your personal information</li>
                  <li>Correction of inaccurate information</li>
                  <li>Deletion of your personal information</li>
                  <li>Portability of your data</li>
                  <li>Objection to processing</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  8. Cookies and Tracking
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  We use cookies and similar tracking technologies to improve
                  your experience on our platform. You can manage your cookie
                  preferences through your browser settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  9. Third-Party Services
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Our platform may integrate with third-party services such as
                  cryptocurrency wallets and blockchain networks. This Privacy
                  Policy does not apply to third-party services, and we
                  encourage you to review their privacy policies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  10. Children&rsquo;s Privacy
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Our services are not intended for individuals under the age of
                  18. We do not knowingly collect personal information from
                  children under 18.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  11. International Users
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  If you are accessing our platform from outside the United
                  States, please be aware that your information may be
                  transferred to, stored, and processed in the United States
                  where our servers are located.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  12. Changes to This Policy
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will
                  notify you of any material changes by posting the new Privacy
                  Policy on this page and updating the &ldquo;Last
                  updated&rdquo; date.
                </p>
              </section>

              {/* <section>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  13. Contact Us
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <p className="text-gray-300">
                    <strong>Email:</strong> privacy@cryptotip.com<br/>
                    <strong>Address:</strong> [Your Company Address]
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
