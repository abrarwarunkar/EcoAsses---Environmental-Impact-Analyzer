import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MountainSnow, Droplets, Recycle, ShieldAlert, ShieldCheck, FileText } from "lucide-react";

type AnalysisDisplayProps = {
  analysis: {
    environmentalImpactAnalysis: string;
    keyFactors: string;
  };
  score: number | null;
};

export default function AnalysisDisplay({ analysis, score }: AnalysisDisplayProps) {
  const getScoreColor = (value: number | null) => {
    if (value === null) return "bg-muted"; // Default grey for no score
    if (value >= 70) return "bg-green-500"; // Good
    if (value >= 40) return "bg-yellow-500"; // Moderate
    return "bg-red-500"; // Poor
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Environmental Impact Report
        </CardTitle>
        {score !== null && (
          <CardDescription>
            Overall Environmental Score: {score}/100
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {score !== null && (
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Impact Score</h3>
            <Progress value={score} className="h-3 [&>div]:bg-primary" aria-label={`Environmental impact score: ${score} out of 100`} />
             <p className={`text-sm font-medium ${
                score >= 70 ? 'text-green-600' : score >= 40 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {score >= 70 ? 'Good Environmental Performance' : score >= 40 ? 'Moderate Environmental Impact' : 'High Environmental Impact Concerns'}
              </p>
          </div>
        )}
        
        <div className="space-y-2">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <MountainSnow className="h-5 w-5 text-primary" />
            Impact Analysis
          </h3>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {analysis.environmentalImpactAnalysis}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            Key Factors & Concerns
          </h3>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {analysis.keyFactors}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-md">
            <Droplets className="h-6 w-6 text-blue-500" />
            <span className="text-sm">Water Usage Considerations</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-md">
            <Recycle className="h-6 w-6 text-green-500" />
            <span className="text-sm">Material & Recyclability Factors</span>
          </div>
           <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-md">
            <img src="https://placehold.co/24x24.png" alt="Carbon Footprint" className="h-6 w-6" data-ai-hint="carbon footprint" />
            <span className="text-sm">Carbon Footprint Insights</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
