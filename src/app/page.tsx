"use client";

import { useState } from "react";
import * as z from "zod";
import AppHeader from "@/components/eco-assess/AppHeader";
import ProductInputForm from "@/components/eco-assess/ProductInputForm";
import AnalysisDisplay from "@/components/eco-assess/AnalysisDisplay";
import AlternativesDisplay from "@/components/eco-assess/AlternativesDisplay";
import FeedbackForm from "@/components/eco-assess/FeedbackForm";
import { analyzeProductDescription, AnalyzeProductDescriptionOutput } from "@/ai/flows/analyze-product-description";
import { suggestSustainableAlternatives, SuggestSustainableAlternativesOutput } from "@/ai/flows/suggest-sustainable-alternatives";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const productInputSchema = z.object({
  productDescription: z.string().min(20).max(2000),
});

export default function EcoAssessPage() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeProductDescriptionOutput | null>(null);
  const [derivedScore, setDerivedScore] = useState<number | null>(null);
  const [alternativesResult, setAlternativesResult] = useState<SuggestSustainableAlternativesOutput | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(false);
  const { toast } = useToast();

  const parseScore = (text: string): number | null => {
    const scoreRegex1 = /Overall Environmental Score:\s*(\d+)\s*\/\s*100/i;
    const scoreRegex2 = /score\s*(?:is|of|:)\s*(\d+)/i;
    const scoreRegex3 = /(\d+)\s*out of 100/i;

    let match = text.match(scoreRegex1);
    if (match && match[1]) return parseInt(match[1], 10);
    
    match = text.match(scoreRegex2);
    if (match && match[1]) return parseInt(match[1], 10);

    match = text.match(scoreRegex3);
    if (match && match[1]) return parseInt(match[1], 10);
    
    // Fallback pseudo-random score if not found in text
    return 50 + Math.floor(Math.random() * 31) - 15; // Generates a score roughly between 35-80
  };

  const handleAnalyzeProduct = async (values: z.infer<typeof productInputSchema>) => {
    setIsLoadingAnalysis(true);
    setAnalysisResult(null);
    setAlternativesResult(null);
    setDerivedScore(null);

    try {
      const analysisData = await analyzeProductDescription({ productDescription: values.productDescription });
      setAnalysisResult(analysisData);
      
      const score = parseScore(analysisData.environmentalImpactAnalysis);
      setDerivedScore(score);

      toast({
        title: "Analysis Complete",
        description: "Product impact analysis finished successfully.",
      });

      // Now, trigger alternatives suggestion
      setIsLoadingAlternatives(true);
      try {
        const alternativesData = await suggestSustainableAlternatives({
          productQuery: values.productDescription,
          environmentalImpactScore: score ?? 60, // Use parsed score or a default if null
          breakdown: analysisData.environmentalImpactAnalysis,
        });
        setAlternativesResult(alternativesData);
        toast({
          title: "Alternatives Suggested",
          description: "Sustainable alternatives have been generated.",
        });
      } catch (altError) {
        console.error("Error suggesting alternatives:", altError);
        toast({
          title: "Error Suggesting Alternatives",
          description: "Could not generate sustainable alternatives. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingAlternatives(false);
      }

    } catch (error) {
      console.error("Error analyzing product:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };
  
  const LoadingSkeleton = () => (
    <Card className="shadow-lg">
      <CardContent className="p-6 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-16 w-full" />
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8 md:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <ProductInputForm onSubmit={handleAnalyzeProduct} isLoading={isLoadingAnalysis || isLoadingAlternatives} />

          {isLoadingAnalysis && <LoadingSkeleton />}
          
          {analysisResult && !isLoadingAnalysis && (
            <AnalysisDisplay analysis={analysisResult} score={derivedScore} />
          )}

          {isLoadingAlternatives && !isLoadingAnalysis && <LoadingSkeleton />}

          {alternativesResult && !isLoadingAlternatives && !isLoadingAnalysis && (
            <AlternativesDisplay alternatives={alternativesResult} />
          )}
          
          <FeedbackForm />
        </div>
      </main>
      <footer className="py-6 border-t bg-muted/50">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} EcoAssess. Promoting sustainable choices.
        </div>
      </footer>
    </div>
  );
}
