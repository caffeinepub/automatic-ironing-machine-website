import { Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!identity;
  const isLoginPage = location.pathname === '/';

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'Product', path: '/product' },
    { label: 'Features', path: '/features' },
    { label: 'Buy Now', path: '/checkout' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      {!isLoginPage && (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-md"
          style={{ background: 'oklch(0.1 0.008 260 / 0.95)' }}>
          <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => navigate({ to: '/product' })}
              className="flex items-center gap-2 md:gap-3 group min-h-[44px]"
            >
              <img
                src="/assets/generated/ironpro-logo.dim_256x256.png"
                alt="AIron"
                className="h-8 w-8 md:h-9 md:w-9 object-contain"
              />
              <span className="font-serif text-lg md:text-xl font-semibold tracking-wide"
                style={{ color: 'oklch(0.96 0.005 85)' }}>
                AI<span className="gold-text">ron</span>
              </span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {isAuthenticated && navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate({ to: link.path as '/' })}
                  className={`text-sm font-medium tracking-wider uppercase transition-colors duration-200 min-h-[44px] ${
                    location.pathname === link.path
                      ? 'gold-text'
                      : 'text-muted-foreground hover:text-foreground'
                  } ${link.path === '/checkout' ? 'btn-gold px-5 py-2 text-xs' : ''}`}
                >
                  {link.label}
                </button>
              ))}
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
                >
                  <LogOut size={15} />
                  <span className="tracking-wider uppercase text-xs">Logout</span>
                </button>
              )}
            </nav>

            {/* Mobile menu toggle */}
            {isAuthenticated && (
              <button
                className="md:hidden text-foreground p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            )}
          </div>

          {/* Mobile Nav Drawer */}
          {mobileMenuOpen && isAuthenticated && (
            <div className="md:hidden border-t border-border/30 px-4 py-4 flex flex-col gap-1"
              style={{ background: 'oklch(0.1 0.008 260)' }}>
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => { navigate({ to: link.path as '/' }); setMobileMenuOpen(false); }}
                  className={`text-sm font-medium tracking-wider uppercase text-left transition-colors py-3 px-2 min-h-[48px] border-b border-border/10 ${
                    location.pathname === link.path ? 'gold-text' : 'text-muted-foreground'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-muted-foreground py-3 px-2 min-h-[48px] mt-1"
              >
                <LogOut size={15} />
                <span className="tracking-wider uppercase text-xs">Logout</span>
              </button>
            </div>
          )}
        </header>
      )}

      {/* Main content */}
      <main className={`flex-1 ${!isLoginPage ? 'pt-16' : ''}`}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-6 md:py-8 px-4 md:px-6"
        style={{ background: 'oklch(0.08 0.008 260)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/ironpro-logo.dim_256x256.png"
              alt="AIron"
              className="h-7 w-7 object-contain opacity-70"
            />
            <span className="font-serif text-sm" style={{ color: 'oklch(0.6 0.005 260)' }}>
              AIron © {new Date().getFullYear()}
            </span>
          </div>
          <p className="text-xs text-center" style={{ color: 'oklch(0.5 0.005 260)' }}>
            Built with{' '}
            <span className="gold-text">♥</span>
            {' '}using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'airon-app')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="gold-text hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
