import { Link, Outlet, useLocation } from 'react-router-dom';
import { MiniCart } from '@/wix-verticals/react-pages/react-router/routes/root';
import { ShoppingCart } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-subtleborder">
        <div className="w-full max-w-[100rem] mx-auto px-8 lg:px-16">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="font-heading text-2xl uppercase tracking-tight text-primary hover:opacity-80 transition-opacity">
              SPORTGEAR
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link 
                to="/" 
                className={`font-heading text-sm uppercase tracking-wide transition-colors ${
                  isActive('/') ? 'text-primary' : 'text-secondary hover:text-primary'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/store" 
                className={`font-heading text-sm uppercase tracking-wide transition-colors ${
                  isActive('/store') || location.pathname.startsWith('/store/') || location.pathname.startsWith('/products/') 
                    ? 'text-primary' 
                    : 'text-secondary hover:text-primary'
                }`}
              >
                Shop
              </Link>
              <Link 
                to="/about" 
                className={`font-heading text-sm uppercase tracking-wide transition-colors ${
                  isActive('/about') ? 'text-primary' : 'text-secondary hover:text-primary'
                }`}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className={`font-heading text-sm uppercase tracking-wide transition-colors ${
                  isActive('/contact') ? 'text-primary' : 'text-secondary hover:text-primary'
                }`}
              >
                Contact
              </Link>
            </nav>

            {/* Cart Icon */}
            <div className="flex items-center">
              <MiniCart
                cartIcon={ShoppingCart}
                cartIconClassName="cursor-pointer text-primary hover:opacity-80 transition-opacity"
              />
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="md:hidden flex items-center gap-6 pb-4 overflow-x-auto">
            <Link 
              to="/" 
              className={`font-heading text-xs uppercase tracking-wide whitespace-nowrap transition-colors ${
                isActive('/') ? 'text-primary' : 'text-secondary hover:text-primary'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/store" 
              className={`font-heading text-xs uppercase tracking-wide whitespace-nowrap transition-colors ${
                isActive('/store') || location.pathname.startsWith('/store/') || location.pathname.startsWith('/products/')
                  ? 'text-primary' 
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Shop
            </Link>
            <Link 
              to="/about" 
              className={`font-heading text-xs uppercase tracking-wide whitespace-nowrap transition-colors ${
                isActive('/about') ? 'text-primary' : 'text-secondary hover:text-primary'
              }`}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className={`font-heading text-xs uppercase tracking-wide whitespace-nowrap transition-colors ${
                isActive('/contact') ? 'text-primary' : 'text-secondary hover:text-primary'
              }`}
            >
              Contact
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground mt-24">
        <div className="w-full max-w-[100rem] mx-auto px-8 lg:px-16 py-16 lg:py-20">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div>
              <h3 className="font-heading text-xl uppercase mb-4 tracking-tight">SPORTGEAR</h3>
              <p className="font-paragraph text-sm italic opacity-90 leading-relaxed">
                Premium sporting goods for athletes who demand excellence.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-heading text-sm uppercase mb-4 tracking-wide">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/store" className="font-paragraph text-sm italic opacity-90 hover:opacity-100 transition-opacity">
                    Shop All
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="font-paragraph text-sm italic opacity-90 hover:opacity-100 transition-opacity">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="font-paragraph text-sm italic opacity-90 hover:opacity-100 transition-opacity">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="font-heading text-sm uppercase mb-4 tracking-wide">Support</h4>
              <ul className="space-y-2">
                <li className="font-paragraph text-sm italic opacity-90">Shipping Information</li>
                <li className="font-paragraph text-sm italic opacity-90">Returns & Exchanges</li>
                <li className="font-paragraph text-sm italic opacity-90">Size Guide</li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-heading text-sm uppercase mb-4 tracking-wide">Stay Connected</h4>
              <p className="font-paragraph text-sm italic opacity-90 mb-4 leading-relaxed">
                Subscribe for exclusive offers and updates
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 bg-primary-foreground/10 border border-primary-foreground/20 rounded text-sm font-paragraph italic text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:border-primary-foreground/40"
                />
                <button className="px-4 py-2 bg-primary-foreground text-primary rounded font-heading text-xs uppercase tracking-wide hover:opacity-90 transition-opacity">
                  Join
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-primary-foreground/20">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="font-paragraph text-sm italic opacity-80">
                © 2026 SportGear. All rights reserved.
              </p>
              <div className="flex gap-6">
                <a href="#" className="font-paragraph text-sm italic opacity-80 hover:opacity-100 transition-opacity">
                  Privacy Policy
                </a>
                <a href="#" className="font-paragraph text-sm italic opacity-80 hover:opacity-100 transition-opacity">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
