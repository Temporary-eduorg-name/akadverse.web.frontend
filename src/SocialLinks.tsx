interface BaseSocialLinkProps {
  className?: string;
}

interface InstagramLinkProps extends BaseSocialLinkProps {
  username: string;
}

interface TwitterLinkProps extends BaseSocialLinkProps {
  username: string;
}

interface WebsiteLinkProps extends BaseSocialLinkProps {
  url: string;
}

interface LinkedInLinkProps extends BaseSocialLinkProps {
  username: string;
}

const defaultClassName =
  "px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-sm font-medium text-zinc-900 dark:text-white transition-colors";

export function InstagramLink({ username, className = defaultClassName }: InstagramLinkProps) {
  return (
    <a
      href={`https://instagram.com/${username}`}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      Instagram: @{username}
    </a>
  );
}

export function TwitterLink({ username, className = defaultClassName }: TwitterLinkProps) {
  return (
    <a
      href={`https://twitter.com/${username}`}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      Twitter: @{username}
    </a>
  );
}

export function LinkedInLink({ username, className = defaultClassName }: LinkedInLinkProps) {
  return (
    <a
      href={`https://linkedin.com/in/${username}`}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      LinkedIn: {username}
    </a>
  );
}

export function WebsiteLink({ url, className = defaultClassName }: WebsiteLinkProps) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
      Website
    </a>
  );
}