
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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const productInputSchema = z.object({
  productDescription: z.string().min(20).max(2000),
  productImage: z
    .custom<FileList>((val) => val instanceof FileList, "Please upload a file")
    .optional()
    .refine(
      (files) => !files || files.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE,
      `Max image size is 5MB.`
    )
    .refine(
      (files) => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
});

export default function EcoAssessPage() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeProductDescriptionOutput | null>(null);
  const [alternativesResult, setAlternativesResult] = useState<SuggestSustainableAlternativesOutput | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(false);
  const { toast } = useToast();

  const handleAnalyzeProduct = async (values: z.infer<typeof productInputSchema>) => {
    setIsLoadingAnalysis(true);
    setAnalysisResult(null);
    setAlternativesResult(null);

    let imageDataUri: string | undefined = undefined;
    if (values.productImage && values.productImage.length > 0) {
      const imageFile = values.productImage[0];
      try {
        imageDataUri = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(imageFile);
        });
      } catch (error) {
        console.error("Error converting image to data URI:", error);
        toast({
          title: "Image Processing Error",
          description: "Could not process the uploaded image. Please try again or proceed without an image.",
          variant: "destructive",
        });
        setIsLoadingAnalysis(false);
        return;
      }
    }

    try {
      const analysisData = await analyzeProductDescription({ 
        productDescription: values.productDescription,
        imageDataUri: imageDataUri,
      });
      setAnalysisResult(analysisData);
      
      toast({
        title: "Analysis Complete",
        description: "Product impact analysis finished successfully.",
      });

      setIsLoadingAlternatives(true);
      try {
        const alternativesData = await suggestSustainableAlternatives({
          productQuery: values.productDescription,
          environmentalImpactScore: analysisData.overallSustainabilityScore, 
          breakdown: analysisData.environmentalImpactAnalysis, // general summary
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
            <AnalysisDisplay analysis={analysisResult} />
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
