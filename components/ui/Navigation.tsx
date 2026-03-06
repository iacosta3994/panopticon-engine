'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiHome, 
  FiActivity, 
  FiAlertTriangle, 
  FiTrendingUp,
  FiSettings,
  FiClock,
  FiEye
} from 'react-icons/fi';

const Navigation = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', icon: FiHome, label: 'Overview' },
    { href: '/dashboard/anomalies', icon: FiActivity, label: 'Anomalies' },
    { href: '/dashboard/patterns', icon: FiEye, label: 'Patterns' },
    { href: '/dashboard/alerts', icon: FiAlertTriangle, label: 'Alerts' },
    { href: '/dashboard/temporal', icon: FiClock, label: 'Temporal' },
    { href: '/dashboard/settings', icon: FiSettings, label: 'Settings' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center animate-glow">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <div className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Panopticon
            </div>
            <div className="text-xs text-slate-400">Engine v0.1.0</div>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 shadow-cyber'
                    : 'hover:bg-slate-800 border border-transparent'
                }
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span className={isActive ? 'text-cyan-400 font-medium' : 'text-slate-300'}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        <div className="flex items-center justify-between">
          <span>System Active</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Navigation;
