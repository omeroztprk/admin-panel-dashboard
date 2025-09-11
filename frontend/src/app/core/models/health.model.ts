export interface SystemHealth {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  services: {
    database: string;
    memory: { used: string; total: string };
  };
}