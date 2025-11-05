// User types
export interface User {
  id: number;
  email: string;
  full_name?: string;
  role: 'user' | 'admin';
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// Scan types
export interface ScanRequest {
  domain: string;
  use_safelist?: boolean;
}

export interface ScanResult {
  id: number;
  domain: string;
  prediction: 'BENIGN' | 'SUSPICIOUS' | 'MALICIOUS' | 'UNKNOWN';
  confidence: number;
  method: string;
  reason: string;
  stage: string;
  latency_ms: number;
  typosquatting_target?: string;
  edit_distance?: number;
  safelist_tier?: string;
  features?: Record<string, any>;
  created_at: string;
}

export interface BatchScanRequest {
  domains: string[];
  use_safelist?: boolean;
}

export interface BatchJob {
  id: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_domains: number;
  processed_domains: number;
  malicious_count: number;
  suspicious_count: number;
  benign_count: number;
  progress_percentage: number;
  estimated_time_remaining?: number;
  created_at: string;
  completed_at?: string;
}

// Analytics types
export interface DashboardStats {
  total_scans: number;
  unique_domains: number;
  threat_rate: number;
  avg_processing_time: number;
  today_scans: number;
  week_scans: number;
  month_scans: number;
}

export interface TrendData {
  date: string;
  total_scans: number;
  malicious_count: number;
  suspicious_count: number;
  benign_count: number;
}

export interface TLDAnalysis {
  tld: string;
  total_count: number;
  malicious_count: number;
  suspicious_count: number;
  benign_count: number;
  risk_score: number;
}

export interface HeatmapData {
  hour: number;
  day: string;
  count: number;
}

// Safelist types
export interface SafelistDomain {
  id: number;
  domain: string;
  tier: 'tier1' | 'tier2' | 'tier3';
  notes?: string;
  added_by: number;
  source: 'system' | 'user';
  created_at: string;
}

export interface SafelistStats {
  total_domains: number;
  tier1_count: number;
  tier2_count: number;
  tier3_count: number;
  recently_added: number;
  safelist_hit_rate: number;
}

// Model types
export interface ModelInfo {
  version: string;
  architecture: string[];
  performance: {
    f1_score: number;
    accuracy: number;
    precision: number;
    recall: number;
    avg_latency_ms: number;
  };
  safelist: {
    enabled: boolean;
    total_domains: number;
  };
}

export interface FeatureInfo {
  name: string;
  importance: number;
  description: string;
  example?: string;
}

// History filters
export interface HistoryFilter {
  domain?: string;
  result?: 'BENIGN' | 'SUSPICIOUS' | 'MALICIOUS';
  min_confidence?: number;
  max_confidence?: number;
  start_date?: string;
  end_date?: string;
  batch_only?: boolean;
  page?: number;
  page_size?: number;
}
