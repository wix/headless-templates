import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon, KeyIcon } from './icons';
import { Avatar } from './ui';
import { useAuth } from '../lib/auth';

export function Navbar() {
  const { loggedIn, member, login, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-cream/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-ink"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-white">
            <KeyIcon size={17} />
          </span>
          <span>Wix Rentals</span>
        </Link>

        {loggedIn ? (
          <div ref={ref} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-2.5 text-sm font-medium text-ink transition-colors hover:border-accent"
            >
              <Avatar name={member?.name} photo={member?.photo} className="h-7 w-7" textClass="text-xs" />
              <span className="hidden max-w-[10rem] truncate sm:inline">
                {member?.name ?? 'Account'}
              </span>
              <ChevronDownIcon
                size={15}
                className={`text-muted transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {menuOpen && (
              <div className="animate-scale-in absolute right-0 z-40 mt-2 w-44 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-xl">
                <Link
                  to="/account"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm text-ink transition-colors hover:bg-cream"
                >
                  My account
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="block w-full px-4 py-2.5 text-left text-sm text-ink transition-colors hover:bg-cream"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            disabled={loggingIn}
            onClick={() => {
              setLoggingIn(true);
              login('/account').catch(() => setLoggingIn(false));
            }}
            className="flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loggingIn && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-accent" />
            )}
            {loggingIn ? 'Signing in…' : 'Log in'}
          </button>
        )}
      </div>
    </header>
  );
}
