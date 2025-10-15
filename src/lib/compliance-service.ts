import { documentService } from './document-service';
import { chatService } from './chat';
import type { ComplianceRule, RiskFlag } from '../../worker/types';
import { toast } from 'sonner';
export type { ComplianceRule, RiskFlag };
const COMPLIANCE_RULES_DOC_TITLE = "LexiGuard Compliance Rules";
class ComplianceApiService {
  private rulesDocId: string | null = null;
  private rulesCache: ComplianceRule[] | null = null;
  private async findRulesDocument(): Promise<string | null> {
    if (this.rulesDocId) return this.rulesDocId;
    const res = await documentService.getDocuments();
    if (res.success && res.data) {
      const rulesDoc = res.data.find(doc => doc.title === COMPLIANCE_RULES_DOC_TITLE);
      if (rulesDoc) {
        this.rulesDocId = rulesDoc.id;
        return this.rulesDocId;
      }
    }
    return null;
  }
  async getRules(): Promise<ComplianceRule[]> {
    if (this.rulesCache) return this.rulesCache;
    const docId = await this.findRulesDocument();
    if (!docId) {
      // If no rules doc, return empty and don't create one here
      return [];
    }
    const res = await documentService.getDocument(docId);
    if (res.success && res.data) {
      try {
        const rules = JSON.parse(res.data.content || '[]');
        this.rulesCache = rules;
        return rules;
      } catch (e) {
        toast.error("Failed to parse compliance rules.");
        return [];
      }
    }
    return [];
  }
  async saveRules(rules: ComplianceRule[]): Promise<boolean> {
    this.rulesCache = rules;
    const content = JSON.stringify(rules, null, 2);
    let docId = await this.findRulesDocument();
    if (docId) {
      const res = await documentService.updateDocument(docId, { content });
      return res.success;
    } else {
      const res = await documentService.createDocument({
        title: COMPLIANCE_RULES_DOC_TITLE,
        content,
        status: 'archived', // Hide from regular document list if needed
      });
      if (res.success && res.data) {
        this.rulesDocId = res.data.id;
        return true;
      }
    }
    return false;
  }
  async addRule(rule: Omit<ComplianceRule, 'id'>): Promise<boolean> {
    const rules = await this.getRules();
    const newRule: ComplianceRule = { ...rule, id: `rule-${crypto.randomUUID()}` };
    const updatedRules = [...rules, newRule];
    return this.saveRules(updatedRules);
  }
  async updateRule(updatedRule: ComplianceRule): Promise<boolean> {
    const rules = await this.getRules();
    const updatedRules = rules.map(rule => rule.id === updatedRule.id ? updatedRule : rule);
    return this.saveRules(updatedRules);
  }
  async deleteRule(ruleId: string): Promise<boolean> {
    const rules = await this.getRules();
    const updatedRules = rules.filter(rule => rule.id !== ruleId);
    return this.saveRules(updatedRules);
  }
  async getRiskFlagsForDocument(documentContent: string): Promise<RiskFlag[]> {
    const prompt = `Analyze the following document for compliance risks based on the configured rules. Document content: """${documentContent}"""`;
    
    // Make a non-streaming call to get the tool call response
    const response = await chatService.sendMessage(prompt);

    if (response.success && response.data) {
      const lastMessage = response.data.messages[response.data.messages.length - 1];
      if (lastMessage.role === 'assistant' && lastMessage.toolCalls) {
        const complianceToolCall = lastMessage.toolCalls.find(tc => tc.function.name === 'analyze_document_for_compliance_risks');
        if (complianceToolCall) {
          try {
            // The result of the tool call contains the risk flags as a JSON string
            if (complianceToolCall.result) {
              const riskFlags = JSON.parse(complianceToolCall.result);
              if (Array.isArray(riskFlags)) {
                return riskFlags as RiskFlag[];
              }
            }
          } catch (e) {
            toast.error("Failed to parse risk flags from AI response.");
            console.error("Error parsing tool call result:", e);
          }
        }
      }
    }
    
    return [];
  }
}
export const complianceService = new ComplianceApiService();