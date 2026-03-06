'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

interface Pattern {
  id: string;
  name: string;
  pattern_type: string;
  confidence_score: number;
  occurrence_count: number;
}

const PatternVisualization = () => {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatterns = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/analysis/patterns');
        if (response.ok) {
          const data = await response.json();
          setPatterns(data.patterns || []);
        }
      } catch (error) {
        console.error('Failed to fetch patterns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatterns();
    const interval = setInterval(fetchPatterns, 30000);

    return () => clearInterval(interval);
  }, []);

  const chartData = patterns.slice(0, 10).map((p) => ({
    name: p.name.substring(0, 20) + '...',
    occurrences: p.occurrence_count,
    confidence: p.confidence_score,
    type: p.pattern_type,
  }));

  const getColorForType = (type: string) => {
    const colors: Record<string, string> = {
      sequential: '#00f3ff',
      frequency: '#9d00ff',
      correlation: '#ff00ea',
      anomaly: '#00ff9f',
    };
    return colors[type] || '#00f3ff';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Pattern Analysis</h2>
          <p className="text-sm text-slate-400 mt-1">Detected behavioral patterns</p>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-slate-400">Total:</span>
          <span className="text-cyan-400 font-bold">{patterns.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="text-slate-500">Loading patterns...</div>
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <div className="text-slate-500">No patterns detected yet</div>
        </div>
      ) : (
        <>
          {/* Chart */}
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '11px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="occurrences" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColorForType(entry.type)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pattern Types Legend */}
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#00f3ff]"></div>
              <span className="text-slate-400">Sequential</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#9d00ff]"></div>
              <span className="text-slate-400">Frequency</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#ff00ea]"></div>
              <span className="text-slate-400">Correlation</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#00ff9f]"></div>
              <span className="text-slate-400">Anomaly</span>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default PatternVisualization;
