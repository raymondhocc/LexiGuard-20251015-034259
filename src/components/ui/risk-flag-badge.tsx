import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { RiskFlag, ComplianceRuleSeverity } from '../../../worker/types';
interface RiskFlagBadgeProps {
  flag: RiskFlag;
  ruleName?: string;
}
const severityVariantMap: Record<ComplianceRuleSeverity, "default" | "secondary" | "destructive" | "outline"> = {
  LOW: 'default',
  MEDIUM: 'secondary',
  HIGH: 'destructive',
  CRITICAL: 'destructive',
};
export function RiskFlagBadge({ flag, ruleName = "Unknown Rule" }: RiskFlagBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant={severityVariantMap[flag.severity] || 'default'} className="cursor-help">
            {flag.severity}: {ruleName}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="font-bold mb-1">Flagged Content:</p>
          <p className="text-xs bg-muted p-2 rounded-md">"{flag.flaggedContent}"</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}