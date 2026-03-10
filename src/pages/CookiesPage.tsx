import React from 'react';
import { Link } from 'react-router-dom';

const CookiesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookies Notice</h1>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Are Cookies?</h2>
              <p className="text-gray-700 mb-4">
                Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Types of Cookies We Use</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Essential Cookies</h3>
                  <p className="text-gray-700">
                    These cookies are necessary for the website to function properly. They enable basic functions like page navigation, access to secure areas, and shopping cart functionality.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Cookies</h3>
                  <p className="text-gray-700">
                    These cookies collect information about how visitors use our website, such as which pages are visited most often. This data helps us improve our website's performance.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Functionality Cookies</h3>
                  <p className="text-gray-700">
                    These cookies allow the website to remember choices you make and provide enhanced, more personal features. They may be set by us or by third-party providers.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Targeting Cookies</h3>
                  <p className="text-gray-700">
                    These cookies are used to deliver advertisements more relevant to you and your interests. They also help limit the number of times you see an advertisement.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Cookies</h2>
              <p className="text-gray-700 mb-4">
                We may use third-party services that place cookies on your device. These include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Google Analytics for website analytics</li>
                <li>Payment processors for secure transactions</li>
                <li>Social media platforms for sharing functionality</li>
                <li>Advertising networks for targeted advertisements</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Managing Cookies</h2>
              <p className="text-gray-700 mb-4">
                You can control and manage cookies in various ways:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Browser settings: Most browsers allow you to refuse or accept cookies</li>
                <li>Cookie preferences: Use our cookie preference center (if available)</li>
                <li>Third-party opt-out: Visit third-party websites to opt-out of their cookies</li>
                <li>Clear existing cookies: Delete cookies already stored on your device</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Please note that disabling certain cookies may affect the functionality of our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookie Retention</h2>
              <p className="text-gray-700 mb-4">
                Cookies are retained for different periods depending on their purpose:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Session cookies: Deleted when you close your browser</li>
                <li>Persistent cookies: Remain until they expire or you delete them</li>
                <li>Third-party cookies: Controlled by the respective third parties</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Updates to This Notice</h2>
              <p className="text-gray-700 mb-4">
                We may update this Cookies Notice from time to time. Any changes will be posted on this page with an updated revision date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about our use of cookies, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">Email: {import.meta.env.VITE_SUPPORT_EMAIL}</p>
                <p className="text-gray-700">Phone: {import.meta.env.VITE_SUPPORT_PHONE}</p>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <Link to="/" className="text-orange-600 hover:text-orange-700 font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiesPage;