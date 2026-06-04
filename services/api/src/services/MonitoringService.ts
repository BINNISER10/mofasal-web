import prisma from '../config/database';
import redisService from './RedisService';
import logger from '../utils/logger';

class MonitoringService {
  private startTime: Date;
  private requestCount = 0;
  private errorCount = 0;
  private metricsCache: Record<string, number> = {};

  constructor() {
    this.startTime = new Date();
  }

  incrementRequestCount() {
    this.requestCount++;
  }

  incrementErrorCount() {
    this.errorCount++;
  }

  recordMetric(name: string, value: number) {
    this.metricsCache[name] = value;
  }

  async getHealth() {
    const checks: Record<string, { status: string; latency?: number }> = {};

    const dbStart = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = { status: 'healthy', latency: Date.now() - dbStart };
    } catch {
      checks.database = { status: 'unhealthy' };
    }

    const redisStart = Date.now();
    try {
      await redisService.ping();
      checks.redis = { status: 'healthy', latency: Date.now() - redisStart };
    } catch {
      checks.redis = { status: 'unhealthy' };
    }

    const uptime = Math.floor((Date.now() - this.startTime.getTime()) / 1000);

    return {
      success: true,
      message: 'MUFASAL API is running',
      data: {
        status: Object.values(checks).every((c) => c.status === 'healthy') ? 'healthy' : 'degraded',
        uptime,
        uptimeHuman: this.formatUptime(uptime),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        checks,
      },
    };
  }

  async getMetrics() {
    const uptime = Math.floor((Date.now() - this.startTime.getTime()) / 1000);

    const metrics = {
      uptime_seconds: uptime,
      requests_total: this.requestCount,
      errors_total: this.errorCount,
      error_rate: this.requestCount > 0 ? ((this.errorCount / this.requestCount) * 100).toFixed(2) : '0.00',
      ...this.metricsCache,
    };

    let prometheusOutput = '# HELP mufasal_uptime_seconds Uptime in seconds\n';
    prometheusOutput += `# TYPE mufasal_uptime_seconds gauge\n`;
    prometheusOutput += `mufasal_uptime_seconds ${uptime}\n\n`;
    prometheusOutput += `# HELP mufasal_requests_total Total requests\n`;
    prometheusOutput += `# TYPE mufasal_requests_total counter\n`;
    prometheusOutput += `mufasal_requests_total ${this.requestCount}\n\n`;
    prometheusOutput += `# HELP mufasal_errors_total Total errors\n`;
    prometheusOutput += `# TYPE mufasal_errors_total counter\n`;
    prometheusOutput += `mufasal_errors_total ${this.errorCount}\n\n`;
    prometheusOutput += `# HELP mufasal_error_rate Error rate percentage\n`;
    prometheusOutput += `# TYPE mufasal_error_rate gauge\n`;
    prometheusOutput += `mufasal_error_rate ${metrics.error_rate}\n`;

    return {
      json: metrics,
      prometheus: prometheusOutput,
    };
  }

  async checkDatabase(): Promise<{ status: string; latency: number }> {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', latency: Date.now() - start };
  }

  async checkRedis(): Promise<{ status: string; latency: number }> {
    const start = Date.now();
    await redisService.ping();
    return { status: 'healthy', latency: Date.now() - start };
  }

  private formatUptime(seconds: number): string {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const parts: string[] = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
  }
}

export const monitoringService = new MonitoringService();
export default monitoringService;
