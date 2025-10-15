import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Bot, Users, Shield, Database, Loader2, CheckCircle, MoreVertical } from "lucide-react";
import { toast } from 'sonner';
import { chatService } from '@/lib/chat';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from 'framer-motion';
interface AiModel {
  id: string;
  name: string;
}
interface AppSettings {
  draftingModel: string;
  analysisModel: string;
  enableContinuousLearning: boolean;
  enableDataMinimization: boolean;
  autoRedactPII: boolean;
}
const DEFAULT_SETTINGS: AppSettings = {
  draftingModel: 'google-ai-studio/gemini-2.5-pro',
  analysisModel: 'google-ai-studio/gemini-2.5-flash',
  enableContinuousLearning: true,
  enableDataMinimization: false,
  autoRedactPII: true,
};
const mockUsers = [
  { id: 'user-1', name: 'Alice Johnson', email: 'alice@example.bank', role: 'Admin', avatar: '/avatars/01.png' },
  { id: 'user-2', name: 'Bob Williams', email: 'bob@example.bank', role: 'Legal Counsel', avatar: '/avatars/02.png' },
  { id: 'user-3', name: 'Charlie Brown', email: 'charlie@example.bank', role: 'Compliance Officer', avatar: '/avatars/03.png' },
  { id: 'user-4', name: 'Diana Miller', email: 'diana@example.bank', role: 'Reviewer', avatar: '/avatars/04.png' },
];
export function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [availableModels, setAvailableModels] = useState<AiModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const fetchModels = useCallback(async () => {
    const res = await chatService.getAvailableModels();
    if (res.success && res.data) {
      setAvailableModels(res.data);
    } else {
      toast.error("Could not fetch available AI models.");
    }
  }, []);
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      await fetchModels();
      try {
        const savedSettings = localStorage.getItem('lexiguard_settings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error("Failed to load settings from localStorage", error);
      }
      setIsLoading(false);
    };
    loadSettings();
  }, [fetchModels]);
  const handleSaveSettings = () => {
    try {
      localStorage.setItem('lexiguard_settings', JSON.stringify(settings));
      toast.success("Settings saved successfully!");
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      toast.error("Failed to save settings.");
      console.error("Failed to save settings to localStorage", error);
    }
  };
  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
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
            <h1 className="text-4xl font-bold font-display">Settings & AI Governance</h1>
            <p className="text-lg text-muted-foreground">
              Configure the platform, manage users, and define AI governance policies.
            </p>
          </motion.header>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Bot /> AI Model Configuration</CardTitle>
                  <CardDescription>Manage the AI models used for drafting and analysis.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="drafting-model">Document Drafting Model</Label>
                    <Select value={settings.draftingModel} onValueChange={(value) => handleSettingChange('draftingModel', value)}>
                      <SelectTrigger id="drafting-model"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {availableModels.map(model => (
                          <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="analysis-model">Compliance Analysis Model</Label>
                    <Select value={settings.analysisModel} onValueChange={(value) => handleSettingChange('analysisModel', value)}>
                      <SelectTrigger id="analysis-model"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {availableModels.map(model => (
                          <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>Enable Continuous Learning</Label>
                      <p className="text-sm text-muted-foreground">Allow models to learn from user feedback (anonymized).</p>
                    </div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Switch checked={settings.enableContinuousLearning} onCheckedChange={(checked) => handleSettingChange('enableContinuousLearning', checked)} />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>This helps improve AI accuracy over time.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Users /> User Roles & Access</CardTitle>
                  <CardDescription>Manage user permissions and roles within the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockUsers.map(user => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem>Edit Role</DropdownMenuItem>
                                <DropdownMenuItem>Deactivate User</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Database /> Data Classification</CardTitle>
                  <CardDescription>Configure policies for handling sensitive data.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label>Enable Data Minimization</Label>
                            <p className="text-sm text-muted-foreground">Only process necessary data fields.</p>
                        </div>
                        <Switch checked={settings.enableDataMinimization} onCheckedChange={(checked) => handleSettingChange('enableDataMinimization', checked)} />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label>Auto-Redact PII</Label>
                            <p className="text-sm text-muted-foreground">Automatically redact Personally Identifiable Information.</p>
                        </div>
                        <Switch checked={settings.autoRedactPII} onCheckedChange={(checked) => handleSettingChange('autoRedactPII', checked)} />
                    </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Shield /> AI Governance Policies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Review and acknowledge the AI usage policies to ensure responsible and compliant use of AI within the organization.
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">View Governance Document</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Mock AI Governance Policy</DialogTitle>
                      </DialogHeader>
                      <div className="text-sm text-muted-foreground space-y-2">
                        <p>This document outlines the acceptable use of AI tools within LexiGuard. All users must adhere to these guidelines to maintain security, compliance, and ethical standards.</p>
                        <p><strong>1. Data Privacy:</strong> No sensitive customer PII should be used in prompts without proper anonymization.</p>
                        <p><strong>2. Accuracy:</strong> All AI-generated content must be reviewed by a qualified human professional before finalization.</p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="text-right flex justify-end items-center gap-4">
            {isSaved && <span className="text-green-600 flex items-center gap-2 animate-fade-in"><CheckCircle className="h-5 w-5" /> Settings Saved!</span>}
            <Button size="lg" onClick={handleSaveSettings}>Save All Settings</Button>
          </div>
        </div>
      </div>
    </div>
  );
}