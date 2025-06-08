import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Lightbulb } from "lucide-react";

type AlternativesDisplayProps = {
  alternatives: {
    alternatives: string[];
    reasoning: string;
  };
};

export default function AlternativesDisplay({ alternatives }: AlternativesDisplayProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Sustainable Alternatives
        </CardTitle>
        <CardDescription>
          Consider these more eco-friendly options for your needs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-2">Suggested Products:</h3>
          {alternatives.alternatives.length > 0 ? (
            <ul className="space-y-3">
              {alternatives.alternatives.map((alt, index) => (
                <li key={index} className="p-3 bg-secondary/30 rounded-md shadow-sm">
                  <Badge variant="secondary" className="mr-2 bg-primary/20 text-primary-foreground">{index + 1}</Badge>
                  {alt}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No specific alternatives generated based on the current input.</p>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-lg flex items-center gap-2">
             <Lightbulb className="h-5 w-5 text-primary" />
            Reasoning for Suggestions
          </h3>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {alternatives.reasoning}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
