import React from 'react';
import { Link } from 'react-router-dom';

const ConditionsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Conditions of Use & Sale</h1>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                Welcome to RegionalMart. These Conditions of Use & Sale ("Conditions") govern your use of our website and services. By accessing or using our services, you agree to be bound by these Conditions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Product Information</h2>
              <p className="text-gray-700 mb-4">
                We strive to provide accurate product information, including descriptions, prices, and availability. However, we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Pricing and Payment</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>All prices are listed in Indian Rupees (INR) and include applicable taxes</li>
                <li>Prices are subject to change without notice</li>
                <li>Payment must be made at the time of purchase</li>
                <li>We accept various payment methods including credit cards, debit cards, UPI, and cash on delivery</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Shipping and Delivery</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>We ship to addresses within India</li>
                <li>Delivery times are estimates and may vary based on location and product availability</li>
                <li>Free shipping is available on orders above ₹500</li>
                <li>Risk of loss and title for items pass to you upon delivery</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Returns and Refunds</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Items may be returned within 7 days of delivery</li>
                <li>Items must be in original condition and packaging</li>
                <li>Perishable items cannot be returned</li>
                <li>Refunds will be processed within 5-7 business days</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. User Accounts</h2>
              <p className="text-gray-700 mb-4">
                You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibent text-gray-900 mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                RegionalMart shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Conditions, please contact us at:
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

export default ConditionsPage;