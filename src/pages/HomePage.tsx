import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, ShieldCheck, Briefcase, Loader2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import AnimatedGradientText from '@/components/ui/animated-gradient-text';
import { toast } from 'sonner';
import { documentService } from '@/lib/document-service';
import { caseService } from '@/lib/case-service';
import { format, startOfQuarter } from 'date-fns';
import { motion } from 'framer-motion';
interface DashboardMetrics {
  complianceStatus: number;
  activeCases: number;
  pendingReviews: number;
}
interface ChartDataPoint {
  name: string;
  [key: string]: any;
}
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};
export function HomePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    complianceStatus: 0,
    activeCases: 0,
    pendingReviews: 0
  });
  const [complianceTrend, setComplianceTrend] = useState<ChartDataPoint[]>([]);
  const [riskHotspots, setRiskHotspots] = useState<ChartDataPoint[]>([]);
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [docsRes, casesRes] = await Promise.all([
      documentService.getDocuments(),
      caseService.getCases()]
      );
      if (!docsRes.success || !casesRes.success) {
        throw new Error("Failed to fetch dashboard data");
      }
      const documents = docsRes.data || [];
      const cases = casesRes.data || [];
      const activeCasesCount = cases.filter((c) => c.status !== 'CLOSED' && c.status !== 'ARCHIVED').length;
      const pendingReviewsCount = documents.filter((d) => d.status === 'in-review').length;
      const complianceScore = cases.length > 0 ?
      Math.round((cases.length - activeCasesCount) / cases.length * 100) :
      100;
      setMetrics({
        complianceStatus: complianceScore,
        activeCases: activeCasesCount,
        pendingReviews: pendingReviewsCount
      });
      const quarterlyData: {[key: string]: {score: number;count: number;};} = {};
      cases.forEach((c) => {
        const quarter = format(startOfQuarter(new Date(c.createdAt)), 'yyyy-QQ');
        if (!quarterlyData[quarter]) {
          quarterlyData[quarter] = { score: 0, count: 0 };
        }
        quarterlyData[quarter].score += c.status === 'CLOSED' ? 100 : 85;
        quarterlyData[quarter].count++;
      });
      const trendData = Object.entries(quarterlyData).
      map(([name, { score, count }]) => ({
        name: name.replace('-', ' Q'),
        trend: Math.round(score / count)
      })).
      sort((a, b) => a.name.localeCompare(b.name));
      setComplianceTrend(trendData);
      const distribution: {[key: string]: number;} = { 'AML': 0, 'GDPR': 0, 'KYC': 0, 'Fraud': 0, 'Other': 0 };
      cases.forEach((c) => {
        const title = c.title.toLowerCase();
        if (title.includes('aml')) distribution['AML']++;else
        if (title.includes('gdpr')) distribution['GDPR']++;else
        if (title.includes('kyc')) distribution['KYC']++;else
        if (title.includes('fraud')) distribution['Fraud']++;else
        distribution['Other']++;
      });
      const hotspotData = Object.entries(distribution).
      map(([name, value]) => ({ name, value, fill: name === 'Fraud' ? 'hsl(var(--destructive))' : 'hsl(var(--chart-1))' })).
      filter((d) => d.value > 0);
      setRiskHotspots(hotspotData);
    } catch (error) {
      toast.error("Failed to load dashboard data.");
      console.error("Dashboard fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <div className="space-y-8">
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4">

            <AnimatedGradientText>
              <h1 className="text-4xl md:text-5xl font-bold text-center">Welcome to LexiGuard AI</h1>
            </AnimatedGradientText>
            <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto">
              Your intelligent partner for legal and compliance in the banking industry. Here's your executive overview.
            </p>
          </motion.header>
          {isLoading ?
          <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
                <Skeleton className="lg:col-span-3 h-80" />
                <Skeleton className="lg:col-span-2 h-80" />
              </div>
              <Skeleton className="h-40" />
            </div> :

          <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            className="space-y-8">

              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                <motion.div whileHover={{ y: -5, boxShadow: "0 10px 15px -3px hsla(var(--primary)/0.1), 0 4px 6px -2px hsla(var(--primary)/0.05)" }} transition={{ type: "spring", stiffness: 300 }}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
                      <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics.complianceStatus}%</div>
                      <p className="text-xs text-muted-foreground">Based on active cases</p>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div whileHover={{ y: -5, boxShadow: "0 10px 15px -3px hsla(var(--primary)/0.1), 0 4px 6px -2px hsla(var(--primary)/0.05)" }} transition={{ type: "spring", stiffness: 300 }}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics.activeCases}</div>
                      <p className="text-xs text-muted-foreground">Currently open investigations</p>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div whileHover={{ y: -5, boxShadow: "0 10px 15px -3px hsla(var(--primary)/0.1), 0 4px 6px -2px hsla(var(--primary)/0.05)" }} transition={{ type: "spring", stiffness: 300 }}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics.pendingReviews}</div>
                      <p className="text-xs text-muted-foreground">Documents awaiting approval</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
              <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Compliance Trend</CardTitle>
                    <CardDescription>Overall compliance score over time.</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={complianceTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[80, 100]} unit="%" />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="trend" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Risk Hotspots</CardTitle>
                    <CardDescription>Active cases by category.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={riskHotspots} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={60} />
                      <Tooltip />
                      <Bar dataKey="value" name="Active Cases">
                        {riskHotspots.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-4">
                    <Button onClick={() => navigate('/documents')} size="lg" className="transition-transform hover:scale-105 active:scale-95">
                      <FileText className="mr-2 h-5 w-5" /> Start New Draft
                    </Button>
                    <Button onClick={() => navigate('/compliance')} variant="secondary" size="lg" className="transition-transform hover:scale-105 active:scale-95">
                      <ShieldCheck className="mr-2 h-5 w-5" /> Review Compliance Rules
                    </Button>
                    <Button onClick={() => navigate('/cases')} variant="outline" size="lg" className="transition-transform hover:scale-105 active:scale-95">
                      <Briefcase className="mr-2 h-5 w-5" /> View Active Cases
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          }
        </div>
      </div>
    </div>);

}