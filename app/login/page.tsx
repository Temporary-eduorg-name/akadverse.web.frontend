'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Book, Sun, Moon } from 'lucide-react';
import { PasswordInput } from '../components/password-input';

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeRole, setActiveRole] = useState<'student' | 'faculty' | 'admin'>('student');

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('login-theme');

    if (savedTheme === 'light') {
      setIsDarkMode(false);
      return;
    }

    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      return;
    }

    setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('login-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const roleOptions = [
    { id: 'student' as const, label: 'Student', path: '/studashboard' },
    { id: 'faculty' as const, label: 'Faculty', path: '/staffdashboard' },
    { id: 'admin' as const, label: 'Admin', path: '/admindashboard' },
  ];

  const activeRoleIndex = roleOptions.findIndex((role) => role.id === activeRole);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/marketplace/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Login failed. Please try again.');
        return;
      }

      const selected = roleOptions.find((role) => role.id === activeRole);
      router.push(selected?.path ?? '/studashboard');
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen font-sans relative overflow-hidden transition-colors ${isDarkMode ? 'bg-black' : 'bg-gray-100'}`}>
      <button
        type="button"
        onClick={() => setIsDarkMode((prev) => !prev)}
        className={`absolute top-6 right-6 z-30 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition ${
          isDarkMode
            ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50'
        }`}
      >
        {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </button>

      {/* Left Side - Black Section */}
      <div
        className={`w-full lg:w-[52%] flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 relative z-10 min-h-screen transition-colors ${
          isDarkMode ? 'bg-black' : 'bg-gray-100'
        }`}
      >
        <div className="max-w-[430px] w-full -ml-auto -mt-20">
          {/* Header */}
          <div className="mb-12 text-left">
            <h1 className={`text-5xl sm:text-4xl font-bold mb-3 leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Welcome to AkadVerse
            </h1>
            <p className={`text-base ${isDarkMode ? 'text-[#9CA3AF]' : 'text-gray-600'}`}>
              Sign in to access your academic workspace.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5 mb-12">
            {/* Email Input */}
            <div className="relative">
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-[#737373]' : 'text-gray-500'}`} size={20} />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full pl-12 pr-3 py-3 border rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm ${
                  isDarkMode
                    ? 'bg-[#171717] border-[#262626] text-white placeholder-[#737373]'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Password Input */}
            <div>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                isDarkMode={isDarkMode}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className={`text-sm p-3 rounded-lg ${isDarkMode ? 'text-red-400 bg-red-900/20' : 'text-red-700 bg-red-100'}`}>
                {error}
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? 'Signing in...' : 'Log In'}
            </button>

            <p className={`text-sm text-center ${isDarkMode ? 'text-[#9CA3AF]' : 'text-gray-600'}`}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Sign up
              </Link>
            </p>
          </form>

          {/* Role Section */}
          <div className={`border rounded-2xl p-6 ${isDarkMode ? 'bg-[#171717] border-[#262626]' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-xs font-semibold uppercase tracking-widest mb-6 ${isDarkMode ? 'text-[#737373]' : 'text-gray-500'}`}>
              Choose View Role
            </h3>
            <div className={`relative grid grid-cols-3 rounded-xl p-1 ${isDarkMode ? 'bg-[#0f0f0f]' : 'bg-gray-100'}`}>
              <span
                className={`absolute top-1 bottom-1 w-[calc((100%-0.5rem)/3)] rounded-lg transition-transform duration-300 ease-out ${
                  isDarkMode ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-white border border-blue-100 shadow-sm'
                }`}
                style={{ transform: `translateX(calc(${activeRoleIndex} * 100%))` }}
              />
              {roleOptions.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setActiveRole(role.id)}
                  className={`relative z-10 py-2 text-sm font-semibold transition-colors ${
                    activeRole === role.id
                      ? isDarkMode
                        ? 'text-white'
                        : 'text-blue-700'
                      : isDarkMode
                        ? 'text-[#8a8a8a] hover:text-[#c8c8c8]'
                        : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
            <p className={`mt-4 text-xs ${isDarkMode ? 'text-[#8a8a8a]' : 'text-gray-500'}`}>
              Your selected role decides which dashboard opens immediately after login.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image Background Section */}
      <div
        className="hidden lg:flex absolute top-0 bottom-0 right-0 w-[56%] rounded-l-[32px] shadow-2xl z-20 border border-white/20 overflow-hidden"
        style={{
          backgroundImage: "url('/login-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-black/25' : 'bg-white/10'}`} />
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-8 shadow-2xl">
            <Book size={60} style={{ color: '#0084D1' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

