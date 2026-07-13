import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { completeLogin } from '../lib/wix-client';
import { useAuth } from '../lib/auth';
import { ErrorNote, Spinner } from '../components/ui';

export function LoginCallback() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    // parseFromUrl consumes the one-time code — guard against React's double-invoke.
    if (ran.current) return;
    ran.current = true;
    completeLogin()
      .then((to) => {
        refresh();
        navigate(to, { replace: true });
      })
      .catch((e) => setError(e?.message ?? 'Could not complete sign-in.'));
  }, [navigate, refresh]);

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
        <ErrorNote title="Sign-in failed" detail={error} />
        <Link
          to="/"
          className="mt-4 inline-block font-medium text-accent hover:text-accent-hover"
        >
          ← Back to spaces
        </Link>
      </div>
    );
  }
  return <Spinner label="Signing you in…" />;
}
