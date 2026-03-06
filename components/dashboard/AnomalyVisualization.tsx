'use client';

import { useEffect, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { FiAlertTriangle } from 'react-icons/fi';

interface Anomaly {
  id: string;
  timestamp: Date;
  value: number;
  expectedValue: number;
  score: number;
  severity: string;
}

const AnomalyVisualization = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);

  useEffect(() => {
    // Generate mock anomaly data
    const mockData: Anomaly[] = [];
    const now = Date.now();

    for (let i = 0; i < 20; i++) {
      const timestamp = new Date(now - Math.random() * 24 * 60 * 60 * 1000);
      const expectedValue = 100 + Math.random() * 50;
      const deviation = (Math.random() - 0.5) * 100;
      const value = expectedValue + deviation;
      const score = Math.abs(deviation) / 10;

      mockData.push({
        id: `anom-${i}`,
        timestamp,
        value,
        expectedValue,
        score,
        severity: score > 7 ? 'high' : score > 4 ? 'medium' : 'low',
      });
    }

    setAnomalies(mockData);
  }, []);

  const chartData = anomalies.map(a => ({
    x: a.expectedValue,
    y: a.value,
    z: a.score * 10,
    severity: a.severity,
  }));

  return (
    <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
            <FiAlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Anomaly Detection</h2>
            <p className="text-sm text-slate-400">Statistical outliers and deviations</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-red-400">{anomalies.length}</div>
          <div className="text-xs text-slate-400">Last 24h</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis 
            type="number"
            dataKey="x"
            name="Expected"
            stroke="#64748b"
            label={{ value: 'Expected Value', position: 'insideBottom', offset: -5, fill: '#64748b' }}
          />
          <YAxis 
            type="number"
            dataKey="y"
            name="Actual"
            stroke="#64748b"
            label={{ value: 'Actual Value', angle: -90, position: 'insideLeft', fill: '#64748b' }}
          />
          <ZAxis type="number" dataKey="z" range={[50, 400]} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          <Scatter
            name="Anomalies"
            data={chartData}
            fill="#ef4444"
            fillOpacity={0.6}
          />
        </ScatterChart>
      </ResponsiveContainer>

      {/* Recent Anomalies List */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Recent Detections</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {anomalies.slice(0, 5).map(anomaly => (
            <div
              key={anomaly.id}
              className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  anomaly.severity === 'high' ? 'bg-red-500' :
                  anomaly.severity === 'medium' ? 'bg-yellow-500' :
                  'bg-blue-500'
                } animate-pulse`}></div>
                <span className="text-sm text-slate-300">
                  {anomaly.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono text-slate-200">
                  {anomaly.value.toFixed(1)} <span className="text-slate-500">vs</span> {anomaly.expectedValue.toFixed(1)}
                </div>
                <div className="text-xs text-slate-400">Score: {anomaly.score.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnomalyVisualization;
