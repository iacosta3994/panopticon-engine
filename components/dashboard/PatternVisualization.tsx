'use client';

import { useEffect, useState } from 'react';
import { FiEye, FiTrendingUp } from 'react-icons/fi';

interface Pattern {
  id: string;
  name: string;
  type: string;
  confidence: number;
  occurrences: number;
  lastSeen: Date;
}

const PatternVisualization = () => {
  const [patterns, setPatterns] = useState<Pattern[]>([]);

  useEffect(() => {
    // Fetch patterns from API
    const fetchPatterns = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/analysis/patterns');
        if (response.ok) {
          const data = await response.json();
          setPatterns(data.patterns.slice(0, 10));
        }
      } catch (error) {
        // Use mock data if API fails
        setPatterns(generateMockPatterns());
      }
    };

    fetchPatterns();
    const interval = setInterval(fetchPatterns, 30000);

    return () => clearInterval(interval);
  }, []);

  const generateMockPatterns = (): Pattern[] => {
    return [
      {
        id: '1',
        name: 'Sequential Login Failures',
        type: 'sequential',
        confidence: 95.5,
        occurrences: 42,
        lastSeen: new Date(),
      },
      {
        id: '2',
        name: 'API Rate Limit Pattern',
        type: 'frequency',
        confidence: 88.2,
        occurrences: 156,
        lastSeen: new Date(Date.now() - 300000),
      },
      {
        id: '3',
        name: 'Database Connection Spike',
        type: 'correlation',
        confidence: 92.1,
        occurrences: 23,
        lastSeen: new Date(Date.now() - 600000),
      },
    ];
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <FiEye className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Active Patterns</h2>
            <p className="text-xs text-slate-400">Detected patterns</p>
          </div>
        </div>
        <div className="text-2xl font-bold text-purple-400">{patterns.length}</div>
      </div>

      <div className="space-y-3">
        {patterns.map((pattern, index) => (
          <div
            key={pattern.id}
            className="group p-4 bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/50 rounded-lg transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white group-hover:text-purple-400 transition-colors">
                  {pattern.name}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-purple-400">
                    {pattern.type}
                  </span>
                  <span className="text-xs text-slate-400">
                    {pattern.occurrences} occurrences
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-purple-400">
                  {pattern.confidence.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500">confidence</div>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="mt-3">
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                  style={{ width: `${pattern.confidence}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {patterns.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <FiEye className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No patterns detected yet</p>
        </div>
      )}
    </div>
  );
};

export default PatternVisualization;
