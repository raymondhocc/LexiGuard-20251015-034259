import { documentService } from './document-service';
import { auditService } from './audit-service';
import { caseService } from './case-service';
import type { DocumentMetadata } from './document-service';
import type { Case } from './case-service';
import { differenceInDays, parseISO, startOfQuarter, format } from 'date-fns';
export interface DashboardMetrics {
  documentsProcessed: number;
  risksFlagged: number;
  avgCaseResolutionDays: number;
}
export interface ChartDataPoint {
  name: string;
  [key: string]: any;
}
class ReportingApiService {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const [docsRes, casesRes] = await Promise.all([
      documentService.getDocuments(),
      caseService.getCases(),
    ]);
    const documentsProcessed = docsRes.success && docsRes.data ? docsRes.data.length : 0;
    // Placeholder for risks flagged, as we don't have a direct service for it yet.
    // We can simulate it based on cases for now.
    const risksFlagged = casesRes.success && casesRes.data ? casesRes.data.filter(c => c.status !== 'CLOSED').length : 0;
    let totalResolutionDays = 0;
    let resolvedCasesCount = 0;
    if (casesRes.success && casesRes.data) {
      casesRes.data.forEach(c => {
        if (c.status === 'CLOSED') {
          totalResolutionDays += differenceInDays(new Date(c.lastModified), new Date(c.createdAt));
          resolvedCasesCount++;
        }
      });
    }
    const avgCaseResolutionDays = resolvedCasesCount > 0 ? Math.round(totalResolutionDays / resolvedCasesCount) : 0;
    return { documentsProcessed, risksFlagged, avgCaseResolutionDays };
  }
  async getComplianceTrendData(): Promise<ChartDataPoint[]> {
    const casesRes = await caseService.getCases();
    if (!casesRes.success || !casesRes.data) return [];
    const quarterlyData: { [key: string]: { score: number, count: number } } = {};
    casesRes.data.forEach(c => {
      const quarter = format(new Date(c.createdAt), 'yyyy-QQ');
      if (!quarterlyData[quarter]) {
        quarterlyData[quarter] = { score: 0, count: 0 };
      }
      // Mock score: closed cases are compliant (100), open are not (80)
      quarterlyData[quarter].score += c.status === 'CLOSED' ? 100 : 85;
      quarterlyData[quarter].count++;
    });
    return Object.entries(quarterlyData)
      .map(([name, { score, count }]) => ({
        name: name.replace('-', ' Q'),
        score: Math.round(score / count),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  async getRiskDistributionData(): Promise<ChartDataPoint[]> {
     const casesRes = await caseService.getCases();
    if (!casesRes.success || !casesRes.data) return [];
    const distribution: { [key: string]: number } = {
        'AML': 0,
        'GDPR': 0,
        'KYC': 0,
        'Fraud': 0,
        'Other': 0,
    };
    casesRes.data.forEach(c => {
        const title = c.title.toLowerCase();
        if (title.includes('aml')) distribution['AML']++;
        else if (title.includes('gdpr')) distribution['GDPR']++;
        else if (title.includes('kyc')) distribution['KYC']++;
        else if (title.includes('fraud')) distribution['Fraud']++;
        else distribution['Other']++;
    });
    return Object.entries(distribution)
        .map(([name, value]) => ({ name, value }))
        .filter(d => d.value > 0);
  }
  async getCaseResolutionData(): Promise<ChartDataPoint[]> {
    const casesRes = await caseService.getCases();
    if (!casesRes.success || !casesRes.data) return [];
    const monthlyData: { [key: string]: { totalDays: number, count: number } } = {};
    casesRes.data.forEach(c => {
        if (c.status === 'CLOSED') {
            const month = format(new Date(c.lastModified), 'yyyy-MM');
            if (!monthlyData[month]) {
                monthlyData[month] = { totalDays: 0, count: 0 };
            }
            monthlyData[month].totalDays += differenceInDays(new Date(c.lastModified), new Date(c.createdAt));
            monthlyData[month].count++;
        }
    });
    return Object.entries(monthlyData)
        .map(([name, { totalDays, count }]) => ({
            name: format(new Date(name), 'MMM yy'),
            days: Math.round(totalDays / count),
        }))
        .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  }
}
export const reportingService = new ReportingApiService();