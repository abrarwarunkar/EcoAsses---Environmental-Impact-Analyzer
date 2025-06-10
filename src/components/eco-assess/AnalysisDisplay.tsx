
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileText, MountainSnow, ShieldAlert, Cloud, Waves, Leaf, Recycle, AlertTriangle, CheckCircle2, MinusCircle, Info, FlaskConical, Biohazard } from "lucide-react";
import type { AnalyzeProductDescriptionOutput, IngredientDetail } from "@/ai/schemas/product-analysis-schemas"; // Updated import
import { Badge } from "@/components/ui/badge";

type AnalysisDisplayProps = {
  analysis: AnalyzeProductDescriptionOutput;
};

const ImpactLevelIcon = ({ level }: { level: "low" | "medium" | "high" | "unknown" }) => {
  switch (level) {
    case "low":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "medium":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case "high":
      return <ShieldAlert className="h-5 w-5 text-red-500" />;
    default:
      return <MinusCircle className="h-5 w-5 text-muted-foreground" />;
  }
};

const ImpactLevelBadge = ({ level }: { level: "low" | "medium" | "high" | "unknown" | undefined}) => {
  if (!level) return <Badge variant="outline" className="capitalize bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-500">Unknown</Badge>;
  const variantMap = {
    low: "default",
    medium: "secondary",
    high: "destructive",
    unknown: "outline",
  } as const;
  const colorMap = {
    low: "bg-green-100 text-green-700 border-green-300 dark:bg-green-800 dark:text-green-200 dark:border-green-600",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-800 dark:text-yellow-200 dark:border-yellow-600",
    high: "bg-red-100 text-red-700 border-red-300 dark:bg-red-800 dark:text-red-200 dark:border-red-600",
    unknown: "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-500",
  }
  return <Badge variant={variantMap[level]} className={`${colorMap[level]} capitalize`}>{level}</Badge>;
}

const IngredientAssessmentBadge = ({ assessment }: { assessment: IngredientDetail['assessment'] | undefined }) => {
  if (!assessment) return <Badge variant="outline">Unknown</Badge>;
  const colorMap: Record<IngredientDetail['assessment'], string> = {
    "Generally Safe": "bg-green-100 text-green-700 border-green-300 dark:bg-green-800 dark:text-green-200 dark:border-green-600",
    "Use with Caution": "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-800 dark:text-yellow-200 dark:border-yellow-600",
    "Potential Concern": "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-800 dark:text-orange-200 dark:border-orange-600", // Using orange for potential concern
    "Unknown": "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-500",
  };
  return <Badge className={`${colorMap[assessment]}`}>{assessment}</Badge>;
};


export default function AnalysisDisplay({ analysis }: AnalysisDisplayProps) {
  const score = analysis.overallSustainabilityScore;

  const detailedItems = [
    { 
      title: "Carbon Footprint", 
      icon: <Cloud className="h-5 w-5 text-primary" />, 
      content: analysis.detailedAnalysis.carbonFootprint.analysis,
      level: analysis.detailedAnalysis.carbonFootprint.impactLevel
    },
    { 
      title: "Water Usage", 
      icon: <Waves className="h-5 w-5 text-primary" />, 
      content: analysis.detailedAnalysis.waterUsage.analysis,
      level: analysis.detailedAnalysis.waterUsage.impactLevel
    },
    { 
      title: "Material Sourcing", 
      icon: <Leaf className="h-5 w-5 text-primary" />, 
      content: analysis.detailedAnalysis.materialSourcing.analysis,
      level: analysis.detailedAnalysis.materialSourcing.impactLevel
    },
    { 
      title: "Recyclability & End-of-Life", 
      icon: <Recycle className="h-5 w-5 text-primary" />, 
      content: analysis.detailedAnalysis.recyclability.analysis,
      level: analysis.detailedAnalysis.recyclability.impactLevel
    },
  ];
  
  const ingredientAnalysis = analysis.detailedAnalysis.ingredientAnalysis;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Environmental Impact Report
        </CardTitle>
        <CardDescription>
          Overall Environmental Score: {score}/100 (0 = Very Unsustainable, 100 = Highly Sustainable)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Impact Score</h3>
          <Progress value={score} className="h-3 [&>div]:bg-primary" aria-label={`Environmental impact score: ${score} out of 100`} />
            <p className={`text-sm font-medium ${
              score >= 70 ? 'text-green-600' : score >= 40 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {score >= 70 ? 'Good Environmental Performance' : score >= 40 ? 'Moderate Environmental Impact' : 'High Environmental Impact Concerns'}
            </p>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <MountainSnow className="h-5 w-5 text-primary" />
            Overall Impact Summary
          </h3>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {analysis.environmentalImpactAnalysis}
          </p>
        </div>

        {analysis.productIdentificationGuess && (
          <div className="space-y-2">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Identified Product (from image)
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {analysis.productIdentificationGuess}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            Key Factors & Concerns
          </h3>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {analysis.keyFactors}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Detailed Analysis</h3>
          <Accordion type="multiple" className="w-full" defaultValue={['item-0']}>
            {detailedItems.map((item, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="font-medium text-base hover:no-underline">
                  <div className="flex items-center gap-2">
                    {item.icon}
                    {item.title}
                    <ImpactLevelBadge level={item.level} />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-wrap pt-2">
                  {item.content}
                </AccordionContent>
              </AccordionItem>
            ))}
            {ingredientAnalysis && (
              <AccordionItem value="item-ingredients">
                <AccordionTrigger className="font-medium text-base hover:no-underline">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="h-5 w-5 text-primary" />
                    Ingredient Analysis
                    <ImpactLevelBadge level={ingredientAnalysis.ingredientImpactLevel} />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-wrap pt-2 space-y-4">
                  <p>{ingredientAnalysis.overallIngredientSummary}</p>
                  {ingredientAnalysis.identifiedIngredients && ingredientAnalysis.identifiedIngredients.length > 0 && (
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Identified Ingredients:</h4>
                      <ul className="space-y-3">
                        {ingredientAnalysis.identifiedIngredients.map((ing, idx) => (
                          <li key={idx} className="p-3 bg-muted/50 rounded-md shadow-sm border border-border">
                            <div className="flex justify-between items-start mb-1">
                              <strong className="text-foreground">{ing.name}</strong>
                              <IngredientAssessmentBadge assessment={ing.assessment} />
                            </div>
                            {ing.healthHazards && (
                                <p className="text-xs"><strong>Health:</strong> {ing.healthHazards}</p>
                            )}
                            {ing.environmentalImpact && (
                                <p className="text-xs"><strong>Environment:</strong> {ing.environmentalImpact}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>

      </CardContent>
    </Card>
  );
}

