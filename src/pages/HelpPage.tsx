import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, ChevronRight, MessageCircle, Phone, Mail, Clock } from 'lucide-react';

const HelpPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "How do I place an order?",
      answer: "To place an order, browse our products, add items to your cart, and proceed to checkout. You'll need to create an account and provide shipping information."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept credit cards, debit cards, UPI, net banking, and cash on delivery (COD) for eligible orders."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping typically takes 3-7 business days. Express shipping options are available for faster delivery."
    },
    {
      question: "Can I return or exchange products?",
      answer: "Yes, you can return most items within 7 days of delivery. Items must be in original condition and packaging."
    },
    {
      question: "How do I track my order?",
      answer: "Once your order ships, you'll receive a tracking number via email. You can also track orders in your account dashboard."
    },
    {
      question: "Do you offer free shipping?",
      answer: "Yes, we offer free shipping on orders above ₹500. Standard shipping charges apply for orders below this amount."
    },
    {
      question: "Are your products authentic?",
      answer: "Yes, all our products are sourced directly from verified farmers and producers. We guarantee authenticity and quality."
    },
    {
      question: "How do I cancel my order?",
      answer: "You can cancel your order within 1 hour of placing it by contacting our customer support or through your account dashboard."
    }
  ];

  const categories = [
    {
      title: "Orders & Shipping",
      topics: ["Track your order", "Shipping information", "Order cancellation", "Delivery issues"]
    },
    {
      title: "Returns & Refunds",
      topics: ["Return policy", "How to return items", "Refund process", "Exchange policy"]
    },
    {
      title: "Account & Payment",
      topics: ["Account settings", "Payment methods", "Billing issues", "Password reset"]
    },
    {
      title: "Products & Quality",
      topics: ["Product authenticity", "Quality assurance", "Product information", "Sourcing details"]
    }
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 mb-8">How can we help you today?</p>
          
          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help topics..."
              className="w-full px-6 py-4 pl-12 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Quick Help Categories */}
            <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Browse by Category</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((category, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6 hover:border-orange-300 transition-colors">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{category.title}</h3>
                    <ul className="space-y-2">
                      {category.topics.map((topic, topicIndex) => (
                        <li key={topicIndex}>
                          <Link to="#" className="text-orange-600 hover:text-orange-700 text-sm">
                            {topic}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      {expandedFaq === index ? (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                    {expandedFaq === index && (
                      <div className="px-6 pb-4">
                        <p className="text-gray-700">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Support */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Support</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium text-gray-900">Live Chat</p>
                    <p className="text-sm text-gray-600">Available 24/7</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium text-gray-900">{import.meta.env.VITE_SUPPORT_PHONE}</p>
                    <p className="text-sm text-gray-600">{import.meta.env.VITE_SUPPORT_HOURS}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium text-gray-900">{import.meta.env.VITE_SUPPORT_EMAIL}</p>
                    <p className="text-sm text-gray-600">We'll respond within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-3">
                <Link to="/orders" className="block text-orange-600 hover:text-orange-700">
                  Track Your Order
                </Link>
                <Link to="/account" className="block text-orange-600 hover:text-orange-700">
                  Manage Account
                </Link>
                <Link to="/addresses" className="block text-orange-600 hover:text-orange-700">
                  Shipping Addresses
                </Link>
                <Link to="/conditions" className="block text-orange-600 hover:text-orange-700">
                  Terms & Conditions
                </Link>
                <Link to="/privacy" className="block text-orange-600 hover:text-orange-700">
                  Privacy Policy
                </Link>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-orange-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-gray-900">Support Hours</h3>
              </div>
              <p className="text-gray-700">{import.meta.env.VITE_SUPPORT_HOURS}</p>
              <p className="text-sm text-gray-600 mt-2">
                We're here to help with any questions or concerns you may have.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;