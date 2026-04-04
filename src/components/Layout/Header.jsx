import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import clsx from 'clsx';
import LanguageToggle from '../Shared/LanguageToggle';
import ThemeToggle from '../Shared/ThemeToggle';
import bransonLogo from '../../assets/branson-logo.svg';

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/bylaws', label: 'Bylaws' },
  { path: '/advisor', label: 'Policy Advisor' },
  { path: '/quick-reference', label: 'Quick Reference' },
];

export default function Header({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const isBylawsPage = location.pathname === '/bylaws';

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/" className="flex items-center gap-2 no-underline">
            <img src={bransonLogo} alt="Branson" className="h-7 w-auto" />
            <span className="text-base font-semibold text-slate-400 dark:text-slate-500 hidden sm:inline">
              Community Values Hub
            </span>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors no-underline',
                location.pathname === item.path
                  ? 'bg-branson-blue/10 text-branson-blue dark:bg-branson-blue/20 dark:text-blue-300'
                  : 'text-slate-500 dark:text-slate-400 hover:text-branson-blue dark:hover:text-blue-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isBylawsPage && (
            <div className="hidden md:block">
              <LanguageToggle />
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile nav */}
      {sidebarOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={clsx(
                'block px-4 py-2 rounded-lg text-sm font-medium transition-colors no-underline',
                location.pathname === item.path
                  ? 'bg-branson-blue/10 text-branson-blue dark:bg-branson-blue/20 dark:text-blue-300'
                  : 'text-slate-500 dark:text-slate-400 hover:text-branson-blue dark:hover:text-blue-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              )}
            >
              {item.label}
            </Link>
          ))}
          {isBylawsPage && (
            <div className="pt-2">
              <LanguageToggle />
            </div>
          )}
        </div>
      )}
    </header>
  );
}
