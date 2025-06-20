
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileText, MountainSnow, ShieldAlert, Cloud, Waves, Leaf, Recycle, Info, FlaskConical } from "lucide-react";
import type { AnalyzeProductDescriptionOutput } from "@/ai/schemas/product-analysis-schemas"; 
import { ImpactLevelBadge, IngredientAssessmentBadge } from "./Badges"; // Updated import

type AnalysisDisplayProps = {
  analysis: AnalyzeProductDescriptionOutput;
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
