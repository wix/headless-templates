import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-primary text-primary-foreground">
      <div className="max-w-[100rem] mx-auto px-6 md:px-12 py-16 lg:py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Brand Column */}
          <div>
            <h3 className="font-heading text-2xl mb-4">CMS Template</h3>
            <p className="font-paragraph text-base opacity-90 leading-relaxed">
              A flexible, clean template designed for content-driven websites and data catalogs.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg mb-4">Quick Links</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/" className="font-paragraph text-base opacity-90 hover:opacity-100 transition-opacity">
                Home
              </Link>
              <Link to="/catalog" className="font-paragraph text-base opacity-90 hover:opacity-100 transition-opacity">
                Catalog
              </Link>
              <Link to="/about" className="font-paragraph text-base opacity-90 hover:opacity-100 transition-opacity">
                About
              </Link>
              <Link to="/contact" className="font-paragraph text-base opacity-90 hover:opacity-100 transition-opacity">
                Contact
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading text-lg mb-4">Contact</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="font-paragraph text-base opacity-90">info@example.com</span>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="font-paragraph text-base opacity-90">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="font-paragraph text-base opacity-90">123 Main Street, City, State 12345</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-heading text-lg mb-4">Stay Updated</h4>
            <p className="font-paragraph text-base opacity-90 mb-4 leading-relaxed">
              Subscribe to receive the latest updates and news.
            </p>
            <Link
              to="/contact"
              className="inline-block bg-background text-foreground px-6 py-3 font-paragraph text-base hover:bg-opacity-90 transition-all"
            >
              Get in Touch
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground border-opacity-20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-paragraph text-sm opacity-80">
              © {currentYear} CMS Template. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/about" className="font-paragraph text-sm opacity-80 hover:opacity-100 transition-opacity">
                Privacy Policy
              </Link>
              <Link to="/about" className="font-paragraph text-sm opacity-80 hover:opacity-100 transition-opacity">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
