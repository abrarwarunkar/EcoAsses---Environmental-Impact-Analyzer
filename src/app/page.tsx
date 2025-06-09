
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import * as z from "zod";
import AppHeader from "@/components/eco-assess/AppHeader";
import ProductInputForm, { ProductDescImageInputFormValues } from "@/components/eco-assess/ProductInputForm";
import AnalysisDisplay from "@/components/eco-assess/AnalysisDisplay";
import AlternativesDisplay from "@/components/eco-assess/AlternativesDisplay";
import FeedbackForm from "@/components/eco-assess/FeedbackForm";
import ComparisonDisplay from "@/components/eco-assess/ComparisonDisplay";

import { analyzeProductDescription, AnalyzeProductDescriptionOutput } from "@/ai/flows/analyze-product-description";
import { suggestSustainableAlternatives, SuggestSustainableAlternativesOutput } from "@/ai/flows/suggest-sustainable-alternatives";
import { extractProductInfoFromUrl, ExtractProductInfoFromUrlOutput } from "@/ai/flows/extract-product-info-from-url";


import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2, Info, Link as LinkIcon } from "lucide-react";


const productUrlInputSchema = z.object({
  productUrl: z.string().url("Please enter a valid URL."),
});
type ProductUrlInputFormValues = z.infer<typeof productUrlInputSchema>;


const sustainabilityPreferenceOptions = [
  { id: "lowCarbon", label: "Low Carbon Footprint" },
  { id: "waterConservation", label: "Water Conservation" },
  { id: "recycledMaterials", label: "Recycled Materials" },
  { id: "renewableMaterials", label: "Renewable Materials" },
  { id: "highRecyclability", label: "High Recyclability" },
] as const;


export default function EcoAssessPage() {
  const [analysisMode, setAnalysisMode] = useState<"single" | "compare">("single");
  const [inputMethod, setInputMethod] = useState<"describe" | "url">("describe");

  // Shared states for single product analysis
  const [analysisResult, setAnalysisResult] = useState<AnalyzeProductDescriptionOutput | null>(null);
  const [alternativesResult, setAlternativesResult] = useState<SuggestSustainableAlternativesOutput | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(false);
  const [currentProductQuery, setCurrentProductQuery] = useState(""); // For alternatives flow
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  // URL input state
  const [productUrl, setProductUrl] = useState("");
  const [isLoadingUrlExtraction, setIsLoadingUrlExtraction] = useState(false);

  // Compare mode states
  const [analysisResult1, setAnalysisResult1] = useState<AnalyzeProductDescriptionOutput | null>(null);
  const [analysisResult2, setAnalysisResult2] = useState<AnalyzeProductDescriptionOutput | null>(null);
  const [product1InputDesc, setProduct1InputDesc] = useState<ProductDescImageInputFormValues | null>(null);
  const [product2InputDesc, setProduct2InputDesc] = useState<ProductDescImageInputFormValues | null>(null);
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

  // --- Analysis Logic ---
  const performFullAnalysis = async (description: string, imageDataUri?: string) => {
    setIsLoadingAnalysis(true);
    setAnalysisResult(null);
    setAlternativesResult(null);
    setCurrentProductQuery(description);

    try {
      const analysisData = await analyzeProductDescription({ 
        productDescription: description,
        imageDataUri: imageDataUri,
      });
      setAnalysisResult(analysisData);
      toast({ title: "Analysis Complete", description: "Product impact analysis finished." });

      // Suggest alternatives only in single mode and if analysis was successful
      if (analysisMode === "single") {
        setIsLoadingAlternatives(true);
        try {
          const alternativesData = await suggestSustainableAlternatives({
            productQuery: description,
            environmentalImpactScore: analysisData.overallSustainabilityScore, 
            breakdown: analysisData.environmentalImpactAnalysis + (analysisData.productIdentificationGuess ? ` (Identified as: ${analysisData.productIdentificationGuess})` : ""),
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
      }
    } catch (error) {
      console.error("Error analyzing product:", error);
      toast({ title: "Analysis Failed", description: "Could not analyze the product.", variant: "destructive" });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleAnalyzeDescriptionImage = async (values: ProductDescImageInputFormValues) => {
    let imageDataUri: string | undefined;
    try {
      imageDataUri = await convertToDataUri(values.productImage?.[0]);
    } catch (error) {
      console.error("Error converting image:", error);
      toast({ title: "Image Processing Error", description: "Could not process image. Try again or proceed without.", variant: "destructive" });
      // Optionally allow proceeding without image:
      // performFullAnalysis(values.productDescription, undefined);
      return;
    }
    performFullAnalysis(values.productDescription, imageDataUri);
  };

  const handleAnalyzeUrl = async () => {
    const validation = productUrlInputSchema.safeParse({ productUrl });
    if (!validation.success) {
      toast({ title: "Invalid URL", description: validation.error.errors[0].message, variant: "destructive" });
      return;
    }

    setIsLoadingUrlExtraction(true);
    setIsLoadingAnalysis(true); // Also set this true as it's part of the overall analysis process
    setAnalysisResult(null);
    setAlternativesResult(null);
    
    try {
      const extractedInfo = await extractProductInfoFromUrl({ productUrl: validation.data.productUrl });
      toast({ title: "URL Info Extracted", description: "Product details parsed from URL." });
      setIsLoadingUrlExtraction(false);
      // Use extracted info for full analysis
      await performFullAnalysis(extractedInfo.productDescription || "Product from URL", undefined); // No image with URL method for now
    } catch (error) {
      console.error("Error extracting from URL or analyzing:", error);
      toast({ title: "URL Analysis Failed", description: "Could not process the URL.", variant: "destructive" });
      setIsLoadingUrlExtraction(false);
      setIsLoadingAnalysis(false);
    }
  };
  

  // --- Compare Mode Logic ---
  const handleAnalyzeComparison = async () => {
    if (!product1InputDesc || !product2InputDesc) {
      toast({ title: "Missing Information", description: "Please provide details for both products.", variant: "destructive" });
      return;
    }

    setIsLoadingProduct1(true);
    setIsLoadingProduct2(true);
    setAnalysisResult1(null);
    setAnalysisResult2(null);

    let imageDataUri1: string | undefined;
    let imageDataUri2: string | undefined;

    try { imageDataUri1 = await convertToDataUri(product1InputDesc.productImage?.[0]); } catch (e) { /* already handled */ }
    try { imageDataUri2 = await convertToDataUri(product2InputDesc.productImage?.[0]); } catch (e) { /* already handled */ }

    // Analyze Product 1
    if (product1InputDesc) {
      try {
        const analysisData1 = await analyzeProductDescription({
          productDescription: product1InputDesc.productDescription,
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
    } else { setIsLoadingProduct1(false); }

    // Analyze Product 2
    if (product2InputDesc) {
        try {
            const analysisData2 = await analyzeProductDescription({
            productDescription: product2InputDesc.productDescription,
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
    } else { setIsLoadingProduct2(false); }
  };
  
  const LoadingSkeleton = () => (
    <Card className="shadow-lg mt-8">
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

  const isCompareButtonDisabled = isLoadingProduct1 || isLoadingProduct2 || !product1InputDesc?.productDescription || !product2InputDesc?.productDescription;
  const product1Name = useMemo(() => product1InputDesc?.productDescription.substring(0,30) + (product1InputDesc && product1InputDesc.productDescription.length > 30 ? "..." : "") || "Product 1", [product1InputDesc]);
  const product2Name = useMemo(() => product2InputDesc?.productDescription.substring(0,30) + (product2InputDesc && product2InputDesc.productDescription.length > 30 ? "..." : "") || "Product 2", [product2InputDesc]);

  const handleInputMethodChange = (value: string) => {
    setInputMethod(value as "describe" | "url");
    // Reset results when changing input method in single mode
    setAnalysisResult(null);
    setAlternativesResult(null);
    setProductUrl(""); // Clear URL input if switching away
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Tabs value={analysisMode} onValueChange={(value) => setAnalysisMode(value as "single" | "compare")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Single Product Analysis</TabsTrigger>
              <TabsTrigger value="compare">Compare Two Products</TabsTrigger>
            </TabsList>
            
            {/* Single Product Analysis Tab Content */}
            <TabsContent value="single" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Choose Input Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={inputMethod} onValueChange={handleInputMethodChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="describe">Describe / Upload</TabsTrigger>
                      <TabsTrigger value="url">Use URL</TabsTrigger>
                    </TabsList>

                    <TabsContent value="describe" className="mt-6">
                      <ProductInputForm onSubmit={handleAnalyzeDescriptionImage} isLoading={isLoadingAnalysis || isLoadingAlternatives} />
                    </TabsContent>

                    <TabsContent value="url" className="mt-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="font-headline text-2xl flex items-center gap-2"><LinkIcon /> Analyze by Product URL</CardTitle>
                          <CardDescription>Enter the URL of a product page to extract its details for analysis.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="productUrlInput">Product URL</Label>
                            <Input 
                              id="productUrlInput"
                              type="url" 
                              placeholder="https://www.example.com/product-page" 
                              value={productUrl}
                              onChange={(e) => setProductUrl(e.target.value)} 
                            />
                          </div>
                          <Button 
                            onClick={handleAnalyzeUrl} 
                            disabled={isLoadingUrlExtraction || isLoadingAnalysis || !productUrl}
                            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                          >
                            {(isLoadingUrlExtraction || isLoadingAnalysis) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Fetch & Analyze URL
                          </Button>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              
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

              {(isLoadingAnalysis || isLoadingUrlExtraction) && <LoadingSkeleton />}
              {analysisResult && !isLoadingAnalysis && !isLoadingUrlExtraction && (
                <div className="mt-8"><AnalysisDisplay analysis={analysisResult} /></div>
              )}
              {isLoadingAlternatives && !isLoadingAnalysis && !isLoadingUrlExtraction && <LoadingSkeleton />}
              {alternativesResult && !isLoadingAlternatives && !isLoadingAnalysis && !isLoadingUrlExtraction && (
                <div className="mt-8"><AlternativesDisplay alternatives={alternativesResult} /></div>
              )}
            </TabsContent>

            {/* Compare Two Products Tab Content */}
            <TabsContent value="compare" className="mt-6 space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold mb-3 text-center font-headline text-primary">Product 1</h2>
                  <ProductInputForm 
                    onSubmit={(values) => setProduct1InputDesc(values)} 
                    isLoading={isLoadingProduct1} 
                    formId="product1-form"
                    submitButtonText="Set Product 1 for Comparison"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3 text-center font-headline text-primary">Product 2</h2>
                  <ProductInputForm 
                    onSubmit={(values) => setProduct2InputDesc(values)} 
                    isLoading={isLoadingProduct2}
                    formId="product2-form"
                    submitButtonText="Set Product 2 for Comparison"
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
              {(isLoadingProduct1 || isLoadingProduct2) && (analysisResult1 || analysisResult2) && <LoadingSkeleton />}
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

