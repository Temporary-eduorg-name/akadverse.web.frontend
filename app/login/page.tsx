'use client';

import { useEffect, useState } from 'react';
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

  const demoCredentials = [
    { role: 'Student', email: 'student@example.com', password: 'student' },
    { role: 'Faculty', email: 'faculty@example.com', password: 'faculty' },
    { role: 'Admin', email: 'admin@example.com', password: 'admin' },
  ];

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Add your login API call here
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });

      // Mock login for now
      console.log('Login attempt:', { email, password });
      
      // Redirect based on role (this is a placeholder)
      if (email.includes('admin')) {
        router.push('/admindashboard');
      } else if (email.includes('faculty')) {
        router.push('/staffdashboard');
      } else {
        router.push('/studashboard');
      }
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
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Access Section */}
          <div className={`border rounded-2xl p-6 ${isDarkMode ? 'bg-[#171717] border-[#262626]' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-xs font-semibold uppercase tracking-widest mb-6 ${isDarkMode ? 'text-[#737373]' : 'text-gray-500'}`}>
              Demo Access
            </h3>
            <div className="space-y-4">
              {demoCredentials.map((demo) => (
                <button
                  key={demo.role}
                  onClick={() => handleDemoLogin(demo.email, demo.password)}
                  className="w-full flex justify-between items-center text-left group hover:opacity-100 transition"
                >
                  <span
                    className={`font-medium transition ${
                      isDarkMode ? 'text-[#D4D4D4] group-hover:text-white' : 'text-gray-800 group-hover:text-gray-900'
                    }`}
                  >
                    {demo.role}
                  </span>
                  <span
                    className={`text-sm font-mono transition ${
                      isDarkMode ? 'text-[#737373] group-hover:text-[#A3A3A3]' : 'text-gray-500 group-hover:text-gray-700'
                    }`}
                  >
                    {demo.email} : {demo.password}
                  </span>
                </button>
              ))}
            </div>
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
