
"use client";

import { useState, useMemo } from "react";
import * as z from "zod";
import AppHeader from "@/components/eco-assess/AppHeader";
import ProductInputForm from "@/components/eco-assess/ProductInputForm";
import AnalysisDisplay from "@/components/eco-assess/AnalysisDisplay";
import AlternativesDisplay from "@/components/eco-assess/AlternativesDisplay";
import FeedbackForm from "@/components/eco-assess/FeedbackForm";
import ComparisonDisplay from "@/components/eco-assess/ComparisonDisplay";

import { analyzeProductDescription, AnalyzeProductDescriptionOutput } from "@/ai/flows/analyze-product-description";
import { suggestSustainableAlternatives, SuggestSustainableAlternativesOutput } from "@/ai/flows/suggest-sustainable-alternatives";

import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Info } from "lucide-react";


const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const productInputSchema = z.object({
  productDescription: z.string().min(20, "Min 20 chars").max(2000, "Max 2000 chars"),
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
type ProductInputFormValues = z.infer<typeof productInputSchema>;

const sustainabilityPreferenceOptions = [
  { id: "lowCarbon", label: "Low Carbon Footprint" },
  { id: "waterConservation", label: "Water Conservation" },
  { id: "recycledMaterials", label: "Recycled Materials" },
  { id: "renewableMaterials", label: "Renewable Materials" },
  { id: "highRecyclability", label: "High Recyclability" },
] as const;


export default function EcoAssessPage() {
  const [mode, setMode] = useState<"single" | "compare">("single");

  // Single mode states
  const [analysisResult, setAnalysisResult] = useState<AnalyzeProductDescriptionOutput | null>(null);
  const [alternativesResult, setAlternativesResult] = useState<SuggestSustainableAlternativesOutput | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(false);
  const [currentProductDescription, setCurrentProductDescription] = useState("");
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  // Compare mode states
  const [analysisResult1, setAnalysisResult1] = useState<AnalyzeProductDescriptionOutput | null>(null);
  const [analysisResult2, setAnalysisResult2] = useState<AnalyzeProductDescriptionOutput | null>(null);
  const [product1Input, setProduct1Input] = useState<ProductInputFormValues | null>(null);
  const [product2Input, setProduct2Input] = useState<ProductInputFormValues | null>(null);
  const [isLoadingProduct1, setIsLoadingProduct1] = useState(false);
  const [isLoadingProduct2, setIsLoadingProduct2] = useState(false);
  
  const { toast } = useToast();

  const convertToDataUri = async (file: File | undefined): Promise<string | undefined> => {
    if (!file) return undefined;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyzeSingleProduct = async (values: ProductInputFormValues) => {
    setIsLoadingAnalysis(true);
    setAnalysisResult(null);
    setAlternativesResult(null);
    setCurrentProductDescription(values.productDescription);

    let imageDataUri: string | undefined;
    try {
      imageDataUri = await convertToDataUri(values.productImage?.[0]);
    } catch (error) {
      console.error("Error converting image for single product:", error);
      toast({ title: "Image Processing Error", description: "Could not process image. Try again or proceed without.", variant: "destructive" });
      setIsLoadingAnalysis(false);
      return;
    }

    try {
      const analysisData = await analyzeProductDescription({ 
        productDescription: values.productDescription,
        imageDataUri: imageDataUri,
      });
      setAnalysisResult(analysisData);
      toast({ title: "Analysis Complete", description: "Product impact analysis finished." });

      setIsLoadingAlternatives(true);
      try {
        const alternativesData = await suggestSustainableAlternatives({
          productQuery: values.productDescription,
          environmentalImpactScore: analysisData.overallSustainabilityScore, 
          breakdown: analysisData.environmentalImpactAnalysis,
          sustainabilityPreferences: selectedPreferences,
        });
        setAlternativesResult(alternativesData);
        toast({ title: "Alternatives Suggested", description: "Sustainable alternatives generated." });
      } catch (altError) {
        console.error("Error suggesting alternatives:", altError);
        toast({ title: "Error Suggesting Alternatives", description: "Could not generate alternatives.", variant: "destructive" });
      } finally {
        setIsLoadingAlternatives(false);
      }
    } catch (error) {
      console.error("Error analyzing product:", error);
      toast({ title: "Analysis Failed", description: "Could not analyze the product.", variant: "destructive" });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleAnalyzeComparison = async () => {
    if (!product1Input || !product2Input) {
      toast({ title: "Missing Information", description: "Please provide details for both products.", variant: "destructive" });
      return;
    }

    setIsLoadingProduct1(true);
    setIsLoadingProduct2(true);
    setAnalysisResult1(null);
    setAnalysisResult2(null);

    let imageDataUri1: string | undefined;
    let imageDataUri2: string | undefined;

    try {
      imageDataUri1 = await convertToDataUri(product1Input.productImage?.[0]);
    } catch (error) {
      console.error("Error converting image for product 1:", error);
      toast({ title: "Image Error (Product 1)", description: "Could not process image for Product 1.", variant: "destructive" });
      setIsLoadingProduct1(false); // only stop this one if image fails
    }
    try {
      imageDataUri2 = await convertToDataUri(product2Input.productImage?.[0]);
    } catch (error) {
      console.error("Error converting image for product 2:", error);
      toast({ title: "Image Error (Product 2)", description: "Could not process image for Product 2.", variant: "destructive" });
      setIsLoadingProduct2(false); // only stop this one if image fails
    }

    // Analyze Product 1
    if (product1Input) {
      try {
        const analysisData1 = await analyzeProductDescription({
          productDescription: product1Input.productDescription,
          imageDataUri: imageDataUri1,
        });
        setAnalysisResult1(analysisData1);
        toast({ title: "Product 1 Analysis Complete" });
      } catch (error) {
        console.error("Error analyzing product 1:", error);
        toast({ title: "Product 1 Analysis Failed", variant: "destructive" });
      } finally {
        setIsLoadingProduct1(false);
      }
    } else {
        setIsLoadingProduct1(false);
    }


    // Analyze Product 2
    if (product2Input) {
        try {
            const analysisData2 = await analyzeProductDescription({
            productDescription: product2Input.productDescription,
            imageDataUri: imageDataUri2,
            });
            setAnalysisResult2(analysisData2);
            toast({ title: "Product 2 Analysis Complete" });
        } catch (error) {
            console.error("Error analyzing product 2:", error);
            toast({ title: "Product 2 Analysis Failed", variant: "destructive" });
        } finally {
            setIsLoadingProduct2(false);
        }
    } else {
        setIsLoadingProduct2(false);
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

  const handlePreferenceChange = (preferenceId: string) => {
    setSelectedPreferences(prev => 
      prev.includes(preferenceId) 
        ? prev.filter(p => p !== preferenceId)
        : [...prev, preferenceId]
    );
  };

  const isCompareButtonDisabled = isLoadingProduct1 || isLoadingProduct2 || !product1Input?.productDescription || !product2Input?.productDescription;

  const product1Name = useMemo(() => product1Input?.productDescription.substring(0,30) + (product1Input && product1Input.productDescription.length > 30 ? "..." : "") || "Product 1", [product1Input]);
  const product2Name = useMemo(() => product2Input?.productDescription.substring(0,30) + (product2Input && product2Input.productDescription.length > 30 ? "..." : "") || "Product 2", [product2Input]);


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Tabs value={mode} onValueChange={(value) => setMode(value as "single" | "compare")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Single Product Analysis</TabsTrigger>
              <TabsTrigger value="compare">Compare Two Products</TabsTrigger>
            </TabsList>
            <TabsContent value="single" className="mt-6">
              <ProductInputForm onSubmit={handleAnalyzeSingleProduct} isLoading={isLoadingAnalysis || isLoadingAlternatives} />
              
              <Card className="mt-8 shadow-lg">
                <CardHeader>
                  <CardTitle className="font-headline text-xl">Sustainability Preferences (Optional)</CardTitle>
                  <CardDescription>Select aspects you care about most for alternative suggestions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sustainabilityPreferenceOptions.map(pref => (
                    <div key={pref.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={pref.id} 
                        checked={selectedPreferences.includes(pref.label)}
                        onCheckedChange={() => handlePreferenceChange(pref.label)}
                      />
                      <Label htmlFor={pref.id} className="font-normal cursor-pointer">{pref.label}</Label>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {isLoadingAnalysis && <div className="mt-8"><LoadingSkeleton /></div>}
              {analysisResult && !isLoadingAnalysis && (
                <div className="mt-8"><AnalysisDisplay analysis={analysisResult} /></div>
              )}
              {isLoadingAlternatives && !isLoadingAnalysis && <div className="mt-8"><LoadingSkeleton /></div>}
              {alternativesResult && !isLoadingAlternatives && !isLoadingAnalysis && (
                <div className="mt-8"><AlternativesDisplay alternatives={alternativesResult} /></div>
              )}
            </TabsContent>

            <TabsContent value="compare" className="mt-6 space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold mb-3 text-center font-headline text-primary">Product 1</h2>
                  <ProductInputForm 
                    onSubmit={(values) => setProduct1Input(values)} 
                    isLoading={isLoadingProduct1} 
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3 text-center font-headline text-primary">Product 2</h2>
                  <ProductInputForm 
                    onSubmit={(values) => setProduct2Input(values)} 
                    isLoading={isLoadingProduct2}
                  />
                </div>
              </div>
              <Button 
                onClick={handleAnalyzeComparison} 
                disabled={isCompareButtonDisabled}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3"
                size="lg"
              >
                {(isLoadingProduct1 || isLoadingProduct2) && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Compare Products
              </Button>
              {(isLoadingProduct1 || isLoadingProduct2) && (analysisResult1 || analysisResult2) && <div className="mt-8"><LoadingSkeleton /></div>}
              {(analysisResult1 || analysisResult2) && !(isLoadingProduct1 || isLoadingProduct2) &&
                <div className="mt-8">
                  <ComparisonDisplay 
                    analysis1={analysisResult1} 
                    productName1={product1Name}
                    analysis2={analysisResult2} 
                    productName2={productName2}
                  />
                </div>
              }
            </TabsContent>
          </Tabs>
          
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
