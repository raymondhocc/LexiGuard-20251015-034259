import type { Document, DocumentMetadata, DocumentStatus, DocumentVersion, AISuggestion } from '../../worker/types';
// Export types for use in other frontend components
export type { Document, DocumentMetadata, DocumentStatus, DocumentVersion, AISuggestion };
class DocumentApiService {
  private baseUrl = '/api/documents';
  private async handleResponse<T>(response: Response): Promise<{ success: boolean; data?: T; error?: string }> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
      return { success: false, error: errorData.error || 'An unknown error occurred' };
    }
    const data = await response.json();
    return { success: true, data: data.data };
  }
  async createDocument(docData: { title: string; content: string; status?: DocumentStatus; tags?: string[] }): Promise<{ success: boolean; data?: Document; error?: string }> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ownerId: 'mock-user', ...docData }),
    });
    return this.handleResponse<Document>(response);
  }
  async getDocuments(): Promise<{ success: boolean; data?: DocumentMetadata[]; error?: string }> {
    const response = await fetch(this.baseUrl);
    return this.handleResponse<DocumentMetadata[]>(response);
  }
  async getDocument(id: string): Promise<{ success: boolean; data?: Document; error?: string }> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    return this.handleResponse<Document>(response);
  }
  async updateDocument(id: string, updates: Partial<Omit<Document, 'id' | 'createdAt'>>): Promise<{ success: boolean; data?: Document; error?: string }> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return this.handleResponse<Document>(response);
  }
  async deleteDocument(id: string): Promise<{ success: boolean; error?: string }> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
        return { success: true };
    }
    return this.handleResponse(response);
  }
  async getDocumentVersions(id: string): Promise<{ success: boolean; data?: DocumentVersion[]; error?: string }> {
    const response = await fetch(`${this.baseUrl}/${id}/versions`);
    return this.handleResponse<DocumentVersion[]>(response);
  }
  async applyAISuggestion(documentId: string, suggestion: AISuggestion): Promise<{ success: boolean; data?: Document; error?: string }> {
    const response = await fetch(`${this.baseUrl}/${documentId}/apply-suggestion`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestion }),
    });
    return this.handleResponse<Document>(response);
  }
}
export const documentService = new DocumentApiService();