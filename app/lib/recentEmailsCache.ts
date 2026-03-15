'use client';

export interface RecentEmailMessage {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  isRead: boolean;
}

interface CachedRecentEmails {
  messages: RecentEmailMessage[];
  cachedAt: number;
}

interface RecentEmailResult {
  messages: RecentEmailMessage[];
  error: string | null;
}

const MEMORY_CACHE = new Map<string, CachedRecentEmails>();
const STORAGE_PREFIX = 'recent-emails-cache:';

const normalizeMessages = (input: unknown): RecentEmailMessage[] => {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.slice(0, 5).map((item) => {
    const message = item as Partial<RecentEmailMessage>;
    return {
      id: String(message.id ?? ''),
      sender: String(message.sender ?? 'Unknown sender'),
      subject: String(message.subject ?? '(No subject)'),
      preview: String(message.preview ?? ''),
      time: String(message.time ?? ''),
      isRead: Boolean(message.isRead),
    };
  });
};

const getStorageKey = (cacheKey: string) => `${STORAGE_PREFIX}${cacheKey}`;

const parseErrorMessage = async (response: Response, fallback: string) => {
  try {
    const data = await response.json();
    return typeof data?.error === 'string' ? data.error : fallback;
  } catch {
    return fallback;
  }
};

export const getCachedRecentEmails = (cacheKey: string): RecentEmailMessage[] | null => {
  const memoryEntry = MEMORY_CACHE.get(cacheKey);
  if (memoryEntry) {
    return memoryEntry.messages;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.sessionStorage.getItem(getStorageKey(cacheKey));
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as CachedRecentEmails;
    const messages = normalizeMessages(parsed.messages);
    MEMORY_CACHE.set(cacheKey, { messages, cachedAt: parsed.cachedAt || Date.now() });
    return messages;
  } catch {
    window.sessionStorage.removeItem(getStorageKey(cacheKey));
    return null;
  }
};

export const setCachedRecentEmails = (cacheKey: string, messages: RecentEmailMessage[]) => {
  const normalized = normalizeMessages(messages);
  const payload: CachedRecentEmails = {
    messages: normalized,
    cachedAt: Date.now(),
  };

  MEMORY_CACHE.set(cacheKey, payload);

  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(getStorageKey(cacheKey), JSON.stringify(payload));
  }
};

export const fetchRecentEmailsWithCache = async (cacheKey: string): Promise<RecentEmailResult> => {
  const cached = getCachedRecentEmails(cacheKey);
  if (cached) {
    return { messages: cached, error: null };
  }

  try {
    const response = await fetch('/api/email/messages?folder=inbox&limit=5', {
      credentials: 'include',
    });

    if (!response.ok) {
      return {
        messages: [],
        error: await parseErrorMessage(response, 'Unable to load recent messages.'),
      };
    }

    const data = await response.json();
    const messages = normalizeMessages(data?.messages);
    setCachedRecentEmails(cacheKey, messages);

    return { messages, error: null };
  } catch {
    return {
      messages: [],
      error: 'Unable to load recent messages.',
    };
  }
};
