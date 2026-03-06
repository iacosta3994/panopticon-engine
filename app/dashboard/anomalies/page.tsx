'use client';

import { useEffect, useState } from 'react';
import { FiActivity, FiFilter } from 'react-icons/fi';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Generate mock anomaly data
    const mockAnomalies = Array.from({ length: 50 }, (_, i) => {
      const expected = 100 + Math.random() * 100;
      const deviation = (Math.random() - 0.5) * 80;
      return {
        id: i,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        expected,
        actual: expected + deviation,
        score: Math.abs(deviation) / 10,
        method: ['z-score', 'iqr', 'moving-average'][Math.floor(Math.random() * 3)],
        severity: Math.abs(deviation) > 40 ? 'high' : Math.abs(deviation) > 20 ? 'medium' : 'low',
      };
    });

    setAnomalies(mockAnomalies);
  }, []);

  const filteredAnomalies = filter === 'all'
    ? anomalies
    : anomalies.filter(a => a.severity === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 via-orange-500 to-yellow-600 bg-clip-text text-transparent">
            Anomaly Detection
          </h1>
          <p className="text-slate-400 mt-1">Statistical outliers and unusual patterns</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors">
            <FiFilter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-2">
        {['all', 'high', 'medium', 'low'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Scatter Plot */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Anomaly Distribution</h2>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              type="number"
              dataKey="expected"
              name="Expected"
              stroke="#64748b"
              label={{ value: 'Expected Value', position: 'insideBottom', offset: -5, fill: '#64748b' }}
            />
            <YAxis
              type="number"
              dataKey="actual"
              name="Actual"
              stroke="#64748b"
              label={{ value: 'Actual Value', angle: -90, position: 'insideLeft', fill: '#64748b' }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
              }}
              content={({ payload }) => {
                if (!payload || payload.length === 0) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                    <div className="text-white font-semibold mb-1">Anomaly #{data.id}</div>
                    <div className="text-xs text-slate-300 space-y-1">
                      <div>Expected: {data.expected.toFixed(2)}</div>
                      <div>Actual: {data.actual.toFixed(2)}</div>
                      <div>Score: {data.score.toFixed(2)}</div>
                      <div>Method: {data.method}</div>
                    </div>
                  </div>
                );
              }}
            />
            <Scatter data={filteredAnomalies}>
              {filteredAnomalies.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.severity === 'high' ? '#ef4444' : entry.severity === 'medium' ? '#f59e0b' : '#3b82f6'}
                  fillOpacity={0.7}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Anomaly List */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Detected Anomalies</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 text-left">
                <th className="pb-3 text-xs font-semibold text-slate-400 uppercase">Time</th>
                <th className="pb-3 text-xs font-semibold text-slate-400 uppercase">Expected</th>
                <th className="pb-3 text-xs font-semibold text-slate-400 uppercase">Actual</th>
                <th className="pb-3 text-xs font-semibold text-slate-400 uppercase">Score</th>
                <th className="pb-3 text-xs font-semibold text-slate-400 uppercase">Method</th>
                <th className="pb-3 text-xs font-semibold text-slate-400 uppercase">Severity</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnomalies.slice(0, 20).map((anomaly) => (
                <tr key={anomaly.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 text-sm text-slate-300">
                    {anomaly.timestamp.toLocaleTimeString()}
                  </td>
                  <td className="py-3 text-sm font-mono text-slate-300">
                    {anomaly.expected.toFixed(2)}
                  </td>
                  <td className="py-3 text-sm font-mono text-cyan-400">
                    {anomaly.actual.toFixed(2)}
                  </td>
                  <td className="py-3 text-sm font-mono text-purple-400">
                    {anomaly.score.toFixed(2)}
                  </td>
                  <td className="py-3">
                    <span className="text-xs px-2 py-1 bg-slate-700 rounded text-slate-300">
                      {anomaly.method}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      anomaly.severity === 'high' ? 'bg-red-500/20 border border-red-500/50 text-red-400' :
                      anomaly.severity === 'medium' ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400' :
                      'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                    }`}>
                      {anomaly.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
