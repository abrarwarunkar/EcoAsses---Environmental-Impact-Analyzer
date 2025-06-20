
import type { AnalyzeProductDescriptionOutput } from "@/ai/flows/analyze-product-description";
import AnalysisDisplay from "@/components/eco-assess/AnalysisDisplay";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Scale, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ImpactLevelBadge } from "./Badges";

type ComparisonDisplayProps = {
  analysis1: AnalyzeProductDescriptionOutput | null;
  productName1: string;
  analysis2: AnalyzeProductDescriptionOutput | null;
  productName2: string;
};

export default function ComparisonDisplay({ analysis1, productName1, analysis2, productName2 }: ComparisonDisplayProps) {
  
  let comparisonSummaryText = "Awaiting analysis for both products to provide a comparison summary.";
  let score1Display = <span className="text-3xl font-bold text-primary">{analysis1?.overallSustainabilityScore ?? "N/A"}</span>;
  let score2Display = <span className="text-3xl font-bold text-primary">{analysis2?.overallSustainabilityScore ?? "N/A"}</span>;

  if (analysis1 && analysis2) {
    const scoreA = analysis1.overallSustainabilityScore;
    const scoreB = analysis2.overallSustainabilityScore;

    if (scoreA > scoreB) {
      comparisonSummaryText = `${productName1 || "Product 1"} appears to be more sustainable overall.`;
      score1Display = <span className="text-3xl font-bold text-green-600 flex items-center justify-center">{scoreA} <TrendingUp className="ml-1 h-6 w-6"/></span>;
      score2Display = <span className="text-3xl font-bold text-red-600 flex items-center justify-center">{scoreB} <TrendingDown className="ml-1 h-6 w-6"/></span>;
    } else if (scoreB > scoreA) {
      comparisonSummaryText = `${productName2 || "Product 2"} appears to be more sustainable overall.`;
      score1Display = <span className="text-3xl font-bold text-red-600 flex items-center justify-center">{scoreA} <TrendingDown className="ml-1 h-6 w-6"/></span>;
      score2Display = <span className="text-3xl font-bold text-green-600 flex items-center justify-center">{scoreB} <TrendingUp className="ml-1 h-6 w-6"/></span>;
    } else {
      comparisonSummaryText = "Both products have similar overall sustainability scores based on the analysis.";
      score1Display = <span className="text-3xl font-bold text-yellow-600 flex items-center justify-center">{scoreA} <Minus className="ml-1 h-6 w-6"/></span>;
      score2Display = <span className="text-3xl font-bold text-yellow-600 flex items-center justify-center">{scoreB} <Minus className="ml-1 h-6 w-6"/></span>;
    }
  } else if (analysis1) {
    comparisonSummaryText = `Awaiting analysis for ${productName2 || "Product 2"} to compare.`;
  } else if (analysis2) {
    comparisonSummaryText = `Awaiting analysis for ${productName1 || "Product 1"} to compare.`;
  }


  const comparisonAspects = [
    { name: "Carbon Footprint", path1: analysis1?.detailedAnalysis.carbonFootprint, path2: analysis2?.detailedAnalysis.carbonFootprint },
    { name: "Water Usage", path1: analysis1?.detailedAnalysis.waterUsage, path2: analysis2?.detailedAnalysis.waterUsage },
    { name: "Material Sourcing", path1: analysis1?.detailedAnalysis.materialSourcing, path2: analysis2?.detailedAnalysis.materialSourcing },
    { name: "Recyclability", path1: analysis1?.detailedAnalysis.recyclability, path2: analysis2?.detailedAnalysis.recyclability },
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <Scale className="h-6 w-6 text-primary" />
          Product Comparison Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Comparison Highlights Section */}
        <section>
          <h3 className="text-xl font-semibold mb-3 font-headline text-primary">Comparison Highlights</h3>
          <Card className="bg-muted/30 p-4 shadow-inner">
            <div className="grid grid-cols-2 gap-4 mb-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">{productName1 || "Product 1"} Score</p>
                {score1Display}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{productName2 || "Product 2"} Score</p>
                {score2Display}
              </div>
            </div>
            <p className="text-center text-muted-foreground italic mb-4">{comparisonSummaryText}</p>
            
            {(analysis1 || analysis2) && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Environmental Aspect</TableHead>
                    <TableHead className="text-center">{productName1 || "Product 1"}</TableHead>
                    <TableHead className="text-center">{productName2 || "Product 2"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonAspects.map(aspect => (
                    <TableRow key={aspect.name}>
                      <TableCell className="font-medium">{aspect.name}</TableCell>
                      <TableCell className="text-center">
                        <ImpactLevelBadge level={aspect.path1?.impactLevel} />
                      </TableCell>
                      <TableCell className="text-center">
                        <ImpactLevelBadge level={aspect.path2?.impactLevel} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {analysis1?.detailedAnalysis.ingredientAnalysis || analysis2?.detailedAnalysis.ingredientAnalysis ? (
                    <TableRow>
                        <TableCell className="font-medium">Overall Ingredient Impact</TableCell>
                        <TableCell className="text-center">
                            <ImpactLevelBadge level={analysis1?.detailedAnalysis.ingredientAnalysis.ingredientImpactLevel} />
                        </TableCell>
                        <TableCell className="text-center">
                            <ImpactLevelBadge level={analysis2?.detailedAnalysis.ingredientAnalysis.ingredientImpactLevel} />
                        </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            )}
          </Card>
        </section>

        {/* Detailed Analysis Section */}
        <section>
           <h3 className="text-xl font-semibold mb-3 font-headline text-primary">Detailed Reports</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold mb-2 text-center font-headline text-primary/80">{productName1 || "Product 1"}</h4>
              {analysis1 ? (
                <AnalysisDisplay analysis={analysis1} />
              ) : (
                <p className="text-muted-foreground text-center p-4 border rounded-md">Analysis for Product 1 will appear here.</p>
              )}
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2 text-center font-headline text-primary/80">{productName2 || "Product 2"}</h4>
              {analysis2 ? (
                <AnalysisDisplay analysis={analysis2} />
              ) : (
                <p className="text-muted-foreground text-center p-4 border rounded-md">Analysis for Product 2 will appear here.</p>
              )}
            </div>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}

    