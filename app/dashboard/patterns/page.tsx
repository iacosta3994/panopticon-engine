'use client';

import { useEffect, useState } from 'react';
import { FiEye, FiActivity, FiGitBranch } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function PatternsPage() {
  const [patterns, setPatterns] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    // Generate mock pattern data
    const mockPatterns = [
      {
        id: '1',
        name: 'Sequential Login Failures',
        type: 'sequential',
        confidence: 95.5,
        occurrences: 42,
        firstSeen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
        signature: {
          events: ['login_attempt', 'login_failed', 'login_failed', 'account_lock'],
        },
      },
      {
        id: '2',
        name: 'API Rate Limit Pattern',
        type: 'frequency',
        confidence: 88.2,
        occurrences: 156,
        firstSeen: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        lastSeen: new Date(Date.now() - 30 * 60 * 1000),
        signature: {
          event_type: 'rate_limit_exceeded',
          frequency: 156,
        },
      },
      {
        id: '3',
        name: 'Database Connection Spike',
        type: 'correlation',
        confidence: 92.1,
        occurrences: 23,
        firstSeen: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        lastSeen: new Date(Date.now() - 60 * 60 * 1000),
        signature: {
          events: ['db_slow_query', 'connection_timeout'],
        },
      },
    ];

    setPatterns(mockPatterns);
  }, []);

  const patternTypeData = [
    { name: 'Sequential', value: patterns.filter(p => p.type === 'sequential').length, color: '#00f3ff' },
    { name: 'Frequency', value: patterns.filter(p => p.type === 'frequency').length, color: '#9d00ff' },
    { name: 'Correlation', value: patterns.filter(p => p.type === 'correlation').length, color: '#ff00ea' },
    { name: 'Anomaly', value: patterns.filter(p => p.type === 'anomaly').length, color: '#00ff9f' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
          Pattern Analysis
        </h1>
        <p className="text-slate-400 mt-1">Detected behavioral patterns and sequences</p>
      </div>

      {/* Pattern Type Distribution */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Pattern Distribution by Type</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={patternTypeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {patternTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pattern Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {patterns.map((pattern) => (
          <div
            key={pattern.id}
            className="group bg-slate-900/50 backdrop-blur border border-slate-800 hover:border-purple-500/50 rounded-xl p-6 transition-all hover:shadow-cyber cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  {pattern.type === 'sequential' && <FiGitBranch className="w-6 h-6" />}
                  {pattern.type === 'frequency' && <FiActivity className="w-6 h-6" />}
                  {pattern.type === 'correlation' && <FiEye className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                    {pattern.name}
                  </h3>
                  <span className="text-xs px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-400">
                    {pattern.type}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-400">{pattern.confidence.toFixed(1)}%</div>
                <div className="text-xs text-slate-400">Confidence</div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-800/30 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">Occurrences</div>
                <div className="text-xl font-bold text-cyan-400">{pattern.occurrences}</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">Last Seen</div>
                <div className="text-sm text-white">{getTimeAgo(pattern.lastSeen)}</div>
              </div>
            </div>

            {/* Pattern Signature */}
            <div className="bg-slate-800/20 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-2">Signature</div>
              <div className="text-xs font-mono text-slate-300 overflow-x-auto">
                {JSON.stringify(pattern.signature, null, 2)}
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="mt-4">
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                  style={{ width: `${pattern.confidence}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
