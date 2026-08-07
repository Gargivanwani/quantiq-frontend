import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, FlaskConical, CreditCard,
  Calculator, BookMarked, FileText, TrendingUp,
  ChevronLeft, ChevronRight, Moon, Sun, Menu, MessageSquare
} from 'lucide-react';
import { useAppStore } from '../store';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/topics', icon: BookOpen, label: 'Topics' },
  { to: '/formulas', icon: FlaskConical, label: 'Formulas' },
  { to: '/flashcards', icon: CreditCard, label: 'Flashcards' },
  { to: '/problems', icon: Calculator, label: 'Problems' },
  { to: '/resources', icon: BookMarked, label: 'Resources' },
  { to: '/notes', icon: FileText, label: 'Notes' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/chatbot', icon: MessageSquare, label: 'AI Tutor' },
];

export function AppShell({ children }) {
  const { theme, toggleTheme, sidebarOpen, setSidebarOpen, initTheme } = useAppStore();

  useEffect(() => { initTheme(); }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col transition-all duration-300 border-r border-card flex-shrink-0 ${sidebarOpen ? 'w-56' : 'w-16'}`}
        style={{ background: 'var(--bg-secondary)' }}>
        {/* Logo */}
        <div className={`flex items-center gap-3 p-4 border-b border-card ${!sidebarOpen ? 'justify-center' : ''}`}>
          {sidebarOpen && (
            <div>
              <span className="gradient-text font-extrabold text-xl tracking-tight">QuantIQ</span>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Quant Finance Study</p>
            </div>
          )}
          {!sidebarOpen && <span className="gradient-text font-extrabold text-lg">Q</span>}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} ${!sidebarOpen ? 'justify-center px-2' : ''}`}>
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom controls */}
        <div className="p-2 border-t border-card space-y-1">
          <button onClick={toggleTheme} className={`nav-item w-full ${!sidebarOpen ? 'justify-center px-2' : ''}`}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {sidebarOpen && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`nav-item w-full ${!sidebarOpen ? 'justify-center px-2' : ''}`}>
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            {sidebarOpen && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Topbar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-card flex-shrink-0"
          style={{ background: 'var(--bg-secondary)' }}>
          <span className="gradient-text font-extrabold text-lg">QuantIQ</span>
          <div className="flex gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg" style={{ color: 'var(--text-muted)' }}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-card grid grid-cols-5 z-50"
          style={{ background: 'var(--bg-secondary)' }}>
          {navItems.slice(0, 5).map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 px-1 text-xs transition-colors ${isActive ? 'color-gold' : ''}`}
              style={({ isActive }) => ({ color: isActive ? 'var(--accent-gold)' : 'var(--text-muted)' })}>
              <Icon size={20} />
              <span className="text-[10px]">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

export function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
}
