
export enum RiskLevel {
  SAFE = 'SAFE',
  CAUTION = 'CAUTION',
  UNSAFE = 'UNSAFE'
}

export interface Location {
  latitude: number;
  longitude: number;
  regionName?: string;
}

export interface WaterParameters {
  pH?: number;
  tds?: number; // Total Dissolved Solids in ppm
  turbidity?: string; // Low, Med, High
  nitrates?: number;
  chlorine?: number;
  contaminants?: string[];
}

export interface HealthAlert {
  title: string;
  description: string;
  severity: 'high' | 'medium';
}

export interface AnalysisResult {
  riskLevel: RiskLevel;
  score: number; // 0-100
  summary: string;
  simpleExplanation: string;
  parameters: WaterParameters;
  recommendations: string[];
  alerts: HealthAlert[];
  timestamp: string;
  location?: Location;
}

export interface WaterSample {
  id: string;
  timestamp: string;
  image?: string; // base64
  manualData?: WaterParameters;
  result?: AnalysisResult;
  location?: Location;
}

export interface Hotspot {
  id: string;
  region: string;
  avgScore: number;
  riskCount: number;
  dominantIssue: string;
  lat: number;
  lng: number;
}
