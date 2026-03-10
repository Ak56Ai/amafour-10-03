import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

// Layout
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

// Auth
import SignInForm from './components/Auth/SignInForm';
import SignUpForm from './components/Auth/SignUpForm';
import ProtectedRoute from './components/ProtectedRoute';

// Account
import AccountDashboard from './components/Account/AccountDashboard';
import AddressManagement from './components/Account/AddressManagement';
import PaymentMethods from './components/Account/PaymentMethods';
import AccountSettings from './components/Account/AccountSettings';
import Wishlist from './components/Account/Wishlist';
import BrowsingHistory from './components/Account/BrowsingHistory';
import Recommendations from './components/Account/Recommendations';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import SearchPage from './pages/SearchPage';

// Footer Pages
import ConditionsPage from './pages/ConditionsPage';
import PrivacyPage from './pages/PrivacyPage';
import CookiesPage from './pages/CookiesPage';
import InterestAdsPage from './pages/InterestAdsPage';
import HelpPage from './pages/HelpPage';
import ContactPage from './pages/ContactPage';

// Placeholder components
import OrdersPage from './components/Account/OrdersPage';


function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/signin" element={<SignInForm />} />
                <Route path="/signup" element={<SignUpForm />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/category/:category" element={<ProductListPage />} />
                <Route path="/product/:slug" element={<ProductDetailPage />} />
                
                {/* Footer Pages */}
                <Route path="/conditions" element={<ConditionsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/cookies" element={<CookiesPage />} />
                <Route path="/interest-ads" element={<InterestAdsPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Protected routes */}
                <Route
                  path="/account"
                  element={
                    <ProtectedRoute>
                      <AccountDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/addresses"
                  element={
                    <ProtectedRoute>
                      <AddressManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/payment-methods"
                  element={
                    <ProtectedRoute>
                      <PaymentMethods />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/profile"
                  element={
                    <ProtectedRoute>
                      <AccountSettings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wishlist"
                  element={
                    <ProtectedRoute>
                      <Wishlist />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/browsing-history"
                  element={
                    <ProtectedRoute>
                      <BrowsingHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recommendations"
                  element={
                    <ProtectedRoute>
                      <Recommendations />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;