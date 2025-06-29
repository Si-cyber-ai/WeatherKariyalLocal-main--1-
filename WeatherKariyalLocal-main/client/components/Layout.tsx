import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "History", href: "/history" },
    { name: "Entry", href: "/entry" },
    { name: "About", href: "/about" },
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">
                    K
                  </span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-semibold text-foreground">
                    Climate Kariyad
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Live Climate Monitoring
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === item.href
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Live Time */}
            <div className="hidden sm:block text-right">
              <div className="text-xs text-muted-foreground">Kerala Time</div>
              <div className="text-sm font-mono text-foreground">
                {formatTime(currentTime)}
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-border py-4">
              <div className="flex flex-col space-y-3">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-sm font-medium px-2 py-1 rounded transition-colors ${
                      location.pathname === item.href
                        ? "text-primary bg-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="border-t border-border pt-3 mt-3">
                  <div className="text-xs text-muted-foreground">
                    Kerala Time
                  </div>
                  <div className="text-sm font-mono text-foreground">
                    {formatTime(currentTime)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* School Info */}
            <div>
              <h3 className="font-semibold mb-2">Kariyad Nambiar HSS</h3>
              <p className="text-sm opacity-90">Kariyad, Kerala, India</p>
              <p className="text-sm opacity-90">School Code: 42017</p>
            </div>

            {/* Project Info */}
            <div>
              <h3 className="font-semibold mb-2">Climate Kariyad</h3>
              <p className="text-sm opacity-90">
                Student-led weather monitoring initiative promoting climate
                literacy and data-driven learning.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold mb-2">Contact</h3>
              <p className="text-sm opacity-90">Email: info@kariyad.edu.in</p>
              <p className="text-sm opacity-90">Phone: +91 XXX XXX XXXX</p>
            </div>
          </div>

          <div className="border-t border-primary-foreground/20 mt-6 pt-4 text-center">
            <p className="text-sm opacity-75">
              © 2025 Climate Kariyad. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
