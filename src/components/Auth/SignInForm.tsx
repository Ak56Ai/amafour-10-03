import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const SignInForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await signIn(formData.email, formData.password);
      if (error || !data.user) {
        setError(error?.message || 'Invalid login credentials');
      } else {
        navigate('/account');
      }
    } catch (err: any) {
      setError('Unable to connect to authentication service. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <div className="text-3xl font-bold text-gray-900">RegionalMart</div>
            <div className="text-orange-600 text-sm">.in</div>
          </Link>
        </div>

        {/* Sign In Form */}
        <div className="border border-gray-300 rounded-lg p-6">
          <h1 className="text-2xl font-normal mb-6">Sign in</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">
                Email or mobile phone number
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md font-normal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-xs text-gray-600">
            By signing in, you agree to RegionalMart's{' '}
            <Link to="/conditions" className="text-blue-600 hover:underline">
              Conditions of Use & Sale
            </Link>
            . Please see our{' '}
            <Link to="/privacy" className="text-blue-600 hover:underline">
              Privacy Notice
            </Link>
            , our{' '}
            <Link to="/cookies" className="text-blue-600 hover:underline">
              Cookies Notice
            </Link>{' '}
            and our{' '}
            <Link to="/interest-ads" className="text-blue-600 hover:underline">
              Interest-Based Ads Notice
            </Link>
            .
          </div>

          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot your password?
            </Link>
          </div>
        </div>

        {/* Create Account */}
        <div className="mt-6 text-center">
          <div className="text-xs text-gray-600 mb-4">New to RegionalMart?</div>
          <Link
            to="/signup"
            className="w-full inline-block bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 px-4 rounded-md border border-gray-300 font-normal transition-colors text-center"
          >
            Create your RegionalMart account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;