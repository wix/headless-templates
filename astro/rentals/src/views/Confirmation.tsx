import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircleIcon, RefreshIcon } from '../components/icons';

export function Confirmation() {
  const [params] = useSearchParams();
  const orderId = params.get('orderId');
  const bookingId = params.get('bookingId');
  // Wix sends an error hint back on the callback if the flow was abandoned/failed.
  const failed = params.get('error') || params.get('status') === 'failed';

  return (
    <div className="animate-fade-up mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <div
        className={`animate-pop-in mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
          failed ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
        }`}
      >
        {failed ? <RefreshIcon size={30} /> : <CheckCircleIcon size={32} />}
      </div>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink">
        {failed ? 'Checkout not completed' : 'Booking confirmed'}
      </h1>
      <p className="mx-auto mt-2 max-w-md text-muted">
        {failed
          ? 'Looks like the checkout was cancelled. The space is still available — feel free to try again.'
          : 'Thanks for your booking. A confirmation has been sent to your email, and the details are saved in your Wix account.'}
      </p>

      {(orderId || bookingId) && !failed && (
        <dl className="mx-auto mt-6 w-full max-w-sm rounded-xl border border-line bg-surface p-4 text-left text-sm">
          {orderId && (
            <div className="flex justify-between gap-4 py-1">
              <dt className="text-muted">Order</dt>
              <dd className="font-mono text-ink">{orderId}</dd>
            </div>
          )}
          {bookingId && (
            <div className="flex justify-between gap-4 py-1">
              <dt className="text-muted">Booking</dt>
              <dd className="font-mono text-ink">{bookingId}</dd>
            </div>
          )}
        </dl>
      )}

      <Link
        to="/"
        className="mt-8 inline-block rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
      >
        Browse more spaces
      </Link>
    </div>
  );
}
