import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Image, Settings, Shield, LogOut, Menu, X, Box } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { t } = useSettings();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { to: '/', label: t('navHome'), icon: Home, public: true },
    { to: '/dashboard', label: t('navDashboard'), icon: LayoutDashboard, auth: true },
    { to: '/gallery', label: t('navGallery'), icon: Image, auth: true },
    { to: '/settings', label: t('navSettings'), icon: Settings, auth: true },
  ];

  if (profile?.is_admin) {
    navItems.push({ to: '/admin', label: t('navAdmin'), icon: Shield, auth: true });
  }

  const visibleItems = navItems.filter((item) => {
    if (item.auth && !user) return false;
    return true;
  });

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center transition-transform group-hover:scale-110">
              <Box className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">3DForge</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.to)
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}

            {user ? (
              <div className="flex items-center gap-3 ms-3 ps-3 border-s border-slate-700">
                <div className="flex items-center gap-2 text-sm">
                  <div className="px-2 py-1 rounded-md bg-cyan-500/10 text-cyan-400 font-semibold text-xs">
                    {profile?.credits ?? 0} {t('dashCreditsLeft')}
                  </div>
                  <span className="text-slate-300 text-xs hidden lg:block">{profile?.email}</span>
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  {t('navLogout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ms-3 ps-3 border-s border-slate-700">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  {t('navLogin')}
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
                >
                  {t('navSignup')}
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-800"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.to)
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            {user ? (
              <button
                onClick={() => {
                  signOut();
                  setMobileOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" />
                {t('navLogout')}
              </button>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-4 py-2 rounded-lg text-sm font-medium text-slate-300 border border-slate-700"
                >
                  {t('navLogin')}
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                >
                  {t('navSignup')}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
