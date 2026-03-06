'use client';

import { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';

const RelationshipGraph = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        // Simulated graph data - in production, fetch from API
        const mockNodes: Node[] = [
          {
            id: '1',
            type: 'default',
            data: { label: 'User API' },
            position: { x: 250, y: 0 },
            style: {
              background: 'linear-gradient(to br, #00f3ff, #0080ff)',
              color: 'white',
              border: '2px solid #00f3ff',
              borderRadius: '8px',
              padding: '10px',
            },
          },
          {
            id: '2',
            data: { label: 'Auth Service' },
            position: { x: 100, y: 100 },
            style: {
              background: 'linear-gradient(to br, #9d00ff, #5000ff)',
              color: 'white',
              border: '2px solid #9d00ff',
              borderRadius: '8px',
              padding: '10px',
            },
          },
          {
            id: '3',
            data: { label: 'Database' },
            position: { x: 400, y: 100 },
            style: {
              background: 'linear-gradient(to br, #ff00ea, #ff0080)',
              color: 'white',
              border: '2px solid #ff00ea',
              borderRadius: '8px',
              padding: '10px',
            },
          },
          {
            id: '4',
            data: { label: 'Cache Layer' },
            position: { x: 250, y: 200 },
            style: {
              background: 'linear-gradient(to br, #00ff9f, #00ff00)',
              color: 'white',
              border: '2px solid #00ff9f',
              borderRadius: '8px',
              padding: '10px',
            },
          },
        ];

        const mockEdges: Edge[] = [
          {
            id: 'e1-2',
            source: '1',
            target: '2',
            animated: true,
            style: { stroke: '#00f3ff' },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#00f3ff' },
          },
          {
            id: 'e1-3',
            source: '1',
            target: '3',
            animated: true,
            style: { stroke: '#9d00ff' },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#9d00ff' },
          },
          {
            id: 'e2-4',
            source: '2',
            target: '4',
            animated: true,
            style: { stroke: '#ff00ea' },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#ff00ea' },
          },
          {
            id: 'e3-4',
            source: '3',
            target: '4',
            animated: true,
            style: { stroke: '#00ff9f' },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#00ff9f' },
          },
        ];

        setNodes(mockNodes);
        setEdges(mockEdges);
      } catch (error) {
        console.error('Failed to fetch graph data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGraphData();
  }, [setNodes, setEdges]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold">Entity Relationship Graph</h2>
        <p className="text-sm text-slate-400 mt-1">Service dependencies and connections</p>
      </div>

      <div className="h-96 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-slate-500">Loading graph...</div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            style={{ background: '#020617' }}
          >
            <Controls className="bg-slate-800 border-slate-700" />
            <Background color="#1e293b" gap={16} />
          </ReactFlow>
        )}
      </div>
    </motion.div>
  );
};

export default RelationshipGraph;
