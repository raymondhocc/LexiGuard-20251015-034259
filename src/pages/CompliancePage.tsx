import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Edit, Trash2, Loader2, ShieldAlert } from "lucide-react";
import { complianceService, type ComplianceRule } from '@/lib/compliance-service';
import type { ComplianceRuleSeverity } from '../../worker/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
interface ComplianceRuleFormState extends Omit<ComplianceRule, 'keywords'> {
  keywordsInput: string;
}
export function CompliancePage() {
  const [rules, setRules] = useState<ComplianceRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [currentRule, setCurrentRule] = useState<Partial<ComplianceRuleFormState>>({
    keywordsInput: '',
    severity: 'MEDIUM',
    isActive: true,
  });
  const fetchRules = useCallback(async () => {
    setIsLoading(true);
    const fetchedRules = await complianceService.getRules();
    setRules(fetchedRules);
    setIsLoading(false);
  }, []);
  useEffect(() => {
    fetchRules();
  }, [fetchRules]);
  const handleSaveRule = async () => {
    if (!currentRule.name || !currentRule.description || !currentRule.keywordsInput) {
      toast.error("Please fill all fields for the rule.");
      return;
    }
    const ruleData: Omit<ComplianceRule, 'id'> = {
      name: currentRule.name,
      description: currentRule.description,
      keywords: currentRule.keywordsInput.split(',').map(k => k.trim()).filter(Boolean),
      severity: currentRule.severity || 'MEDIUM',
      isActive: currentRule.isActive !== undefined ? currentRule.isActive : true,
    };
    let success = false;
    if (isEditing) {
      success = await complianceService.updateRule({ ...ruleData, id: isEditing });
      toast.success("Rule updated successfully!");
    } else {
      success = await complianceService.addRule(ruleData);
      toast.success("Rule added successfully!");
    }
    if (success) {
      await fetchRules();
      handleCancelEdit();
    } else {
      toast.error("Failed to save rule.");
    }
  };
  const handleEdit = (rule: ComplianceRule) => {
    setIsEditing(rule.id);
    setCurrentRule({ ...rule, keywordsInput: rule.keywords.join(', ') });
  };
  const handleDelete = async (ruleId: string) => {
    const success = await complianceService.deleteRule(ruleId);
    if (success) {
      toast.success("Rule deleted successfully!");
      await fetchRules();
    } else {
      toast.error("Failed to delete rule.");
    }
  };
  const handleCancelEdit = () => {
    setIsEditing(null);
    setCurrentRule({
      name: '',
      description: '',
      keywordsInput: '',
      severity: 'MEDIUM',
      isActive: true,
    });
  };
  const getSeverityBadgeClass = (severity: ComplianceRuleSeverity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500 text-white border-red-500';
      case 'HIGH': return 'bg-orange-500 text-white border-orange-500';
      case 'MEDIUM': return 'bg-yellow-500 text-black border-yellow-500';
      case 'LOW': return 'bg-blue-500 text-white border-blue-500';
      default: return 'bg-gray-500 text-white border-gray-500';
    }
  };
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
            <h1 className="text-4xl font-bold font-display">Compliance & Risk Management</h1>
            <p className="text-lg text-muted-foreground">
              Define and manage compliance rules to proactively identify risks in your documents.
            </p>
          </motion.header>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configured Compliance Rules</CardTitle>
                  <CardDescription>These rules are actively used by the AI to flag potential issues.</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <ul className="space-y-4">
                      {rules.map(rule => (
                        <motion.li
                          key={rule.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="p-4 border rounded-lg space-y-3 transition-shadow hover:shadow-md"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold flex items-center gap-2">{rule.name} <Badge className={cn(getSeverityBadgeClass(rule.severity))}>{rule.severity}</Badge></h3>
                              <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(rule)}><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {rule.keywords.map(kw => <Badge key={kw} variant="secondary">{kw}</Badge>)}
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShieldAlert /> AI-Generated Risk Flags</CardTitle>
                    <CardDescription>This is a placeholder for a future feature to display active risk flags across all documents.</CardDescription>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground py-12">
                    <p>Risk flag summary will be displayed here.</p>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>{isEditing ? 'Edit Rule' : 'Add New Rule'}</CardTitle>
                  <CardDescription>{isEditing ? 'Update the details of the existing rule.' : 'Create a new rule for the AI to monitor.'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="Rule Name" value={currentRule.name || ''} onChange={(e) => setCurrentRule(p => ({ ...p, name: e.target.value }))} />
                  <Textarea placeholder="Description" value={currentRule.description || ''} onChange={(e) => setCurrentRule(p => ({ ...p, description: e.target.value }))} />
                  <Input placeholder="Keywords (comma-separated)" value={currentRule.keywordsInput || ''} onChange={(e) => setCurrentRule(p => ({ ...p, keywordsInput: e.target.value }))} />
                  <Select value={currentRule.severity || 'MEDIUM'} onValueChange={(v) => setCurrentRule(p => ({ ...p, severity: v as ComplianceRuleSeverity }))}>
                    <SelectTrigger><SelectValue placeholder="Select severity" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    {isEditing && <Button variant="outline" onClick={handleCancelEdit} className="w-full">Cancel</Button>}
                    <Button onClick={handleSaveRule} className="w-full">
                      {isEditing ? 'Save Changes' : <><PlusCircle className="h-4 w-4 mr-2" /> Add Rule</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}