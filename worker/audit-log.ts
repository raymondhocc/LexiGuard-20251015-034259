import { DurableObject } from 'cloudflare:workers';
import type { Env } from './core-utils';
import type { AuditLogEntry } from './types';
export class AuditLog extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  async addLogEntry(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry> {
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    const newEntry: AuditLogEntry = {
      ...entry,
      id,
      timestamp,
    };
    // Use timestamp for sortable keys
    await this.ctx.storage.put(timestamp.toString(), newEntry);
    return newEntry;
  }
  async listLogEntries(options?: DurableObjectListOptions): Promise<AuditLogEntry[]> {
    const entriesMap = await this.ctx.storage.list<AuditLogEntry>(options);
    const entries: AuditLogEntry[] = Array.from(entriesMap.values());
    // Sort descending (newest first)
    return entries.sort((a, b) => b.timestamp - a.timestamp);
  }
}