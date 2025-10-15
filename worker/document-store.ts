import { DurableObject } from 'cloudflare:workers';
import type { Env } from './core-utils';
import type { Document, DocumentMetadata, DocumentVersion } from './types';
export class DocumentStore extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  async createDocument(doc: Omit<Document, 'id' | 'createdAt' | 'lastModified' | 'versions'>): Promise<Document> {
    const id = crypto.randomUUID();
    const now = Date.now();
    const initialVersion: DocumentVersion = {
      version: 1,
      timestamp: now,
      userId: doc.ownerId || 'system',
      changesSummary: 'Initial document creation.',
      documentContent: doc.content,
    };
    const newDoc: Document = {
      ...doc,
      id,
      createdAt: now,
      lastModified: now,
      versions: [initialVersion],
    };
    await this.ctx.storage.put(id, newDoc);
    return newDoc;
  }
  async getDocument(id: string): Promise<Document | undefined> {
    return this.ctx.storage.get<Document>(id);
  }
  async updateDocument(id: string, updates: Partial<Omit<Document, 'id' | 'createdAt' | 'versions'>>): Promise<Document | undefined> {
    const doc = await this.ctx.storage.get<Document>(id);
    if (!doc) {
      return undefined;
    }
    const now = Date.now();
    const newVersionNumber = (doc.versions?.length || 0) + 1;
    const newVersion: DocumentVersion = {
      version: newVersionNumber,
      timestamp: now,
      userId: 'mock-user', // Replace with actual user ID in a real system
      changesSummary: updates.content !== doc.content ? 'Content updated.' : 'Metadata updated.',
      documentContent: doc.content, // Save the old content
    };
    const updatedDoc: Document = {
      ...doc,
      ...updates,
      lastModified: now,
      versions: [...(doc.versions || []), newVersion],
    };
    await this.ctx.storage.put(id, updatedDoc);
    return updatedDoc;
  }
  async deleteDocument(id: string): Promise<boolean> {
    return this.ctx.storage.delete(id);
  }
  async listDocuments(): Promise<DocumentMetadata[]> {
    const docs = await this.ctx.storage.list<Document>();
    const metadata: DocumentMetadata[] = [];
    for (const doc of docs.values()) {
      const { content, versions, ...meta } = doc;
      metadata.push(meta);
    }
    return metadata.sort((a, b) => b.lastModified - a.lastModified);
  }
  async getDocumentVersions(id: string): Promise<DocumentVersion[] | undefined> {
    const doc = await this.ctx.storage.get<Document>(id);
    return doc?.versions;
  }
  async getDocumentVersion(id: string, version: number): Promise<DocumentVersion | undefined> {
    const doc = await this.ctx.storage.get<Document>(id);
    return doc?.versions?.find(v => v.version === version);
  }
}