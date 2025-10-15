export interface ApiResponse<T = unknown> { success: boolean; data?: T; error?: string; }
export interface WeatherResult {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
}
export interface MCPResult {
  content: string;
}
export interface ErrorResult {
  error: string;
}
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  id: string;
  toolCalls?: ToolCall[];
}
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
}
export interface ChatState {
  messages: Message[];
  sessionId: string;
  isProcessing: boolean;
  model: string;
  streamingMessage?: string;
}
export interface SessionInfo {
  id: string;
  title: string;
  createdAt: number;
  lastActive: number;
}
export interface Tool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, unknown>;
    required: string[];
  };
}
// Document Types
export type DocumentStatus = 'draft' | 'in-review' | 'approved' | 'archived';
export interface DocumentVersion {
  version: number;
  timestamp: number;
  userId: string;
  changesSummary: string;
  documentContent: string;
}
export interface DocumentMetadata {
  id: string;
  title: string;
  createdAt: number;
  lastModified: number;
  status: DocumentStatus;
  tags: string[];
  ownerId: string; // For multi-user systems in the future
}
export interface Document extends DocumentMetadata {
  content: string;
  versions: DocumentVersion[];
}
// AI Suggestion Types
export type AISuggestionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export interface AISuggestion {
  id: string;
  type: 'ADDITION' | 'REMOVAL' | 'REPLACEMENT';
  content: string;
  originalContent?: string;
  status: AISuggestionStatus;
  timestamp: number;
}
// Audit Log Types
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'LOGIN' | 'LOGOUT' | 'AI_DRAFT';
export type EntityType = 'DOCUMENT' | 'CASE' | 'USER' | 'RULE';
export interface AuditLogEntry {
  id: string;
  timestamp: number;
  userId: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  details: Record<string, any>;
}
// Case Management Types
export type CaseStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'CLOSED' | 'ARCHIVED';
export interface Case {
  id: string;
  title: string;
  description: string;
  status: CaseStatus;
  assignedTo: string; // userId
  createdAt: number;
  lastModified: number;
  documents: string[]; // array of document IDs
  logs: string[]; // array of audit log IDs related to this case
}
// New Compliance & Risk Types
export type ComplianceRuleSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  severity: ComplianceRuleSeverity;
  isActive: boolean;
}
export type RiskFlagStatus = 'PENDING' | 'ADDRESSED' | 'IGNORED';
export interface RiskFlag {
  id: string;
  documentId: string;
  ruleId: string;
  flaggedContent: string;
  severity: ComplianceRuleSeverity;
  status: RiskFlagStatus;
  timestamp: number;
}