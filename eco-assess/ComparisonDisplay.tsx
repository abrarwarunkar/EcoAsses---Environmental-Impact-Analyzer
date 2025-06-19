
import type { AnalyzeProductDescriptionOutput } from "@/ai/flows/analyze-product-description";
import AnalysisDisplay from "@/components/eco-assess/AnalysisDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Scale } from "lucide-react";

type ComparisonDisplayProps = {
  analysis1: AnalyzeProductDescriptionOutput | null;
  productName1: string;
  analysis2: AnalyzeProductDescriptionOutput | null;
  productName2: string;
};

export default function ComparisonDisplay({ analysis1, productName1, analysis2, productName2 }: ComparisonDisplayProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <Scale className="h-6 w-6 text-primary" />
          Product Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-3 text-center font-headline text-primary">{productName1 || "Product 1"}</h3>
            {analysis1 ? (
              <AnalysisDisplay analysis={analysis1} />
            ) : (
              <p className="text-muted-foreground text-center p-4 border rounded-md">Analysis for Product 1 will appear here.</p>
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3 text-center font-headline text-primary">{productName2 || "Product 2"}</h3>
            {analysis2 ? (
              <AnalysisDisplay analysis={analysis2} />
            ) : (
              <p className="text-muted-foreground text-center p-4 border rounded-md">Analysis for Product 2 will appear here.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
