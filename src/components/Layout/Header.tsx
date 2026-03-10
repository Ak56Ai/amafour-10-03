import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };
  return (
    <header className="bg-gray-900 text-white">
      {/* Top Bar */}
      <div className="bg-gray-800 py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>Deliver to India</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/customer-service" className="hover:text-orange-400 transition-colors">
              Customer Service
            </Link>
            <Link to="/registry" className="hover:text-orange-400 transition-colors">
              Registry
            </Link>
            <Link to="/sell" className="hover:text-orange-400 transition-colors">
              Sell
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="py-4 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <div className="text-2xl font-bold text-orange-400">
              RegionalMart
            </div>
            <div className="text-xs text-gray-300">.in</div>
          </Link>

          {/* Location */}
          <div className="hidden lg:flex items-center text-sm">
            <div className="text-gray-300">
              <div className="text-xs">Delivering to</div>
              <div className="font-bold">Mumbai 400001</div>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-2xl mx-4">
            <form onSubmit={handleSearch} className="relative">
              <select className="absolute left-0 top-0 h-full bg-gray-100 text-gray-900 px-3 rounded-l-md border-0 focus:outline-none">
                <option>All</option>
                <option>Oils</option>
                <option>Spices</option>
                <option>Grains</option>
              </select>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search RegionalMart.in"
                className="w-full pl-20 pr-12 py-3 rounded-md border-0 focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
              />
              <button 
                type="submit"
                className="absolute right-0 top-0 h-full px-4 bg-orange-500 rounded-r-md hover:bg-orange-600 transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>

          {/* Language */}
          <div className="hidden md:block">
            <select className="bg-transparent border border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="en">EN</option>
              <option value="hi">HI</option>
            </select>
          </div>

          {/* Account & Lists */}
          <div className="relative">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex flex-col items-start text-sm hover:text-orange-400 transition-colors"
                >
                  <span className="text-xs text-gray-300">Hello, User</span>
                  <span className="font-bold flex items-center gap-1">
                    Account & Lists
                    <User className="h-4 w-4" />
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white text-gray-900 rounded-md shadow-lg border z-50">
                    <div className="p-4 border-b">
                      <div className="text-sm font-semibold">Your Account</div>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/account"
                        className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Your Account
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Your Orders
                      </Link>
                      <Link
                        to="/addresses"
                        className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Your Addresses
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/signin" className="flex flex-col items-start text-sm hover:text-orange-400 transition-colors">
                <span className="text-xs text-gray-300">Hello, sign in</span>
                <span className="font-bold">Account & Lists</span>
              </Link>
            )}
          </div>

          {/* Returns & Orders */}
          <Link to="/orders" className="hidden md:flex flex-col items-start text-sm hover:text-orange-400 transition-colors">
            <span className="text-xs text-gray-300">Returns</span>
            <span className="font-bold">& Orders</span>
          </Link>

          {/* Cart */}
          <Link to="/cart" className="flex items-center gap-2 hover:text-orange-400 transition-colors relative">
            <div className="relative">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </div>
            <span className="hidden lg:block font-bold">Cart</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-800 py-2 px-4">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-6 text-sm">
            <Link to="/category/all" className="hover:text-orange-400 transition-colors flex items-center gap-1">
              <Menu className="h-4 w-4" />
              All Categories
            </Link>
            <Link to="/category/cold-pressed-oils" className="hover:text-orange-400 transition-colors">Premium Oils</Link>
            <Link to="/category/organic-spices" className="hover:text-orange-400 transition-colors">Organic Spices</Link>
            <Link to="/category/heritage-grains" className="hover:text-orange-400 transition-colors">Heritage Grains</Link>
            <Link to="/category/wild-honey" className="hover:text-orange-400 transition-colors">Wild Honey</Link>
            <Link to="/deals" className="hover:text-orange-400 transition-colors">Today's Deals</Link>
            <Link to="/fresh" className="hover:text-orange-400 transition-colors">Fresh</Link>
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="py-4 px-4 space-y-3">
            <Link to="/category/cold-pressed-oils" className="block hover:text-orange-400 transition-colors">Premium Oils</Link>
            <Link to="/category/organic-spices" className="block hover:text-orange-400 transition-colors">Organic Spices</Link>
            <Link to="/category/heritage-grains" className="block hover:text-orange-400 transition-colors">Heritage Grains</Link>
            <Link to="/orders" className="block hover:text-orange-400 transition-colors">Your Orders</Link>
            <Link to="/customer-service" className="block hover:text-orange-400 transition-colors">Customer Service</Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;