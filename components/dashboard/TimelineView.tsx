'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiFilter } from 'react-icons/fi';

interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  severity: string;
  icon?: string;
}

const TimelineView = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [timeRange, setTimeRange] = useState('1h');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Simulated data - in production, fetch from API
        const mockEvents: TimelineEvent[] = [
          {
            id: '1',
            type: 'anomaly',
            title: 'Anomaly Detected',
            description: 'Response time spike detected on /api/users endpoint',
            timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
            severity: 'high',
          },
          {
            id: '2',
            type: 'pattern',
            title: 'Pattern Identified',
            description: 'Sequential login failure pattern detected',
            timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
            severity: 'medium',
          },
          {
            id: '3',
            type: 'alert',
            title: 'Threshold Exceeded',
            description: 'Error rate exceeded 5% threshold',
            timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
            severity: 'critical',
          },
        ];
        setEvents(mockEvents);
      } catch (error) {
        console.error('Failed to fetch timeline events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [timeRange]);

  const getEventColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'border-red-500',
      high: 'border-orange-500',
      medium: 'border-yellow-500',
      low: 'border-blue-500',
      info: 'border-slate-500',
    };
    return colors[severity] || colors.info;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Event Timeline</h2>
          <p className="text-sm text-slate-400 mt-1">Chronological system events</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center space-x-2">
          <FiFilter className="w-4 h-4 text-slate-400" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-cyan-500"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-blue-500 to-purple-500 opacity-30"></div>

        {/* Events */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-sm text-slate-500">Loading timeline...</div>
          ) : events.length === 0 ? (
            <div className="text-sm text-slate-500">No events in selected time range</div>
          ) : (
            events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-12"
              >
                {/* Timeline Dot */}
                <div className={`absolute left-2 w-5 h-5 rounded-full border-2 ${getEventColor(event.severity)} bg-slate-900 flex items-center justify-center`}>
                  <FiClock className="w-3 h-3" />
                </div>

                {/* Event Card */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-cyan-500/50 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-sm">{event.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">{event.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${getEventColor(event.severity)} border`}>
                      {event.severity}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                    <span>{new Date(event.timestamp).toLocaleString()}</span>
                    <span className="px-2 py-0.5 bg-slate-700 rounded">{event.type}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TimelineView;
