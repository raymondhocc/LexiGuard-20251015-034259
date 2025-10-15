import { DurableObject } from 'cloudflare:workers';
import type { Env } from './core-utils';
import type { Case } from './types';
export class CaseManagement extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  async createCase(caseData: Omit<Case, 'id' | 'createdAt' | 'lastModified'>): Promise<Case> {
    const id = crypto.randomUUID();
    const now = Date.now();
    const newCase: Case = {
      ...caseData,
      id,
      createdAt: now,
      lastModified: now,
    };
    await this.ctx.storage.put(id, newCase);
    return newCase;
  }
  async getCase(id: string): Promise<Case | undefined> {
    return this.ctx.storage.get<Case>(id);
  }
  async updateCase(id: string, updates: Partial<Omit<Case, 'id' | 'createdAt'>>): Promise<Case | undefined> {
    const caseData = await this.ctx.storage.get<Case>(id);
    if (!caseData) {
      return undefined;
    }
    const updatedCase: Case = {
      ...caseData,
      ...updates,
      lastModified: Date.now(),
    };
    await this.ctx.storage.put(id, updatedCase);
    return updatedCase;
  }
  async deleteCase(id: string): Promise<boolean> {
    return this.ctx.storage.delete(id);
  }
  async listCases(): Promise<Case[]> {
    const casesMap = await this.ctx.storage.list<Case>();
    const cases: Case[] = Array.from(casesMap.values());
    return cases.sort((a, b) => b.lastModified - a.lastModified);
  }
}