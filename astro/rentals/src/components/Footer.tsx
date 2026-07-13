export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-cream-deep">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:px-6">
        <p>© {new Date().getFullYear()} Wix Rentals</p>
        <p>Secure checkout powered by Wix</p>
      </div>
    </footer>
  );
}
