import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Back to Top */}
      <div
        className="bg-gray-700 py-4 text-center cursor-pointer hover:bg-gray-600 transition-colors"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <span className="text-sm">Back to top</span>
      </div>

      {/* Main Footer */}
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Get to Know Us */}
            <div>
              <h3 className="font-bold text-lg mb-4">Get to Know Us</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link to="/about" className="hover:underline">About RegionalMart</Link></li>
                <li><Link to="/careers" className="hover:underline">Careers</Link></li>
                <li><Link to="/press" className="hover:underline">Press Releases</Link></li>
                <li><Link to="/sustainability" className="hover:underline">RegionalMart Science</Link></li>
              </ul>
            </div>

            {/* Make Money with Us */}
            <div>
              <h3 className="font-bold text-lg mb-4">Make Money with Us</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link to="/sell" className="hover:underline">Sell on RegionalMart</Link></li>
                <li><Link to="/affiliate" className="hover:underline">Become an Affiliate</Link></li>
                <li><Link to="/advertise" className="hover:underline">Advertise Your Products</Link></li>
                <li><Link to="/fulfillment" className="hover:underline">RegionalMart Pay</Link></li>
              </ul>
            </div>

            {/* RegionalMart Payment */}
            <div>
              <h3 className="font-bold text-lg mb-4">RegionalMart Payment</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link to="/payment" className="hover:underline">Your Account</Link></li>
                <li><Link to="/returns" className="hover:underline">Your Orders</Link></li>
                <li><Link to="/shipping" className="hover:underline">Shipping Rates & Policies</Link></li>
                <li><Link to="/returns-policy" className="hover:underline">Returns & Replacements</Link></li>
              </ul>
            </div>

            {/* Let Us Help You */}
            <div>
              <h3 className="font-bold text-lg mb-4">Let Us Help You</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link to="/help" className="hover:underline">Help Center</Link></li>
                <li><Link to="/covid" className="hover:underline">COVID-19 and RegionalMart</Link></li>
                <li><Link to="/your-orders" className="hover:underline">Your Orders</Link></li>
                <li><Link to="/manage-content" className="hover:underline">Manage Your Content</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-700 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="text-2xl font-bold text-orange-400">RegionalMart</div>
              <div className="flex flex-wrap gap-2">
                <select className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm">
                  <option>🌍 English</option>
                  <option>🇮🇳 हिंदी</option>
                </select>
                <select className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm">
                  <option>₹ INR - Indian Rupee</option>
                  <option>$ USD - US Dollar</option>
                </select>
                <select className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm">
                  <option>🇮🇳 India</option>
                </select>
              </div>
            </div>
            
            {/* Social Media Links */}
            <div className="flex gap-4">
              <a
                href={import.meta.env.VITE_FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href={import.meta.env.VITE_TWITTER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a
                href={import.meta.env.VITE_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323C6.001 8.198 7.152 7.708 8.449 7.708s2.448.49 3.323 1.416c.875.875 1.365 2.026 1.365 3.323s-.49 2.448-1.365 3.323c-.875.807-2.026 1.218-3.323 1.218zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.875-.875-1.365-2.026-1.365-3.323s.49-2.448 1.365-3.323c.875-.926 2.026-1.416 3.323-1.416s2.448.49 3.323 1.416c.875.875 1.365 2.026 1.365 3.323s-.49 2.448-1.365 3.323z"/>
                </svg>
              </a>
              <a
                href={import.meta.env.VITE_LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-4">
              <Link to="/conditions" className="hover:underline">Conditions of Use & Sale</Link>
              <Link to="/privacy" className="hover:underline">Privacy Notice</Link>
              <Link to="/cookies" className="hover:underline">Cookies Notice</Link>
              <Link to="/interest-ads" className="hover:underline">Interest-Based Ads</Link>
              <Link to="/help" className="hover:underline">Help Center</Link>
              <Link to="/contact" className="hover:underline">Contact Us</Link>
            </div>
            <p>&copy; 2024-2026, RegionalMart.com, Inc. or its affiliates</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;