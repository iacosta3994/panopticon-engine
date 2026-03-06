export interface NotionPage {
  id: string;
  title: string;
  content: any[];
  properties?: Record<string, any>;
}

export interface NotionDatabase {
  id: string;
  title: string;
  properties: Record<string, any>;
}

export interface ReportTemplate {
  type: 'anomaly' | 'pattern' | 'insight' | 'summary';
  title: string;
  sections: ReportSection[];
}

export interface ReportSection {
  heading: string;
  content: string;
  blocks?: any[];
}

export interface NotionBlock {
  type: string;
  [key: string]: any;
}
