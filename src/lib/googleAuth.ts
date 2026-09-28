// Google Identity Services (GIS) Integration Helper

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void; auto_select?: boolean }) => void;
          renderButton: (parent: HTMLElement, options: { theme?: string; size?: string; width?: string | number; text?: string; shape?: string }) => void;
          prompt: (notification?: (notification: unknown) => void) => void;
          revoke: (email: string, done: () => void) => void;
        };
      };
    };
  }
}

export interface RealGoogleUser {
  name: string;
  email: string;
  avatar: string;
  sub: string;
}

export function parseGoogleJwt(token: string): RealGoogleUser | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    return {
      name: parsed.name || parsed.given_name || 'Google User',
      email: parsed.email || '',
      avatar: parsed.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(parsed.email || 'google')}`,
      sub: parsed.sub || '',
    };
  } catch (err) {
    console.error('Failed to parse Google JWT:', err);
    return null;
  }
}

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const isRealGoogleClientId = (id: string): boolean => {
  return Boolean(id && id.includes('.apps.googleusercontent.com') && !id.includes('exampleclientid'));
};

export function setupGoogleOneTap(onSuccess: (user: RealGoogleUser) => void) {
  if (typeof window === 'undefined' || !window.google || !isRealGoogleClientId(GOOGLE_CLIENT_ID)) return;

  try {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        if (response.credential) {
          const user = parseGoogleJwt(response.credential);
          if (user) {
            onSuccess(user);
          }
        }
      },
      auto_select: false,
    });

    window.google.accounts.id.prompt();
  } catch (e) {
    console.warn('Google One Tap init error:', e);
  }
}
