'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { FiClock, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const TemporalAnalysis = () => {
  const [trendData, setTrendData] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any[]>([]);
  const [trend, setTrend] = useState<'increasing' | 'decreasing' | 'stable'>('stable');

  useEffect(() => {
    // Generate time series data with trend
    const generateData = () => {
      const data = [];
      const forecastData = [];
      const now = Date.now();
      let value = 100;
      
      // Historical data (24 hours)
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now - i * 60 * 60 * 1000);
        value += (Math.random() - 0.4) * 10; // Slight upward trend
        
        data.push({
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          actual: Math.max(0, value + (Math.random() - 0.5) * 20),
          timestamp: time.getTime(),
        });
      }
      
      // Forecast (6 hours)
      for (let i = 1; i <= 6; i++) {
        const time = new Date(now + i * 60 * 60 * 1000);
        value += 5; // Continue trend
        
        forecastData.push({
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          forecast: value,
          upper: value + 15,
          lower: value - 15,
          timestamp: time.getTime(),
        });
      }
      
      return { data, forecastData };
    };

    const { data, forecastData } = generateData();
    setTrendData(data);
    setForecast(forecastData);
    setTrend('increasing');
  }, []);

  const allData = [...trendData, ...forecast.map(f => ({ ...f, actual: null }))];

  return (
    <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <FiClock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Temporal Analysis</h2>
            <p className="text-sm text-slate-400">Trend detection and forecasting</p>
          </div>
        </div>
        
        {/* Trend Indicator */}
        <div className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
          {trend === 'increasing' ? (
            <><FiTrendingUp className="w-5 h-5 text-green-400" /><span className="text-sm text-green-400">Increasing</span></>
          ) : trend === 'decreasing' ? (
            <><FiTrendingDown className="w-5 h-5 text-red-400" /><span className="text-sm text-red-400">Decreasing</span></>
          ) : (
            <><span className="text-sm text-slate-400">Stable</span></>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={allData}>
          <defs>
            <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#00f3ff" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis 
            dataKey="time"
            stroke="#64748b"
            style={{ fontSize: '11px' }}
            interval="preserveStartEnd"
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
          <Legend />
          <ReferenceLine
            x={trendData.length > 0 ? trendData[trendData.length - 1].time : ''}
            stroke="#64748b"
            strokeDasharray="3 3"
            label={{ value: 'Now', fill: '#64748b', fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#00f3ff"
            strokeWidth={2}
            dot={false}
            name="Actual"
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#9d00ff"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Forecast"
          />
          <Line
            type="monotone"
            dataKey="upper"
            stroke="#9d00ff"
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={false}
            strokeOpacity={0.3}
            name="Upper Bound"
          />
          <Line
            type="monotone"
            dataKey="lower"
            stroke="#9d00ff"
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={false}
            strokeOpacity={0.3}
            name="Lower Bound"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TemporalAnalysis;
