import type { WeatherResult, ErrorResult, ComplianceRule, RiskFlag } from './types';
import { mcpManager } from './mcp-client';
export type ToolResult = WeatherResult | { content: string } | RiskFlag[] | ErrorResult;
interface SerpApiResponse {
  knowledge_graph?: { title?: string; description?: string; source?: { link?: string } };
  answer_box?: { answer?: string; snippet?: string; title?: string; link?: string };
  organic_results?: Array<{ title?: string; link?: string; snippet?: string }>;
  local_results?: Array<{ title?: string; address?: string; phone?: string; rating?: number }>;
  error?: string;
}
const customTools = [
  {
    type: 'function' as const,
    function: {
      name: 'get_weather',
      description: 'Get current weather information for a location',
      parameters: {
        type: 'object',
        properties: { location: { type: 'string', description: 'The city or location name' } },
        required: ['location']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'web_search',
      description: 'Search the web using Google or fetch content from a specific URL',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query for Google search' },
          url: { type: 'string', description: 'Specific URL to fetch content from (alternative to search)' },
          num_results: { type: 'number', description: 'Number of search results to return (default: 5, max: 10)', default: 5 }
        },
        required: []
      }
    }
  },
  {
    type: 'function' as const,
    function: {
        name: 'analyze_document_for_compliance_risks',
        description: 'Analyzes document content against a predefined set of compliance rules to identify potential risks.',
        parameters: {
            type: 'object',
            properties: {
                documentContent: { type: 'string', description: 'The full text content of the document to analyze.' },
                ruleIds: { type: 'array', items: { type: 'string' }, description: 'Optional array of rule IDs to check against. If empty, all active rules are used.' }
            },
            required: ['documentContent']
        }
    }
  }
];
export async function getToolDefinitions() {
  const mcpTools = await mcpManager.getToolDefinitions();
  return [...customTools, ...mcpTools];
}
async function getComplianceRules(env: Env): Promise<ComplianceRule[]> {
    try {
        if (!env.DOCUMENT_STORE) {
            console.error("DOCUMENT_STORE Durable Object not available in env.");
            return [];
        }
        const id = env.DOCUMENT_STORE.idFromName('default');
        const stub = env.DOCUMENT_STORE.get(id);
        const documents = await stub.listDocuments();
        const rulesDoc = documents.find(doc => doc.title === 'LexiGuard Compliance Rules');
        if (!rulesDoc) {
            console.error("'LexiGuard Compliance Rules' document not found.");
            return [];
        }
        const doc = await stub.getDocument(rulesDoc.id);
        if (!doc) {
            console.error(`Failed to fetch rules document content for id: ${rulesDoc.id}`);
            return [];
        }
        return JSON.parse(doc.content) as ComplianceRule[];
    } catch (error) {
        console.error("Failed to fetch compliance rules:", error);
        return [];
    }
}
export async function executeTool(name: string, args: Record<string, unknown>, env: any): Promise<ToolResult> {
  try {
    switch (name) {
      case 'get_weather':
        return {
          location: args.location as string,
          temperature: Math.floor(Math.random() * 40) - 10,
          condition: ['Sunny', 'Cloudy', 'Rainy', 'Snowy'][Math.floor(Math.random() * 4)],
          humidity: Math.floor(Math.random() * 100)
        };
      case 'web_search': {
        const { query, url } = args as { query?: string; url?: string };
        if (url) {
          return { content: `Mock content for URL: ${url}. The page discusses advanced AI integration in modern web applications.` };
        }
        if (query) {
          return { content: `Mock search results for "${query}":\n1. Result A\n2. Result B\n3. Result C` };
        }
        return { error: 'Either "query" or "url" must be provided for web_search.' };
      }
      case 'analyze_document_for_compliance_risks': {
        const { documentContent, ruleIds } = args as { documentContent: string; ruleIds?: string[] };
        if (!documentContent) return { error: 'documentContent is required.' };
        let rules = await getComplianceRules(env);
        if (ruleIds && ruleIds.length > 0) {
            rules = rules.filter(rule => ruleIds.includes(rule.id));
        }
        const flags: RiskFlag[] = [];
        const lowerCaseContent = documentContent.toLowerCase();
        for (const rule of rules) {
            for (const keyword of rule.keywords) {
                if (lowerCaseContent.includes(keyword.toLowerCase())) {
                    const snippetRadius = 50;
                    const keywordIndex = lowerCaseContent.indexOf(keyword.toLowerCase());
                    const start = Math.max(0, keywordIndex - snippetRadius);
                    const end = Math.min(documentContent.length, keywordIndex + keyword.length + snippetRadius);
                    const flaggedContent = `...${documentContent.substring(start, end)}...`;
                    flags.push({
                        id: `flag-${crypto.randomUUID()}`,
                        documentId: 'unknown', // This would be passed in a real scenario
                        ruleId: rule.id,
                        flaggedContent,
                        severity: rule.severity,
                        status: 'PENDING',
                        timestamp: Date.now(),
                    });
                    // Break after first keyword match for a given rule to avoid duplicate flags for the same rule
                    break; 
                }
            }
        }
        return flags;
      }
      default: {
        const content = await mcpManager.executeTool(name, args);
        return { content };
      }
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}