'use client';

import { FiSearch, FiUser, FiBell } from 'react-icons/fi';
import { useState } from 'react';

const TopBar = () => {
  const [notifications, setNotifications] = useState(3);

  return (
    <header className="h-16 bg-slate-900/50 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search observations, patterns, alerts..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white placeholder-slate-400"
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-4 ml-6">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-slate-800 rounded-lg transition-colors">
          <FiBell className="w-5 h-5 text-slate-300" />
          {notifications > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
              {notifications}
            </span>
          )}
        </button>

        {/* User Menu */}
        <button className="flex items-center space-x-2 p-2 hover:bg-slate-800 rounded-lg transition-colors">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
            <FiUser className="w-4 h-4" />
          </div>
          <span className="text-sm text-slate-300">Admin</span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
