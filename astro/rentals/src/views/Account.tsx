import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { cancelMyBooking, listMyBookings, type MyBooking } from '../lib/rentals';
import { Avatar, EmptyState, ErrorNote, Spinner } from '../components/ui';
import { RescheduleModal } from '../components/RescheduleModal';
import { UserIcon } from '../components/icons';

function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  const tone =
    s === 'CONFIRMED'
      ? 'bg-green-100 text-green-700'
      : s === 'PENDING' || s === 'PENDING_APPROVAL' || s === 'WAITING_LIST'
        ? 'bg-amber-100 text-amber-700'
        : s === 'CANCELED' || s === 'DECLINED'
          ? 'bg-cream-deep text-muted'
          : 'bg-cream-deep text-ink-soft';
  const label = s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, ' ');
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>{label}</span>;
}

export function Account() {
  const { member, loggedIn, loading: authLoading, login, logout } = useAuth();
  const [bookings, setBookings] = useState<MyBooking[]>([]);
  const [loading, setLoading] = useState(loggedIn);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [rescheduling, setRescheduling] = useState<MyBooking | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const load = useCallback(() => {
    if (!loggedIn) return;
    setLoading(true);
    setError(null);
    listMyBookings()
      .then(setBookings)
      .catch((e) => setError(e?.message ?? 'Could not load your bookings.'))
      .finally(() => setLoading(false));
  }, [loggedIn]);

  useEffect(() => {
    load();
  }, [load]);

  if (authLoading) return <Spinner label="Loading your account…" />;

  if (!loggedIn) {
    return (
      <div className="mx-auto flex max-w-md flex-col px-4 py-20 sm:px-6">
        <div className="animate-fade-up flex flex-col items-center rounded-2xl border border-line bg-surface p-8 text-center shadow-sm">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cream-deep text-ink">
            <UserIcon size={26} />
          </span>
          <h1 className="mt-5 text-xl font-semibold tracking-tight text-ink">
            Log in to view your account
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Browsing and booking are open to everyone — sign in only to see and manage the bookings
            tied to your account.
          </p>
          <button
            type="button"
            disabled={loggingIn}
            onClick={() => {
              setLoggingIn(true);
              login('/account').catch(() => setLoggingIn(false));
            }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loggingIn && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {loggingIn ? 'Signing in…' : 'Log in or sign up'}
          </button>
          <Link
            to="/"
            className="mt-3 text-sm font-medium text-muted transition-colors hover:text-ink"
          >
            Continue browsing
          </Link>
        </div>
      </div>
    );
  }

  const doCancel = async (b: MyBooking) => {
    setBusyId(b.id);
    setActionError(null);
    try {
      await cancelMyBooking(b.id, b.revision);
      setConfirmingId(null);
      load();
    } catch (e) {
      setActionError((e as Error)?.message ?? 'Could not cancel this booking.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-8 sm:px-6">
      {/* Profile header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={member?.name} photo={member?.photo} className="h-14 w-14" textClass="text-lg" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">{member?.name}</h1>
            {member?.email && <p className="text-sm text-muted">{member.email}</p>}
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent"
        >
          Log out
        </button>
      </div>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-ink">My bookings</h2>

      {actionError && (
        <div className="mt-4">
          <ErrorNote title="Something went wrong" detail={actionError} />
        </div>
      )}

      {loading ? (
        <Spinner label="Loading your bookings…" />
      ) : error ? (
        <div className="mt-4">
          <ErrorNote title="Couldn’t load your bookings" detail={error} />
        </div>
      ) : bookings.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No bookings yet">
            When you book a space it’ll show up here.{' '}
            <Link to="/" className="font-medium text-accent hover:text-accent-hover">
              Browse spaces
            </Link>
          </EmptyState>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {bookings.map((b) => {
            const canceled = b.status.toUpperCase() === 'CANCELED' || b.status.toUpperCase() === 'DECLINED';
            const hasActions = b.canCancel || b.canReschedule;
            return (
              <li
                key={b.id}
                className="animate-fade-in rounded-2xl border border-line bg-surface p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{b.title}</p>
                    <p className="mt-0.5 text-sm text-muted">{b.when}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>

                {confirmingId === b.id ? (
                  <div className="mt-3 flex items-center gap-3 border-t border-line pt-3 text-sm">
                    <span className="text-ink-soft">Cancel this booking?</span>
                    <button
                      type="button"
                      disabled={busyId === b.id}
                      onClick={() => doCancel(b)}
                      className="rounded-lg bg-red-600 px-3 py-1.5 font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                    >
                      {busyId === b.id ? 'Cancelling…' : 'Yes, cancel'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingId(null)}
                      className="text-muted transition-colors hover:text-ink"
                    >
                      Keep it
                    </button>
                  </div>
                ) : hasActions ? (
                  <div className="mt-3 flex gap-2 border-t border-line pt-3">
                    {b.canReschedule && (
                      <button
                        type="button"
                        onClick={() => {
                          setActionError(null);
                          setRescheduling(b);
                        }}
                        className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:border-accent"
                      >
                        Reschedule
                      </button>
                    )}
                    {b.canCancel && (
                      <button
                        type="button"
                        onClick={() => {
                          setActionError(null);
                          setConfirmingId(b.id);
                        }}
                        className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:border-red-300 hover:bg-red-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ) : (
                  !canceled && (
                    <p className="mt-3 border-t border-line pt-3 text-xs text-muted">
                      Changes aren’t available for this booking under its policy.
                    </p>
                  )
                )}
              </li>
            );
          })}
        </ul>
      )}

      {rescheduling && (
        <RescheduleModal
          booking={rescheduling}
          onClose={() => setRescheduling(null)}
          onDone={() => {
            setRescheduling(null);
            load();
          }}
        />
      )}
    </div>
  );
}
