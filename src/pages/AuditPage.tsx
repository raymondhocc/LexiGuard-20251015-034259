import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, User, Search, Loader2, Eye } from "lucide-react";
import { format } from 'date-fns';
import { auditService, type AuditLogEntry, type AuditAction } from '@/lib/audit-service';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
export function AuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    const res = await auditService.getLogEntries();
    if (res.success && res.data) {
      setLogs(res.data);
    } else {
      toast.error("Failed to fetch audit logs.");
    }
    setIsLoading(false);
  }, []);
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);
  const getActionBadgeVariant = (action: AuditAction) => {
    switch (action) {
      case 'CREATE': return 'default';
      case 'UPDATE': return 'secondary';
      case 'DELETE': return 'destructive';
      case 'AI_DRAFT': return 'outline';
      default: return 'outline';
    }
  };
  const filteredLogs = logs.filter(log =>
    log.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase())
  );
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
            <h1 className="text-4xl font-bold font-display">Audit & Evidence Trail</h1>
            <p className="text-lg text-muted-foreground">
              A secure, immutable record of all system activities, document changes, and user actions.
            </p>
          </motion.header>
          <Card>
            <CardHeader>
              <CardTitle>Filter Logs</CardTitle>
              <CardDescription>Search and filter through the audit trail.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by User, Entity ID, or Action..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" disabled><Calendar className="mr-2 h-4 w-4" /> Date Range (soon)</Button>
                <Button variant="outline" disabled><User className="mr-2 h-4 w-4" /> Filter by User (soon)</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Entity</TableHead>
                        <TableHead className="text-right">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log) => (
                        <TableRow key={log.id} className="hover:bg-muted/50">
                          <TableCell>{format(new Date(log.timestamp), 'PPpp')}</TableCell>
                          <TableCell>{log.userId}</TableCell>
                          <TableCell>
                            <Badge variant={getActionBadgeVariant(log.action)}>{log.action}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-xs">{log.entityType}:{log.entityId.substring(0, 8)}...</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Log Details</DialogTitle>
                                </DialogHeader>
                                <pre className="text-xs bg-muted p-4 rounded-md max-h-[60vh] overflow-auto">{JSON.stringify(log.details, null, 2)}</pre>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}