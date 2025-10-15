import type { Case, CaseStatus } from '../../worker/types';
// Export types for use in other frontend components
export type { Case, CaseStatus };
class CaseApiService {
  private baseUrl = '/api/cases';
  private async handleResponse<T>(response: Response): Promise<{ success: boolean; data?: T; error?: string }> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
      return { success: false, error: errorData.error || 'An unknown error occurred' };
    }
    const data = await response.json();
    return { success: true, data: data.data };
  }
  async createCase(caseData: Omit<Case, 'id' | 'createdAt' | 'lastModified'>): Promise<{ success: boolean; data?: Case; error?: string }> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(caseData),
    });
    return this.handleResponse<Case>(response);
  }
  async getCases(): Promise<{ success: boolean; data?: Case[]; error?: string }> {
    const response = await fetch(this.baseUrl);
    return this.handleResponse<Case[]>(response);
  }
  async getCase(id: string): Promise<{ success: boolean; data?: Case; error?: string }> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    return this.handleResponse<Case>(response);
  }
  async updateCase(id: string, updates: Partial<Omit<Case, 'id' | 'createdAt'>>): Promise<{ success: boolean; data?: Case; error?: string }> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return this.handleResponse<Case>(response);
  }
  async deleteCase(id: string): Promise<{ success: boolean; error?: string }> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
        return { success: true };
    }
    return this.handleResponse(response);
  }
}
export const caseService = new CaseApiService();