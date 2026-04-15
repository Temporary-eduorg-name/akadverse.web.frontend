'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type Category = 'suggestion' | 'bug' | 'feature' | 'other' | '';

type NoticeType = 'success' | 'warning' | 'error' | null;

const placeholderMessages = [
  'Have you found a bug? Tell us about it.',
  'Got an idea that could make things better?',
  'What feature would make your day?',
  'Your feedback helps us improve. What is on your mind?',
  'Have a suggestion? No idea is too small.',
  'What would make your experience smoother?',
  'Your wishlist item? Type it below.',
  'Your voice matters. What should we know?',
];

const noticeClass = (type: NoticeType) => {
  if (type === 'success') return 'bg-emerald-100 text-emerald-900';
  if (type === 'warning') return 'bg-amber-100 text-amber-900';
  if (type === 'error') return 'bg-rose-100 text-rose-900';
  return '';
};

const Page = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('');
  const [message, setMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ text: string; type: NoticeType }>({ text: '', type: null });
  const [placeholder, setPlaceholder] = useState('');

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const categoryButtons = useMemo(
    () => [
      { id: 'suggestion', label: 'Suggestion', emoji: '💡' },
      { id: 'bug', label: 'Bug Report', emoji: '🐛' },
      { id: 'feature', label: 'Feature Request', emoji: '✨' },
      { id: 'other', label: 'Other', emoji: '💬' },
    ] as const,
    [],
  );

  useEffect(() => {
    let currentText = '';
    let targetText = placeholderMessages[Math.floor(Math.random() * placeholderMessages.length)];
    let index = 0;
    let mode: 'typing' | 'hold' | 'erasing' = 'typing';

    const tick = () => {
      if (mode === 'typing') {
        if (index < targetText.length) {
          currentText += targetText[index];
          setPlaceholder(currentText);
          index += 1;
          timeoutRef.current = setTimeout(tick, 35);
        } else {
          mode = 'hold';
          timeoutRef.current = setTimeout(tick, 1500);
        }
        return;
      }

      if (mode === 'hold') {
        mode = 'erasing';
        timeoutRef.current = setTimeout(tick, 20);
        return;
      }

      if (currentText.length > 0) {
        currentText = currentText.slice(0, -1);
        setPlaceholder(currentText);
        timeoutRef.current = setTimeout(tick, 20);
      } else {
        mode = 'typing';
        targetText = placeholderMessages[Math.floor(Math.random() * placeholderMessages.length)];
        index = 0;
        timeoutRef.current = setTimeout(tick, 250);
      }
    };

    timeoutRef.current = setTimeout(tick, 250);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const setNoticeWithTimeout = (text: string, type: NoticeType, timeout = 3500) => {
    setNotice({ text, type });
    window.setTimeout(() => {
      setNotice((prev) => (prev.text === text ? { text: '', type: null } : prev));
    }, timeout);
  };

  const onFileChange = (files: FileList | null) => {
    if (!files) return;
    setUploadedFiles(Array.from(files));
  };

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setDragOver(false);
    setUploadedFiles(Array.from(e.dataTransfer.files));
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (!selectedCategory) {
      setNoticeWithTimeout('Please select a category.', 'warning');
      return;
    }

    if (message.trim().length < 8) {
      setNoticeWithTimeout('Please provide more details (at least 8 characters).', 'warning');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const payload = {
        category: selectedCategory,
        message: message.trim(),
        attachments: uploadedFiles.map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
        })),
      };

      const response = await fetch('/api/marketplace/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback.');
      }

      setSelectedCategory('');
      setMessage('');
      setUploadedFiles([]);
      setNoticeWithTimeout('Thank you. Your feedback has been submitted successfully.', 'success', 5000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit feedback. Please try again.';
      setNoticeWithTimeout(errorMessage, 'error', 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full overflow-auto">
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="font-bold mb-2 text-[#2c3e50] text-[30px]">We&apos;d Love to Hear From You</h1>
          <p className="text-[#2c3e50] opacity-80 text-base">Share your suggestions, report bugs, or tell us what&apos;s on your mind.</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block font-semibold mb-3 text-sm text-[#2c3e50]">What brings you here today?</label>
            <div className="flex flex-wrap gap-3" role="group" aria-label="Feedback categories">
              {categoryButtons.map((item) => {
                const active = selectedCategory === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedCategory(item.id)}
                    aria-pressed={active}
                    className={`px-5 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                      active ? 'bg-[#667eea] text-white border-[#667eea]' : 'border-[#667eea] text-[#2c3e50] hover:-translate-y-0.5'
                    }`}
                  >
                    <span>{item.emoji}</span> {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block font-semibold mb-3 text-sm text-[#2c3e50]">
              Tell us more
            </label>
            <textarea
              id="message"
              rows={6}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all duration-300"
              placeholder={placeholder}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="file-upload" className="block font-semibold mb-3 text-sm text-[#2c3e50]">
              Attachments (optional)
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 ${
                dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-indigo-400'
              }`}
              onClick={() => document.getElementById('file-upload')?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <input
                id="file-upload"
                type="file"
                className="hidden"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={(e) => onFileChange(e.target.files)}
              />

              {uploadedFiles.length === 0 ? (
                <div>
                  <p className="text-[#2c3e50]">Click to upload or drag and drop</p>
                  <p className="text-sm text-slate-500">Images, PDFs, or documents</p>
                </div>
              ) : (
                <div className="text-left text-sm text-[#2c3e50] space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="truncate flex-1">📎 {file.name}</span>
                      <span className="text-xs opacity-60 ml-2">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="w-full py-4 rounded-lg font-semibold text-white bg-[#667eea] hover:shadow-lg transition-all duration-300 disabled:opacity-60"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>

        {notice.type && (
          <div className={`mt-6 p-4 rounded-lg text-center ${noticeClass(notice.type)}`}>
            {notice.type === 'success' ? '✓ ' : notice.type === 'warning' ? '⚠ ' : '✕ '}
            {notice.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
