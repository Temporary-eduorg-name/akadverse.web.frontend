'use client';

import { useState } from 'react';
import { Eye, EyeOff, Key } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function PasswordInput({ value, onChange, placeholder = 'Password', isDarkMode = true }: {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  isDarkMode?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);

  const iconColor = isDarkMode ? 'text-[#737373]' : 'text-gray-500';
  const inputClasses = isDarkMode
    ? 'bg-[#171717] border-[#262626] text-white placeholder-[#737373]'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500';
  const buttonClasses = isDarkMode
    ? 'text-[#737373] hover:text-white'
    : 'text-gray-500 hover:text-gray-800';

  return (
    <div className="relative w-full">
      <Key className={`absolute left-4 top-1/2 -translate-y-1/2 ${iconColor}`} size={20} />
      
      <input
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        className={`w-full pl-12 pr-12 py-3 border rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm ${inputClasses}`}
      />
      
      <AnimatePresence mode="wait">
        <motion.button
          key={showPassword ? 'eye-off' : 'eye'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={`absolute right-4 top-1/2 -translate-y-1/2 transition bg-transparent border-0 cursor-pointer p-0 flex items-center justify-center ${buttonClasses}`}
        >
          {showPassword ? (
            <EyeOff size={20} />
          ) : (
            <Eye size={20} />
          )}
        </motion.button>
      </AnimatePresence>
    </div>
  );
}
