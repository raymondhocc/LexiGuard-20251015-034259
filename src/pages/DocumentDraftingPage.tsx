import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Bot, Sparkles, Save, FileText, Trash2, PlusCircle, ShieldCheck, Loader2, History, GitCompareArrows } from 'lucide-react';
import { toast } from 'sonner';
import { chatService } from '@/lib/chat';
import { documentService, type Document, type DocumentMetadata, type DocumentVersion, type AISuggestion } from '@/lib/document-service';
import { complianceService, type RiskFlag, type ComplianceRule } from '@/lib/compliance-service';
import { RiskFlagBadge } from '@/components/ui/risk-flag-badge';
import { FileUploadButton } from '@/components/ui/file-upload-button';
import { AISuggestionCard } from '@/components/ui/ai-suggestion-card';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
export function DocumentDraftingPage() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingCompliance, setIsCheckingCompliance] = useState(false);
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [activeDocument, setActiveDocument] = useState<Partial<Document> | null>(null);
  const [complianceFlags, setComplianceFlags] = useState<RiskFlag[]>([]);
  const [complianceRules, setComplianceRules] = useState<ComplianceRule[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const fetchDocuments = useCallback(async () => {
    setIsLoadingDocs(true);
    const res = await documentService.getDocuments();
    if (res.success && res.data) {
      setDocuments(res.data.filter(d => d.title !== "LexiGuard Compliance Rules"));
    } else {
      toast.error("Failed to load documents.");
    }
    setIsLoadingDocs(false);
  }, []);
  const fetchRules = useCallback(async () => {
    const rules = await complianceService.getRules();
    setComplianceRules(rules);
  }, []);
  useEffect(() => {
    fetchDocuments();
    fetchRules();
  }, [fetchDocuments, fetchRules]);
  const resetState = () => {
    setPrompt('');
    setComplianceFlags([]);
    setAiSuggestions([]);
  };
  const handleNewDocument = () => {
    setActiveDocument({ title: 'New Document', content: '', status: 'draft', tags: [], versions: [] });
    resetState();
  };
  const handleSelectDocument = async (id: string) => {
    setActiveDocument(null); // Clear previous doc for loading state
    const res = await documentService.getDocument(id);
    if (res.success && res.data) {
      setActiveDocument(res.data);
      resetState();
    } else {
      toast.error("Failed to load document.");
    }
  };
  const handleFileRead = (content: string) => {
    setActiveDocument(prev => ({
      ...(prev || { status: 'draft', tags: [], versions: [] }),
      title: prev?.title || 'New Document from File',
      content: content,
    }));
    resetState();
  };
  const handleGenerateDraft = async () => {
    if (!prompt.trim() || !activeDocument) return toast.warning('Please enter a prompt and select a document.');
    setIsGenerating(true);
    setAiSuggestions([]);
    toast.info('AI is generating suggestions...');
    const fullPrompt = `
      You are an AI legal assistant. Based on the user's request, analyze the following document and provide suggestions for improvement.
      Your response MUST be a valid JSON array of objects, where each object represents a single suggestion and adheres to the AISuggestion interface.
      The interface is: { id: string; type: 'ADDITION' | 'REMOVAL' | 'REPLACEMENT'; content: string; originalContent?: string; status: 'PENDING'; timestamp: number; }
      - For 'REPLACEMENT', 'originalContent' is the exact text to be replaced, and 'content' is the new text.
      - For 'ADDITION', 'content' is the text to be added.
      - For 'REMOVAL', 'content' is the exact text to be removed.
      - Generate a unique UUID for each 'id' and use the current Unix timestamp for 'timestamp'.
      User Request: "${prompt}"
      Document Content:
      """
      ${activeDocument.content || ''}
      """
      Respond ONLY with the JSON array.
    `;
    const response = await chatService.sendMessage(fullPrompt, undefined, { stream: false });
    if (response.success && response.data) {
      const lastMessage = response.data.messages[response.data.messages.length - 1];
      try {
        const jsonString = lastMessage.content.replace(/```json\n?|```/g, '').trim();
        const suggestions: AISuggestion[] = JSON.parse(jsonString);
        setAiSuggestions(suggestions);
        toast.success(`${suggestions.length} AI suggestion(s) generated!`);
      } catch (error) {
        toast.error("AI returned an invalid format. Please try again.");
        console.error("Failed to parse AI suggestions:", error, lastMessage.content);
      }
    } else {
      toast.error("Failed to get suggestions from AI.");
    }
    setIsGenerating(false);
  };
  const handleRunComplianceCheck = async () => {
    if (!activeDocument?.content) return toast.warning("Document content is empty.");
    setIsCheckingCompliance(true);
    setComplianceFlags([]);
    toast.info("Running compliance check...");
    const prompt = `Analyze this document for compliance risks and return the results using the 'analyze_document_for_compliance_risks' tool. Document: """${activeDocument.content}"""`;
    const response = await chatService.sendMessage(prompt, undefined, { stream: false });
    if (response.success && response.data) {
        const lastMessage = response.data.messages[response.data.messages.length - 1];
        if (lastMessage.toolCalls) {
            const complianceToolCall = lastMessage.toolCalls.find(tc => tc.name === 'analyze_document_for_compliance_risks');
            if (complianceToolCall && complianceToolCall.result) {
                const flags = complianceToolCall.result as RiskFlag[];
                setComplianceFlags(flags);
                toast.success(`${flags.length} compliance flag(s) found.`);
            } else {
                toast.info("No compliance flags found.");
            }
        } else {
            toast.info("No compliance flags found.");
        }
    } else {
        toast.error("Compliance check failed.");
    }
    setIsCheckingCompliance(false);
  };
  const handleSaveDocument = async () => {
    if (!activeDocument || !activeDocument.title) return toast.warning('Document title is required.');
    setIsSaving(true);
    const docData = { title: activeDocument.title, content: activeDocument.content || '', status: activeDocument.status || 'draft', tags: activeDocument.tags || [] };
    const res = activeDocument.id
      ? await documentService.updateDocument(activeDocument.id, docData)
      : await documentService.createDocument(docData);
    if (res.success) {
      toast.success(`Document ${activeDocument.id ? 'updated' : 'saved'} successfully!`);
      if (res.data) setActiveDocument(res.data);
      await fetchDocuments();
    } else {
      toast.error(`Failed to ${activeDocument.id ? 'update' : 'save'} document.`);
    }
    setIsSaving(false);
  };
  const handleDeleteDocument = async (id: string) => {
    const res = await documentService.deleteDocument(id);
    if (res.success) {
      toast.success('Document deleted.');
      if (activeDocument?.id === id) setActiveDocument(null);
      await fetchDocuments();
    } else {
      toast.error('Failed to delete document.');
    }
  };
  const handleAcceptSuggestion = async (suggestion: AISuggestion) => {
    if (!activeDocument?.id) {
      let newContent = activeDocument?.content || '';
      if (suggestion.type === 'REPLACEMENT' && suggestion.originalContent) {
        newContent = newContent.replace(suggestion.originalContent, suggestion.content);
      } else if (suggestion.type === 'ADDITION') {
        newContent += `\n\n${suggestion.content}`;
      }
      setActiveDocument(prev => ({ ...prev, content: newContent }));
      setAiSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
      toast.success("Suggestion applied locally. Save the document to persist changes.");
      return;
    }
    const res = await documentService.applyAISuggestion(activeDocument.id, suggestion);
    if (res.success && res.data) {
      setActiveDocument(res.data);
      setAiSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
      toast.success("Suggestion applied and document updated.");
    } else {
      toast.error("Failed to apply suggestion.");
    }
  };
  const handleRejectSuggestion = (suggestionId: string) => {
    setAiSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    toast.info("Suggestion rejected.");
  };
  const handleRevertToVersion = (version: DocumentVersion) => {
    setActiveDocument(prev => ({ ...prev, content: version.documentContent }));
    setIsHistoryOpen(false);
    toast.info(`Content reverted to version ${version.version}.`);
  };
  const getRuleNameById = (ruleId: string) => complianceRules.find(r => r.id === ruleId)?.name;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <div className="space-y-8">
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-2"
          >
            <h1 className="text-4xl font-bold font-display">Document Drafting & Review</h1>
            <p className="text-lg text-muted-foreground">Manage legal documents and leverage AI to draft, refine, and check for compliance.</p>
          </motion.header>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>My Documents</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleNewDocument}><PlusCircle className="h-4 w-4 mr-2" /> New</Button>
                  <FileUploadButton size="sm" variant="outline" onFileRead={handleFileRead} />
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingDocs ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {documents.map(doc => (
                      <li key={doc.id}
                          className={cn(
                            "flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer transition-colors",
                            activeDocument?.id === doc.id && "bg-accent text-accent-foreground"
                          )}
                          onClick={() => handleSelectDocument(doc.id)}>
                        <div>
                          <p className="font-medium text-sm">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">Modified: {format(new Date(doc.lastModified), 'PPp')}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc.id); }}><Trash2 className="h-4 w-4" /></Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            <div className="lg:col-span-2 space-y-8">
              {!activeDocument && !isLoadingDocs ? (
                <Card className="flex items-center justify-center h-full border-dashed">
                  <CardContent className="text-center text-muted-foreground py-16">
                    <FileText className="h-12 w-12 mx-auto mb-4" />
                    <p className="font-semibold">Select a document, create a new one, or upload a file to start.</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>1. Edit Document</CardTitle>
                            {activeDocument?.versions && <CardDescription>Version: {activeDocument.versions.length}</CardDescription>}
                        </div>
                        <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" disabled={!activeDocument?.versions || activeDocument.versions.length <= 1}><History className="mr-2 h-4 w-4" /> View History</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-2xl">
                                <DialogHeader><DialogTitle>Document History</DialogTitle></DialogHeader>
                                <div className="max-h-[60vh] overflow-y-auto">
                                    {activeDocument?.versions?.slice().reverse().map(v => (
                                        <div key={v.version} className="p-4 border-b">
                                            <p className="font-semibold">Version {v.version} <span className="font-normal text-muted-foreground">- {format(new Date(v.timestamp), 'PPpp')}</span></p>
                                            <p className="text-sm text-muted-foreground">{v.changesSummary}</p>
                                            <Button size="sm" variant="secondary" className="mt-2" onClick={() => handleRevertToVersion(v)}><GitCompareArrows className="mr-2 h-4 w-4" /> Revert to this version</Button>
                                        </div>
                                    ))}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {activeDocument ? (
                        <>
                          <Input placeholder="Document Title" value={activeDocument.title || ''} onChange={(e) => setActiveDocument(p => ({ ...p, title: e.target.value }))} />
                          <Textarea placeholder="Document content..." value={activeDocument.content || ''} onChange={(e) => setActiveDocument(p => ({ ...p, content: e.target.value }))} rows={15} className="resize-none font-mono" />
                          <Button onClick={handleSaveDocument} disabled={isSaving} size="lg">
                            {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                            {isSaving ? 'Saving...' : 'Save Document'}
                          </Button>
                        </>
                      ) : (
                        <div className="space-y-4">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-64 w-full" />
                          <Skeleton className="h-12 w-40" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Bot className="h-6 w-6" /> 2. AI Assistant</CardTitle>
                      <CardDescription>Provide a prompt to generate suggestions or run a compliance check.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea placeholder="e.g., 'Add a clause about confidentiality...'" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} />
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={handleGenerateDraft} disabled={isGenerating || isCheckingCompliance} size="lg">
                          {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                          {isGenerating ? 'Generating...' : 'Generate Suggestions'}
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button onClick={handleRunComplianceCheck} disabled={isGenerating || isCheckingCompliance} variant="secondary" size="lg">
                              {isCheckingCompliance ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                              {isCheckingCompliance ? 'Checking...' : 'Run Compliance Check'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[625px]">
                            <DialogHeader>
                                <DialogTitle>Compliance Check Results</DialogTitle>
                                <DialogDescription>
                                    {complianceFlags.length > 0 ? `${complianceFlags.length} potential risk(s) found in the document.` : 'No compliance risks were detected.'}
                                </DialogDescription>
                            </DialogHeader>
                            {isCheckingCompliance ? <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div> :
                              complianceFlags.length > 0 ? (
                                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                                  {complianceFlags.map(flag => <RiskFlagBadge key={flag.id} flag={flag} ruleName={getRuleNameById(flag.ruleId)} />)}
                                </div>
                              ) : <p className="py-4 text-center text-muted-foreground">No compliance risks detected.</p>
                            }
                          </DialogContent>
                        </Dialog>
                      </div>
                      {isGenerating && <Skeleton className="h-40 w-full" />}
                      {aiSuggestions.length > 0 && (
                        <div className="space-y-4 pt-4">
                            <h3 className="font-semibold">AI Suggestions</h3>
                            {aiSuggestions.map(suggestion => (
                                <AISuggestionCard key={suggestion.id} suggestion={suggestion} onAccept={() => handleAcceptSuggestion(suggestion)} onReject={() => handleRejectSuggestion(suggestion.id)} />
                            ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}