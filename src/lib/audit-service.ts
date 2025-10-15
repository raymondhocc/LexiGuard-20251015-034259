import type { AuditLogEntry, AuditAction, EntityType } from '../../worker/types';
// Export types for use in other frontend components
export type { AuditLogEntry, AuditAction, EntityType };
class AuditApiService {
  private baseUrl = '/api/audit';
  private async handleResponse<T>(response: Response): Promise<{ success: boolean; data?: T; error?: string }> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
      return { success: false, error: errorData.error || 'An unknown error occurred' };
    }
    const data = await response.json();
    return { success: true, data: data.data };
  }
  async addLogEntry(logData: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<{ success: boolean; data?: AuditLogEntry; error?: string }> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData),
    });
    return this.handleResponse<AuditLogEntry>(response);
  }
  async getLogEntries(): Promise<{ success: boolean; data?: AuditLogEntry[]; error?: string }> {
    const response = await fetch(this.baseUrl);
    return this.handleResponse<AuditLogEntry[]>(response);
  }
}
export const auditService = new AuditApiService();