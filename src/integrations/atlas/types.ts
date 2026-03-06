export interface AtlasMessage {
  id: string;
  type: 'notification' | 'query' | 'response' | 'alert';
  priority: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  timestamp: Date;
  payload: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface AtlasNotification {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  data: Record<string, any>;
  timestamp: Date;
  read: boolean;
}

export interface DataExchangeProtocol {
  version: string;
  messageType: string;
  correlationId?: string;
  timestamp: Date;
  data: any;
}

export interface AtlasInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'trend' | 'relationship';
  confidence: number;
  description: string;
  evidence: any[];
  recommendations?: string[];
  createdAt: Date;
}
