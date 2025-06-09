
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lightbulb, ThumbsUp, CheckSquare, Sparkles } from "lucide-react";
import type { GenerateProductInsightsOutput } from "@/ai/flows/generate-product-insights";

type ProductInsightsDisplayProps = {
  insights: GenerateProductInsightsOutput;
};

export default function ProductInsightsDisplay({ insights }: ProductInsightsDisplayProps) {
  const hasActionableTips = insights.actionableTips && insights.actionableTips.length > 0 && insights.actionableTips.some(tip => tip.toLowerCase() !== "no specific actionable tips noted." && tip.toLowerCase() !== "n/a");
  const hasPositiveHighlights = insights.positiveHighlights && insights.positiveHighlights.length > 0 && insights.positiveHighlights.some(highlight => highlight.toLowerCase() !== "no significant positive aspects noted." && highlight.toLowerCase() !== "n/a");
  const hasAreasForConsideration = insights.areasForConsideration && insights.areasForConsideration.length > 0 && insights.areasForConsideration.some(area => area.toLowerCase() !== "no specific areas for consideration noted." && area.toLowerCase() !== "n/a");


  if (!hasActionableTips && !hasPositiveHighlights && !hasAreasForConsideration) {
    return null; // Don't render the card if all sections would be empty or placeholder
  }
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Eco-Insights & Tips
        </CardTitle>
        <CardDescription>
          Actionable advice and key takeaways from the analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasActionableTips && (
          <div>
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-accent" />
              Actionable Tips
            </h3>
            <ul className="list-disc list-inside space-y-2 pl-5 text-muted-foreground">
              {insights.actionableTips.map((tip, index) => (
                <li key={`tip-${index}`}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {hasPositiveHighlights && (
          <div>
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <ThumbsUp className="h-5 w-5 text-green-500" />
              Positive Highlights
            </h3>
            <ul className="list-disc list-inside space-y-2 pl-5 text-muted-foreground">
              {insights.positiveHighlights.map((highlight, index) => (
                <li key={`highlight-${index}`}>{highlight}</li>
              ))}
            </ul>
          </div>
        )}
        
        {hasAreasForConsideration && (
           <div>
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-blue-500" />
              Areas for Future Consideration
            </h3>
            <ul className="list-disc list-inside space-y-2 pl-5 text-muted-foreground">
              {insights.areasForConsideration.map((area, index) => (
                <li key={`area-${index}`}>{area}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
