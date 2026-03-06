'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useLiveData } from '@/hooks/useLiveData';

interface Anomaly {
  id: string;
  value: number;
  expectedValue: number;
  score: number;
  timestamp: string;
  method: string;
}

const AnomalyDisplay = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const { data: anomalies, loading, isConnected } = useLiveData<Anomaly>({
    room: 'anomalies',
    event: 'anomaly:detected',
    maxItems: 50,
  });

  useEffect(() => {
    // Transform anomalies for chart
    const transformed = anomalies.slice(0, 20).reverse().map((a) => ({
      time: new Date(a.timestamp).toLocaleTimeString(),
      value: a.value,
      expected: a.expectedValue,
      score: a.score,
    }));
    setChartData(transformed);
  }, [anomalies]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Anomaly Detection</h2>
          <p className="text-sm text-slate-400 mt-1">Real-time statistical analysis</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
          <span className="text-xs text-slate-400">{isConnected ? 'Live' : 'Disconnected'}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#00f3ff"
              strokeWidth={2}
              dot={{ fill: '#00f3ff', r: 4 }}
              name="Actual"
            />
            <Line
              type="monotone"
              dataKey="expected"
              stroke="#9d00ff"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Expected"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Anomalies */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Recent Detections</h3>
        {loading ? (
          <div className="text-sm text-slate-500">Loading anomalies...</div>
        ) : anomalies.length === 0 ? (
          <div className="text-sm text-slate-500">No anomalies detected</div>
        ) : (
          anomalies.slice(0, 5).map((anomaly) => (
            <div
              key={anomaly.id}
              className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-cyan-500/50 transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <div>
                  <div className="text-sm font-medium">Score: {anomaly.score.toFixed(2)}</div>
                  <div className="text-xs text-slate-400">{anomaly.method}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono text-cyan-400">{anomaly.value.toFixed(2)}</div>
                <div className="text-xs text-slate-500">
                  exp: {anomaly.expectedValue.toFixed(2)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default AnomalyDisplay;
