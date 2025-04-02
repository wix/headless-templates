
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedContainer from "./shared/AnimatedContainer";
import Logo from "./Logo";
import { useBrandConfig } from "@/lib/brandConfig";

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { accentColor } = useBrandConfig();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-8",
        isScrolled
          ? "py-3 backdrop-blur-lg bg-white/80 shadow-sm"
          : "py-5 bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <AnimatedContainer animation="fade-in">
          <Link to="/" className="flex items-center space-x-2">
            <Logo />
          </Link>
        </AnimatedContainer>

        <div className="hidden md:flex items-center space-x-8">
          <AnimatedContainer animation="fade-in" delay="100">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
          </AnimatedContainer>
          <AnimatedContainer animation="fade-in" delay="200">
            <Link to="/schedule" className="text-sm font-medium hover:text-primary transition-colors">
              Schedule
            </Link>
          </AnimatedContainer>
          <AnimatedContainer animation="fade-in" delay="300">
            <Button asChild variant="ghost" className="text-sm font-medium">
              <Link to="/">Login</Link>
            </Button>
          </AnimatedContainer>
          <AnimatedContainer animation="fade-in" delay="400">
            <Button 
              asChild 
              className="rounded-full bg-gradient-to-r from-primary via-secondary to-accent hover:shadow-md transition-all"
            >
              <Link to="/schedule">Book Now</Link>
            </Button>
          </AnimatedContainer>
        </div>

        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 md:hidden">
          <div className="glass-panel min-h-screen p-4 flex flex-col space-y-4">
            <Link
              to="/"
              className="text-base font-medium p-3 hover:bg-accent rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/schedule"
              className="text-base font-medium p-3 hover:bg-accent rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Schedule
            </Link>
            <Link
              to="/"
              className="text-base font-medium p-3 hover:bg-accent rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Button 
              asChild 
              className="w-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent"
            >
              <Link to="/schedule" onClick={() => setIsMobileMenuOpen(false)}>
                Book Now
              </Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
