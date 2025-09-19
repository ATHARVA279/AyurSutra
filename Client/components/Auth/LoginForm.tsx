import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'patient'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password, formData.role);
      } else {
        result = await signup(formData);
      }

      if (!result.success) {
        setError(result.error || 'Authentication failed');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const fillDemoCredentials = (role: 'patient' | 'practitioner') => {
    if (role === 'patient') {
      setFormData({
        email: 'priya.patel@email.com',
        password: 'password123',
        role: 'patient'
      });
    } else {
      setFormData({
        email: 'dr.sharma@ayursutra.com',
        password: 'password123',
        role: 'practitioner'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <span className="h-12 w-12 text-emerald-600 text-5xl">🏥</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            AyurSutra
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Panchakarma Patient Management System
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm pr-10"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <span className="h-4 w-4 text-gray-400">🙈</span>
                ) : (
                  <span className="h-4 w-4 text-gray-400">👁️</span>
                )}
              </button>
            </div>
            <div>
              <label htmlFor="role" className="sr-only">Role</label>
              <select
                id="role"
                name="role"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="patient">Patient</option>
                <option value="practitioner">Practitioner</option>
              </select>
            </div>
          </div>

          {!isLogin && formData.role === 'patient' && (
            <div>
              <input
                name="phone"
                type="tel"
                placeholder="Phone Number"
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                onChange={handleInputChange}
              />
            </div>
          )}

          {!isLogin && formData.role === 'practitioner' && (
            <div>
              <input
                name="specialization"
                type="text"
                placeholder="Specialization"
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                onChange={handleInputChange}
              />
            </div>
          )}

          {!isLogin && (
            <div>
              <input
                name="name"
                type="text"
                placeholder="Full Name"
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                onChange={handleInputChange}
              />
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign in' : 'Sign up')}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-emerald-600 hover:text-emerald-500 text-sm"
            >
              {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
            </button>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 text-center mb-2">Demo Credentials:</p>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => fillDemoCredentials('patient')}
                className="flex-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Patient Demo
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('practitioner')}
                className="flex-1 px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                Practitioner Demo
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;