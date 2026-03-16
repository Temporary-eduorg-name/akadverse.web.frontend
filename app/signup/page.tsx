'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Book, MapPin, Moon, Sun, User, Mail } from 'lucide-react';
import { PasswordInput } from '../components/password-input';

const SignUpPage = () => {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeRole, setActiveRole] = useState<'student' | 'faculty' | 'admin'>('student');

  const roleOptions = [
    { id: 'student' as const, label: 'Student', path: '/studashboard' },
    { id: 'faculty' as const, label: 'Faculty', path: '/staffdashboard' },
    { id: 'admin' as const, label: 'Admin', path: '/admindashboard' },
  ];

  const activeRoleIndex = roleOptions.findIndex((role) => role.id === activeRole);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('signup-theme');

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
    window.localStorage.setItem('signup-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/marketplace/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password, location }),
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Sign up failed. Please try again.');
        return;
      }

      const selected = roleOptions.find((role) => role.id === activeRole);
      router.push(selected?.path ?? '/studashboard');
    } catch (err) {
      setError('Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex font-sans relative overflow-hidden transition-colors ${isDarkMode ? 'bg-black' : 'bg-gray-100'}`}>
      <button
        type="button"
        onClick={() => setIsDarkMode((prev) => !prev)}
        className={`absolute top-6 right-6 z-30 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition ${isDarkMode
            ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50'
          }`}
      >
        {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </button>

      <div
        className={`w-full lg:w-[52%] flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:pl-20 relative z-10 min-h-screen transition-colors ${isDarkMode ? 'bg-black' : 'bg-gray-100'
          }`}
      >
        <div className="max-w-[430px] w-full -ml-auto py-10">
          <div className="mb-10 text-left">
            <h1 className={`text-5xl sm:text-4xl font-bold mb-3 leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Join AkadVerse
            </h1>
            <p className={`text-base ${isDarkMode ? 'text-[#9CA3AF]' : 'text-gray-600'}`}>
              Create your student marketplace account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div>
              <p className={`mb-2 text-xs font-semibold uppercase tracking-widest ${isDarkMode ? 'text-[#737373]' : 'text-gray-500'}`}>
                Choose View Role
              </p>
              <div className={`relative grid grid-cols-3 rounded-xl p-1 ${isDarkMode ? 'bg-[#0f0f0f]' : 'bg-gray-100'}`}>
                <span
                  className={`absolute top-1 bottom-1 w-[calc((100%-0.5rem)/3)] rounded-lg transition-transform duration-300 ease-out ${isDarkMode ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-white border border-blue-100 shadow-sm'
                    }`}
                  style={{ transform: `translateX(calc(${activeRoleIndex} * 100%))` }}
                />
                {roleOptions.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setActiveRole(role.id)}
                    className={`relative z-10 py-2 text-sm font-semibold transition-colors ${activeRole === role.id
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <User className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-[#737373]' : 'text-gray-500'}`} size={20} />
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className={`w-full pl-12 pr-3 py-3 border rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm ${isDarkMode
                      ? 'bg-[#171717] border-[#262626] text-white placeholder-[#737373]'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                />
              </div>

              <div className="relative">
                <User className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-[#737373]' : 'text-gray-500'}`} size={20} />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className={`w-full pl-12 pr-3 py-3 border rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm ${isDarkMode
                      ? 'bg-[#171717] border-[#262626] text-white placeholder-[#737373]'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                />
              </div>
            </div>

            <div className="relative">
              <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-[#737373]' : 'text-gray-500'}`} size={20} />
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className={`w-full pl-12 pr-3 py-3 border rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm ${isDarkMode
                    ? 'bg-[#171717] border-[#262626] text-white placeholder-[#737373]'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
              />
            </div>

            <div className="relative">
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-[#737373]' : 'text-gray-500'}`} size={20} />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full pl-12 pr-3 py-3 border rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm ${isDarkMode
                    ? 'bg-[#171717] border-[#262626] text-white placeholder-[#737373]'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
              />
            </div>

            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              isDarkMode={isDarkMode}
            />

            {error && (
              <div className={`text-sm p-3 rounded-lg ${isDarkMode ? 'text-red-400 bg-red-900/20' : 'text-red-700 bg-red-100'}`}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>

            <p className={`text-sm text-center ${isDarkMode ? 'text-[#9CA3AF]' : 'text-gray-600'}`}>
              Already have an account?{' '}
              <Link href="/login" className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>

      <div className='flex flex-1 bg-[#FAFAFA] relative rounded-tl-3xl rounded-bl-3xl overflow-hidden items-center justify-center '>
        <div className="absolute w-96 h-96 rounded-full blur-[100px] opacity-70 bg-[#7B6CFF] top-[-130px] left-[-30px]" />
        <div className="absolute w-[456px] h-[348px] rounded-full blur-[100px] opacity-60 bg-[#A48CFF] top-1/2 -translate-y-1/2 right-[-40px]" />
        <div className="absolute w-96 h-96 rounded-full blur-[80px] opacity-60 bg-[#F2D8A7] bottom-21 right-18" />
        <div className="absolute w-[440px] h-[335px] rounded-full blur-[100px] opacity-60 bg-[#BFD3FF] bottom-[-90px] left-[114px]" />
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

export default SignUpPage;
