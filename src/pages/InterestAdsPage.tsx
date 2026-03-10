import React from 'react';
import { Link } from 'react-router-dom';

const InterestAdsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Interest-Based Ads Notice</h1>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Are Interest-Based Ads?</h2>
              <p className="text-gray-700 mb-4">
                Interest-based advertising (also called targeted or personalized advertising) uses information about your online activities to show you advertisements that are more relevant to your interests.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Interest-Based Advertising</h2>
              <p className="text-gray-700 mb-4">
                RegionalMart and our advertising partners may use interest-based advertising to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Show you products that match your interests</li>
                <li>Display relevant promotional offers</li>
                <li>Recommend products based on your browsing history</li>
                <li>Customize your shopping experience</li>
                <li>Measure the effectiveness of our advertising campaigns</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect for Advertising</h2>
              <p className="text-gray-700 mb-4">
                To provide interest-based advertising, we may collect and use:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Pages you visit on our website</li>
                <li>Products you view or purchase</li>
                <li>Search terms you use</li>
                <li>Time spent on different pages</li>
                <li>Your general location (city/region level)</li>
                <li>Device and browser information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Advertising Partners</h2>
              <p className="text-gray-700 mb-4">
                We work with third-party advertising companies that may collect information about your online activities across different websites and apps. These partners include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Google Ads and Google Analytics</li>
                <li>Facebook and Instagram advertising</li>
                <li>Other advertising networks and platforms</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Choices and Controls</h2>
              <p className="text-gray-700 mb-4">
                You have several options to control interest-based advertising:
              </p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Browser Settings</h3>
                  <p className="text-gray-700">
                    You can adjust your browser settings to block or limit cookies and tracking technologies used for advertising.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Opt-Out Tools</h3>
                  <p className="text-gray-700 mb-2">
                    Use industry opt-out tools to limit interest-based advertising:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>Digital Advertising Alliance (DAA) opt-out page</li>
                    <li>Network Advertising Initiative (NAI) opt-out page</li>
                    <li>European Interactive Digital Advertising Alliance (EDAA) opt-out page</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Platform-Specific Controls</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>Google Ads Settings</li>
                    <li>Facebook Ad Preferences</li>
                    <li>Mobile device advertising settings (iOS/Android)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cross-Device Tracking</h2>
              <p className="text-gray-700 mb-4">
                We may link your activities across different devices (computer, mobile, tablet) to provide a consistent advertising experience. You can limit this by:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Using different browsers or private/incognito mode</li>
                <li>Signing out of your accounts when not in use</li>
                <li>Adjusting device-level advertising settings</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain advertising-related data for as long as necessary to provide our services and comply with legal obligations. You can request deletion of your data by contacting us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Notice</h2>
              <p className="text-gray-700 mb-4">
                We may update this Interest-Based Ads Notice periodically. We will notify you of any material changes by posting the updated notice on our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about our interest-based advertising practices, please contact us:
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

export default InterestAdsPage;