'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Inbox,
  Star,
  Send,
  AlertOctagon,
  Trash2,
  Paperclip,
  Mail,
  ChevronDown,
  Bell,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';
import DashboardNavbar from '@/app/components/dashboard/student/DashboardNavbar';
import DashboardSidebar from '@/app/components/dashboard/student/DashboardSidebar';

type FolderTab = 'inbox' | 'starred' | 'sent' | 'spam' | 'trash';

type EmailItem = {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  preview: string;
  body: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment: boolean;
  timestamp: string;
  avatarColor: string;
};

const isFolderTab = (value: string | null): value is FolderTab =>
  value === 'inbox' || value === 'starred' || value === 'sent' || value === 'spam' || value === 'trash';

const AVATAR_COLORS = [
  'bg-indigo-500', 'bg-blue-600', 'bg-purple-600', 'bg-emerald-500',
  'bg-cyan-600', 'bg-rose-500', 'bg-amber-500', 'bg-teal-600',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const tabs: Array<{ id: FolderTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'starred', label: 'Starred', icon: Star },
  { id: 'sent', label: 'Sent', icon: Send },
  { id: 'spam', label: 'Spam', icon: AlertOctagon },
  { id: 'trash', label: 'Trash', icon: Trash2 },
];

const Page = () => {
  const searchParams = useSearchParams();
  const folderParam = searchParams.get('folder');
  const messageIdParam = searchParams.get('messageId');

  const [activeTab, setActiveTab] = useState<FolderTab>('inbox');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(256);

  // Connection state
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [connectedEmail, setConnectedEmail] = useState<string>('');
  const [connecting, setConnecting] = useState(false);

  // Email data state
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const mainStyle = useMemo(
    () => ({ '--sidebar-width': `${sidebarWidth}px` } as React.CSSProperties),
    [sidebarWidth],
  );

  useEffect(() => {
    const nextTab = isFolderTab(folderParam) ? folderParam : 'inbox';
    setActiveTab((prev) => (prev === nextTab ? prev : nextTab));
    setSelectedId(messageIdParam);
  }, [folderParam, messageIdParam]);

  // Check connection status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/email/status', { credentials: 'include' });
        const data = await res.json();
        setIsConnected(data.connected === true);
        if (data.email) setConnectedEmail(data.email);
      } catch {
        setIsConnected(false);
      }
    };
    checkStatus();
  }, []);

  // Handle OAuth callback query params
  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');
    if (connected === 'true') {
      setStatusMessage('Gmail connected successfully!');
      setIsConnected(true);
      // Re-fetch status to get email address
      fetch('/api/email/status', { credentials: 'include' })
        .then((r) => r.json())
        .then((d) => { if (d.email) setConnectedEmail(d.email); });
    } else if (error) {
      const msgs: Record<string, string> = {
        auth_failed: 'Authentication failed. Please try again.',
        oauth_denied: 'Google authorization was denied.',
        token_exchange: 'Failed to exchange authorization code.',
        server: 'A server error occurred. Please try again.',
      };
      setStatusMessage(msgs[error] ?? 'Connection failed. Please try again.');
    }
  }, [searchParams]);

  // Fetch emails when connected and tab changes
  const fetchEmails = useCallback(async (folder: FolderTab) => {
    setLoadingEmails(true);
    setEmailError(null);
    try {
      const res = await fetch(`/api/email/messages?folder=${folder}`, { credentials: 'include' });
      if (!res.ok) {
        const err = await res.json();
        setEmailError(err.error ?? 'Failed to load emails.');
        setEmails([]);
        return;
      }
      const data = await res.json();
      const enriched: EmailItem[] = (data.messages ?? []).map((m: EmailItem) => ({
        ...m,
        avatarColor: getAvatarColor(m.sender),
      }));
      setEmails(enriched);
    } catch {
      setEmailError('Network error. Please try again.');
      setEmails([]);
    } finally {
      setLoadingEmails(false);
    }
  }, []);

  useEffect(() => {
    if (isConnected) fetchEmails(activeTab);
  }, [isConnected, activeTab, fetchEmails]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const res = await fetch('/api/email/connect', { credentials: 'include' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setStatusMessage(data.error ?? 'Failed to get connection URL.');
        setConnecting(false);
      }
    } catch {
      setStatusMessage('Failed to initiate connection. Please try again.');
      setConnecting(false);
    }
  };

  const folderEmails = useMemo(() => {
    if (!search.trim()) return emails;
    const q = search.toLowerCase();
    return emails.filter(
      (e) =>
        e.sender.toLowerCase().includes(q) ||
        e.subject.toLowerCase().includes(q) ||
        e.preview.toLowerCase().includes(q),
    );
  }, [emails, search]);

  const selectedEmail = useMemo(() => {
    if (!folderEmails.length) return null;
    if (selectedId) return folderEmails.find((m) => m.id === selectedId) ?? folderEmails[0];
    return folderEmails[0];
  }, [folderEmails, selectedId]);

  const counts = useMemo(() => {
    const base = { inbox: 0, starred: 0, sent: 0, spam: 0, trash: 0 };
    if (emails.length === 0) return base;
    // Counts reflect current folder's fetched emails
    const tab = activeTab;
    base[tab] = emails.length;
    return base;
  }, [emails, activeTab]);

  // Not-connected screen
  if (isConnected === false) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] font-sans">
        <DashboardNavbar />
        <div className="relative" style={{ minHeight: 'calc(100vh - 70px)' }}>
          <DashboardSidebar onWidthChange={setSidebarWidth} />
          <div style={mainStyle} className="ml-0 lg:ml-[var(--sidebar-width)] transition-[margin] duration-300 ease-out">
            <div className="flex items-center justify-center min-h-[calc(100vh-70px)]">
              <div className="text-center max-w-md px-4">
                <div className="h-24 w-24 rounded-full bg-[#edf4ff] flex items-center justify-center mx-auto mb-6">
                  <WifiOff size={42} className="text-[#2f6ef7]" />
                </div>
                <h2 className="text-2xl font-bold text-[#2f3b4f] mb-3">Connect your Gmail</h2>
                <p className="text-[#64748b] mb-2 leading-relaxed">
                  To read and manage your emails here, connect your Google account. You&apos;ll only grant read access.
                </p>
                {statusMessage && (
                  <p className="text-sm text-red-500 mb-4 bg-red-50 rounded-lg px-3 py-2">{statusMessage}</p>
                )}
                <button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="mt-4 bg-[#2f6ef7] hover:bg-[#1f5be0] text-white font-semibold px-8 py-3 rounded-[14px] shadow-[0_6px_16px_rgba(47,110,247,0.28)] transition-colors flex items-center gap-2 mx-auto disabled:opacity-60"
                >
                  <Wifi size={18} />
                  {connecting ? 'Redirecting...' : 'Connect Email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading connection check
  if (isConnected === null) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] font-sans">
        <DashboardNavbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-70px)]">
          <div className="text-[#8ea0b7] text-sm">Checking connection...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#f8f9fc] font-sans">
      <DashboardNavbar />
      <div className="relative h-[calc(100vh-70px)] overflow-hidden">
        <DashboardSidebar onWidthChange={setSidebarWidth} />

        <div style={mainStyle} className="ml-0 lg:ml-[var(--sidebar-width)] transition-[margin] duration-300 ease-out min-w-0 h-full overflow-hidden">
          <div className="h-full overflow-hidden">
            <div className="border border-[#e6ebf2] bg-[#f8f9fc] p-4 pb-8 h-full flex flex-col overflow-hidden">

              {/* Top bar */}
              <div className="shrink-0 rounded-[20px] border border-[#e6ebf2] bg-white px-4 py-2 flex items-center justify-between gap-3 shadow-[0_2px_8px_rgba(15,23,42,0.05)]">
                <div className="flex items-center gap-3 w-full">
                  <button className="hidden md:flex h-7 w-7 rounded-full border border-[#e6ebf2] bg-[#f9fbff] items-center justify-center text-[#b4bfd0]" aria-label="Back">
                    <ChevronDown size={14} className="-rotate-90" />
                  </button>
                  <div className="relative w-full max-w-[420px]">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b4bfd0]" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search emails..."
                      className="w-full rounded-[14px] border border-[#e7ecf3] bg-[#f7f9fc] py-2.5 pl-10 pr-3 text-sm text-[#657189] outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchEmails(activeTab)}
                    className="p-1.5 text-[#b4bfd0] hover:text-[#2f6ef7] transition-colors"
                    aria-label="Refresh"
                    title="Refresh emails"
                  >
                    <RefreshCw size={16} className={loadingEmails ? 'animate-spin' : ''} />
                  </button>
                  <button className="p-1.5 text-[#b4bfd0] hover:text-[#7b8799] transition-colors" aria-label="Notify">
                    <Bell size={16} />
                  </button>
                  <div className="flex items-center gap-2 border-l border-[#e7ecf3] pl-3 py-1 bg-white">
                    <div className="h-8 w-8 aspect-square shrink-0 rounded-full bg-blue-500 text-white text-[10px] font-semibold flex items-center justify-center leading-none">
                      {connectedEmail ? connectedEmail.slice(0, 2).toUpperCase() : 'ME'}
                    </div>
                    {connectedEmail && (
                      <div className="hidden sm:block">
                        <p className="text-[13px] font-medium text-[#344155] truncate max-w-[160px]">{connectedEmail}</p>
                      </div>
                    )}
                    <ChevronDown size={14} className="text-[#b4bfd0]" />
                  </div>
                </div>
              </div>

              {statusMessage && (
                <div className={`mt-3 shrink-0 text-sm px-4 py-2 rounded-[12px] ${statusMessage.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {statusMessage}
                </div>
              )}

              <div className="mt-4 grid grid-cols-1 xl:grid-cols-[220px_minmax(0,1fr)_minmax(0,1fr)] gap-4 flex-1 min-h-0 overflow-hidden">

                {/* Sidebar nav */}
                <aside className="rounded-[20px] border border-[#e6ebf2] bg-white p-3.5 flex flex-col h-full min-h-0 shadow-[0_2px_8px_rgba(15,23,42,0.05)]">
                  <div className="px-2 pb-3 pt-1 border-b border-[#eef2f7]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9aa8bc]">Mailbox</p>
                    <p className="text-sm font-semibold text-[#314056] mt-1">Folders</p>
                  </div>

                  <div className="space-y-1.5 flex-1 min-h-0 overflow-y-auto pt-3">
                    {tabs.map((tab) => {
                      const TabIcon = tab.icon;
                      const active = activeTab === tab.id;
                      const count = counts[tab.id];

                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setSelectedId(null);
                            setActiveTab(tab.id);
                          }}
                          className={`w-full flex items-center justify-between rounded-[12px] px-3 py-2.5 text-sm md:text-[15px] transition ${active ? 'bg-[#edf4ff] text-[#2f6ef7] font-semibold' : 'text-[#64748b] hover:bg-[#f6f9fd]'}`}
                        >
                          <span className="flex items-center gap-2">
                            <TabIcon size={16} />
                            {tab.label}
                          </span>
                          {count > 0 && (
                            <span className="text-[12px] px-2 py-0.5 rounded-full bg-[#edf1f7] text-[#8ea0b7]">{count}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </aside>

                {/* Email list */}
                <section className="rounded-[20px] border border-[#e6ebf2] bg-white flex flex-col h-full min-h-0 min-w-0 overflow-hidden shadow-[0_2px_8px_rgba(15,23,42,0.05)]">
                  <div className="px-4 py-3 text-lg md:text-xl leading-none font-semibold text-[#2f3b4f] capitalize flex items-center justify-between">
                    {activeTab}
                    {loadingEmails && <RefreshCw size={15} className="animate-spin text-[#b4bfd0]" />}
                  </div>
                  <div className="px-1 pb-3 flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                    {loadingEmails ? (
                      <div className="p-8 text-center text-sm text-[#9aabc2]">Loading emails...</div>
                    ) : emailError ? (
                      <div className="p-8 text-center text-sm text-red-400">{emailError}</div>
                    ) : folderEmails.length === 0 ? (
                      <div className="p-8 text-center text-sm text-[#9aabc2]">No emails found in this tab.</div>
                    ) : (
                      <div className="space-y-2 p-2">
                        {folderEmails.map((mail) => (
                          <button
                            key={mail.id}
                            onClick={() => setSelectedId(mail.id)}
                            className={`w-full text-left rounded-[14px] px-3 py-3 border min-w-0 overflow-hidden shadow-[0_1px_4px_rgba(15,23,42,0.04)] transition ${
                              selectedEmail?.id === mail.id
                                ? 'bg-[#f2f7ff] border-[#d9e8ff]'
                                : 'bg-white border-transparent hover:bg-[#f8fbff]'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className={`h-8 w-8 rounded-full ${mail.avatarColor || 'bg-blue-500'} text-white text-[11px] font-semibold flex items-center justify-center mt-0.5 shrink-0`}>
                                {mail.sender.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <p className={`text-sm md:text-[15px] truncate ${mail.isRead ? 'text-[#364152]' : 'text-[#1f2a3a] font-semibold'}`}>{mail.sender}</p>
                                  <p className="text-[12px] text-[#8ea0b7] whitespace-nowrap">{mail.timestamp}</p>
                                </div>
                                <p className="text-[14px] text-[#44546a] truncate">{mail.subject}</p>
                                <p className="text-[13px] text-[#8ea0b7] truncate">{mail.preview}</p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  {mail.hasAttachment && (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-[#8ea0b7]">
                                      <Paperclip size={11} /> Attachment
                                    </span>
                                  )}
                                  {mail.isStarred && <Star size={12} className="text-amber-400 fill-amber-300" />}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </section>

                {/* Email detail */}
                <section className="rounded-[20px] border border-[#e6ebf2] bg-white px-6 pt-6 pb-4 h-full min-h-0 min-w-0 overflow-y-auto overflow-x-hidden flex flex-col shadow-[0_2px_8px_rgba(15,23,42,0.05)]">
                  {selectedEmail ? (
                    <div className="flex flex-col min-w-0">
                      <div className="pb-4 border-b border-[#e8edf4] min-w-0">
                        <p className="text-base font-semibold text-[#2f3b4f] break-words">{selectedEmail.subject}</p>
                        <p className="text-sm text-[#8ea0b7] mt-1 break-words">
                          From {selectedEmail.sender}{' '}
                          <span className="text-[#b4bfd0] break-all">({selectedEmail.senderEmail})</span>
                        </p>
                        {selectedEmail.timestamp && (
                          <p className="text-xs text-[#b4bfd0] mt-0.5">{selectedEmail.timestamp}</p>
                        )}
                      </div>
                      <div className="py-4 text-sm text-[#54657d] leading-7 whitespace-pre-wrap break-words">
                        {selectedEmail.body}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-[#8ea0b7]">
                      <div className="h-24 w-24 rounded-full bg-[#f4f7fc] flex items-center justify-center mb-5">
                        <Mail size={42} className="text-[#c2cedf]" />
                      </div>
                      <p className="text-2xl md:text-3xl font-semibold text-[#3b4c64] leading-tight">Select an email to read</p>
                      <p className="text-base mt-3 max-w-[360px] leading-7">Choose an email from your list to view its contents.</p>
                    </div>
                  )}
                </section>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
