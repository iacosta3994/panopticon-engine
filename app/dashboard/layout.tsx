import { Metadata } from 'next';
import Navigation from '@/components/ui/Navigation';
import TopBar from '@/components/ui/TopBar';
import StatusIndicator from '@/components/ui/StatusIndicator';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Dashboard - Panopticon Engine',
  description: 'Intelligent surveillance and analysis dashboard',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-950 text-white">
      {/* Sidebar Navigation */}
      <Navigation />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar />

        {/* Status Indicator */}
        <StatusIndicator />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          {children}
        </main>
      </div>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'bg-slate-800 text-white border border-cyan-500/20',
          duration: 4000,
        }}
      />
    </div>
  );
}
