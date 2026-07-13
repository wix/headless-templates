import { useEffect, useState, type ReactNode } from 'react';

/** Member avatar with graceful fallbacks. Social-login photos (e.g. Google's
 *  `lh3.googleusercontent.com` URLs) reject requests that carry a referrer, so
 *  we send none; if the image still fails to load we fall back to the initial
 *  instead of a broken-image icon. */
export function Avatar({
  name,
  photo,
  className = 'h-7 w-7',
  textClass = 'text-xs',
}: {
  name?: string;
  photo?: string;
  className?: string;
  textClass?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [photo]);

  if (photo && !failed) {
    return (
      <img
        src={photo}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  const initial = (name ?? 'M').trim().charAt(0).toUpperCase();
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-ink font-semibold text-white ${textClass} ${className}`}
    >
      {initial}
    </span>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-muted">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-accent" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}

export function ErrorNote({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="animate-fade-in rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <p className="font-semibold">{title}</p>
      {detail && <p className="mt-1 text-red-700/80">{detail}</p>}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="animate-fade-in rounded-2xl border border-dashed border-line bg-surface px-6 py-16 text-center">
      <p className="text-base font-medium text-ink">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-md text-sm text-muted">{children}</div>}
    </div>
  );
}

export function ConfigBanner() {
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-900">
      <span className="font-semibold">Setup needed:</span> add your Headless{' '}
      <code className="rounded bg-amber-100 px-1 py-0.5">PUBLIC_WIX_CLIENT_ID</code> to a{' '}
      <code className="rounded bg-amber-100 px-1 py-0.5">.env</code> file, then restart the dev
      server.
    </div>
  );
}
