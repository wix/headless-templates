import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ConfigBanner } from './components/ui';
import { AuthProvider } from './lib/auth';
import { RentalsList } from './views/RentalsList';
import { RentalDetail } from './views/RentalDetail';
import { Confirmation } from './views/Confirmation';
import { Account } from './views/Account';
import { LoginCallback } from './views/LoginCallback';
import { isClientConfigured } from './lib/wix-client';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </BrowserRouter>
  );
}

function Shell() {
  const { pathname } = useLocation();
  const isDetail = pathname.startsWith('/rental/');
  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      {!isDetail && <Navbar />}
      {!isClientConfigured && <ConfigBanner />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<RentalsList />} />
          <Route path="/rental/:slug" element={<RentalDetail />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/account" element={<Account />} />
          <Route path="/login-callback" element={<LoginCallback />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Page not found</h1>
      <p className="mt-2 text-muted">The page you’re looking for doesn’t exist.</p>
      <Link to="/" className="mt-4 inline-block font-medium text-accent hover:text-accent-hover">
        ← Back to spaces
      </Link>
    </div>
  );
}
