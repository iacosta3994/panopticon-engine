'use client';

import { FiActivity, FiAlertTriangle, FiEye, FiTrendingUp } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface MetricsOverviewProps {
  stats: {
    observations: number;
    activeAlerts: number;
    patterns: number;
    health: number;
  };
}

const MetricsOverview = ({ stats }: MetricsOverviewProps) => {
  const metrics = [
    {
      label: 'Observations',
      value: stats.observations.toLocaleString(),
      change: '+12.5%',
      icon: FiActivity,
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/50',
    },
    {
      label: 'Active Alerts',
      value: stats.activeAlerts,
      change: '-5.2%',
      icon: FiAlertTriangle,
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/50',
    },
    {
      label: 'Patterns Detected',
      value: stats.patterns,
      change: '+8.3%',
      icon: FiEye,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/50',
    },
    {
      label: 'System Health',
      value: `${stats.health}%`,
      change: 'Optimal',
      icon: FiTrendingUp,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-slate-900/50 backdrop-blur border ${metric.borderColor} rounded-xl p-6 hover:shadow-xl hover:shadow-cyan-500/10 transition-all`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-lg flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-green-400">{metric.change}</span>
            </div>
            <div className="text-3xl font-bold mb-1">{metric.value}</div>
            <div className="text-sm text-slate-400">{metric.label}</div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default MetricsOverview;
