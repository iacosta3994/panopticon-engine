'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const MetricsOverview = () => {
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);

  useEffect(() => {
    // Generate mock data for visualization
    // In production, this would fetch from API
    const generateData = () => {
      const data = [];
      const now = Date.now();
      
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now - i * 60 * 60 * 1000);
        data.push({
          time: time.toLocaleTimeString('en-US', { hour: '2-digit' }),
          observations: Math.floor(Math.random() * 1000) + 500,
          anomalies: Math.floor(Math.random() * 20),
          alerts: Math.floor(Math.random() * 10),
        });
      }
      
      return data;
    };

    setTimeSeriesData(generateData());

    // Update every minute
    const interval = setInterval(() => {
      setTimeSeriesData(generateData());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">System Metrics</h2>
          <p className="text-sm text-slate-400 mt-1">Last 24 hours</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-xs bg-cyan-500/20 border border-cyan-500/30 rounded-md text-cyan-400 hover:bg-cyan-500/30 transition-colors">
            24h
          </button>
          <button className="px-3 py-1 text-xs text-slate-400 hover:bg-slate-800 rounded-md transition-colors">
            7d
          </button>
          <button className="px-3 py-1 text-xs text-slate-400 hover:bg-slate-800 rounded-md transition-colors">
            30d
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={timeSeriesData}>
          <defs>
            <linearGradient id="colorObs" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00f3ff" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorAnom" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9d00ff" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#9d00ff" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis 
            dataKey="time" 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          <Area
            type="monotone"
            dataKey="observations"
            stroke="#00f3ff"
            fillOpacity={1}
            fill="url(#colorObs)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="anomalies"
            stroke="#9d00ff"
            fillOpacity={1}
            fill="url(#colorAnom)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex justify-center space-x-6 mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
          <span className="text-xs text-slate-400">Observations</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <span className="text-xs text-slate-400">Anomalies</span>
        </div>
      </div>
    </div>
  );
};

export default MetricsOverview;
