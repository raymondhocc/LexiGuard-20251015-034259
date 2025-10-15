import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Plus, Minus, Replace } from "lucide-react";
import type { AISuggestion } from "../../../worker/types";
interface AISuggestionCardProps {
  suggestion: AISuggestion;
  onAccept: () => void;
  onReject: () => void;
}
const renderSuggestionContent = (suggestion: AISuggestion) => {
  switch (suggestion.type) {
    case 'ADDITION':
      return (
        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-md">
          <p className="text-sm text-green-800 dark:text-green-300">{suggestion.content}</p>
        </div>
      );
    case 'REMOVAL':
      return (
        <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-md">
          <p className="text-sm text-red-800 dark:text-red-300 line-through">{suggestion.content}</p>
        </div>
      );
    case 'REPLACEMENT':
      return (
        <div className="space-y-2">
          <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-md">
            <p className="text-sm text-red-800 dark:text-red-300 line-through">{suggestion.originalContent}</p>
          </div>
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-md">
            <p className="text-sm text-green-800 dark:text-green-300">{suggestion.content}</p>
          </div>
        </div>
      );
    default:
      return <p className="text-sm">{suggestion.content}</p>;
  }
};
const getSuggestionIcon = (type: AISuggestion['type']) => {
    switch (type) {
        case 'ADDITION': return <Plus className="h-4 w-4" />;
        case 'REMOVAL': return <Minus className="h-4 w-4" />;
        case 'REPLACEMENT': return <Replace className="h-4 w-4" />;
        default: return null;
    }
}
export function AISuggestionCard({ suggestion, onAccept, onReject }: AISuggestionCardProps) {
  return (
    <Card className="bg-muted/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
            {getSuggestionIcon(suggestion.type)}
            Suggestion: {suggestion.type}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderSuggestionContent(suggestion)}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onReject}>
          <X className="h-4 w-4 mr-2" /> Reject
        </Button>
        <Button size="sm" onClick={onAccept}>
          <Check className="h-4 w-4 mr-2" /> Accept
        </Button>
      </CardFooter>
    </Card>
  );
}