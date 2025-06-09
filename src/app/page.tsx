
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import * as z from "zod";
import AppHeader from "@/components/eco-assess/AppHeader";
import ProductInputForm, { ProductDescImageInputFormValues } from "@/components/eco-assess/ProductInputForm";
import AnalysisDisplay from "@/components/eco-assess/AnalysisDisplay";
import AlternativesDisplay from "@/components/eco-assess/AlternativesDisplay";
import FeedbackForm from "@/components/eco-assess/FeedbackForm";
import ComparisonDisplay from "@/components/eco-assess/ComparisonDisplay";
import ProductInsightsDisplay from "@/components/eco-assess/ProductInsightsDisplay";


import { analyzeProductDescription, AnalyzeProductDescriptionOutput } from "@/ai/flows/analyze-product-description";
import { suggestSustainableAlternatives, SuggestSustainableAlternativesOutput } from "@/ai/flows/suggest-sustainable-alternatives";
import { extractProductInfoFromUrl, ExtractProductInfoFromUrlOutput } from "@/ai/flows/extract-product-info-from-url";
import { generateProductInsights, GenerateProductInsightsOutput } from "@/ai/flows/generate-product-insights";


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
  const [insightsResult, setInsightsResult] = useState<GenerateProductInsightsOutput | null>(null);
  
  const [isLoadingMainAnalysis, setIsLoadingMainAnalysis] = useState(false);
  const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(false);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  const [currentProductQuery, setCurrentProductQuery] = useState("");
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  // URL input state for single mode
  const [productUrl, setProductUrl] = useState("");
  const [isLoadingUrlExtraction, setIsLoadingUrlExtraction] = useState(false);

  // Compare mode states
  const [analysisResult1, setAnalysisResult1] = useState<AnalyzeProductDescriptionOutput | null>(null);
  const [analysisResult2, setAnalysisResult2] = useState<AnalyzeProductDescriptionOutput | null>(null);
  
  const [product1InputDesc, setProduct1InputDesc] = useState<ProductDescImageInputFormValues | null>(null);
  const [product2InputDesc, setProduct2InputDesc] = useState<ProductDescImageInputFormValues | null>(null);
  
  const [product1InputMethod, setProduct1InputMethod] = useState<'describe' | 'url'>('describe');
  const [product2InputMethod, setProduct2InputMethod] = useState<'describe' | 'url'>('describe');
  
  const [product1Url, setProduct1Url] = useState("");
  const [product2Url, setProduct2Url] = useState("");

  const [isLoadingProduct1, setIsLoadingProduct1] = useState(false);
  const [isLoadingProduct2, setIsLoadingProduct2] = useState(false);
  const [isLoadingProduct1UrlExtraction, setIsLoadingProduct1UrlExtraction] = useState(false);
  const [isLoadingProduct2UrlExtraction, setIsLoadingProduct2UrlExtraction] = useState(false);
  
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
    setIsLoadingMainAnalysis(true);
    setAnalysisResult(null);
    setAlternativesResult(null);
    setInsightsResult(null);
    setCurrentProductQuery(description);

    let analysisData: AnalyzeProductDescriptionOutput | null = null;

    try {
      analysisData = await analyzeProductDescription({ 
        productDescription: description,
        imageDataUri: imageDataUri,
      });
      setAnalysisResult(analysisData);
      toast({ title: "Analysis Complete", description: "Product impact analysis finished." });
    } catch (error) {
      console.error("Error analyzing product:", error);
      toast({ title: "Analysis Failed", description: "Could not analyze the product.", variant: "destructive" });
      setIsLoadingMainAnalysis(false); // Stop main loading on error
      throw error; 
    } finally {
       setIsLoadingMainAnalysis(false); // Always stop main loading after attempt
    }

    if (analysisData) {
      // Generate Insights (New)
      setIsLoadingInsights(true);
      try {
        const insightsData = await generateProductInsights({
          productQuery: description, 
          analysisResult: analysisData,
        });
        setInsightsResult(insightsData);
        toast({ title: "Insights Generated", description: "Additional tips and insights are ready." });
      } catch (insightError) {
        console.error("Error generating insights:", insightError);
        toast({ title: "Insights Generation Failed", description: "Could not generate additional insights.", variant: "destructive" });
      } finally {
        setIsLoadingInsights(false);
      }

      // Suggest Alternatives (Existing)
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
    }
    return analysisData; // Return analysis data for compare mode
  };

  const handleAnalyzeDescriptionImage = async (values: ProductDescImageInputFormValues) => {
    let imageDataUri: string | undefined;
    try {
      imageDataUri = await convertToDataUri(values.productImage?.[0]);
    } catch (error) {
      console.error("Error converting image:", error);
      toast({ title: "Image Processing Error", description: "Could not process image. Try again or proceed without.", variant: "destructive" });
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
    // Main analysis loading will be handled by performFullAnalysis
    setAnalysisResult(null);
    setAlternativesResult(null);
    setInsightsResult(null);
    
    try {
      const extractedInfo = await extractProductInfoFromUrl({ productUrl: validation.data.productUrl });
      toast({ title: "URL Info Extracted", description: "Product details parsed from URL." });
      setIsLoadingUrlExtraction(false); // URL extraction done
      await performFullAnalysis(extractedInfo.productDescription || "Product from URL", undefined);
    } catch (error) {
      console.error("Error extracting from URL or analyzing:", error);
      toast({ title: "URL Analysis Failed", description: "Could not process the URL.", variant: "destructive" });
      setIsLoadingUrlExtraction(false);
      // Main analysis loading is handled internally by performFullAnalysis
    }
  };
  

  const analyzeSingleProductForComparison = async (
    productNum: 1 | 2,
    inputMethod: 'describe' | 'url',
    descriptionData: ProductDescImageInputFormValues | null,
    urlData: string | null
  ): Promise<AnalyzeProductDescriptionOutput | null> => {
    const setIsLoading = productNum === 1 ? setIsLoadingProduct1 : setIsLoadingProduct2;
    const setIsLoadingUrl = productNum === 1 ? setIsLoadingProduct1UrlExtraction : setIsLoadingProduct2UrlExtraction;
    const setAnalysisRes = productNum === 1 ? setAnalysisResult1 : setAnalysisResult2;
  
    setIsLoading(true);
    setAnalysisRes(null);
  
    let productDescriptionToAnalyze: string;
    let imageDataUriToAnalyze: string | undefined;
  
    try {
      if (inputMethod === 'url') {
        if (!urlData) throw new Error(`Product ${productNum} URL is missing.`);
        const validation = productUrlInputSchema.safeParse({ productUrl: urlData });
        if (!validation.success) throw new Error(`Product ${productNum} URL is invalid: ${validation.error.errors[0].message}`);
        
        setIsLoadingUrl(true);
        const extractedInfo = await extractProductInfoFromUrl({ productUrl: validation.data.productUrl });
        toast({ title: `Product ${productNum} URL Info Extracted` });
        setIsLoadingUrl(false);
        productDescriptionToAnalyze = extractedInfo.productDescription || `Product ${productNum} from URL`;
      } else { // 'describe'
        if (!descriptionData?.productDescription) throw new Error(`Product ${productNum} description is missing.`);
        productDescriptionToAnalyze = descriptionData.productDescription;
        try {
          imageDataUriToAnalyze = await convertToDataUri(descriptionData.productImage?.[0]);
        } catch (imgError) {
          console.error(`Error converting image for product ${productNum}:`, imgError);
          toast({ title: `Image Error Product ${productNum}`, description: "Could not process image.", variant: "destructive" });
          // Proceed without image
        }
      }
  
      const analysisData = await analyzeProductDescription({
        productDescription: productDescriptionToAnalyze,
        imageDataUri: imageDataUriToAnalyze,
      });
      setAnalysisRes(analysisData);
      toast({ title: `Product ${productNum} Analysis Complete` });
      return analysisData;
    } catch (error: any) {
      console.error(`Error analyzing product ${productNum}:`, error);
      toast({ title: `Product ${productNum} Analysis Failed`, description: error.message || "An unknown error occurred.", variant: "destructive" });
      setIsLoadingUrl(false); // Ensure loading is stopped on error
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeComparison = async () => {
    // Parallel analysis
    await Promise.all([
      analyzeSingleProductForComparison(1, product1InputMethod, product1InputDesc, product1Url),
      analyzeSingleProductForComparison(2, product2InputMethod, product2InputDesc, product2Url)
    ]);
  };
  
  const LoadingSkeleton = ({ title = "Loading Analysis..."}: {title?: string}) => (
    <Card className="shadow-lg mt-8">
      <CardHeader>
          <CardTitle>{title}</CardTitle>
      </CardHeader>
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

  const isCompareButtonDisabled = 
    isLoadingProduct1 || isLoadingProduct2 || isLoadingProduct1UrlExtraction || isLoadingProduct2UrlExtraction ||
    (product1InputMethod === 'describe' && !product1InputDesc?.productDescription) ||
    (product1InputMethod === 'url' && !product1Url) ||
    (product2InputMethod === 'describe' && !product2InputDesc?.productDescription) ||
    (product2InputMethod === 'url' && !product2Url);

  const product1Name = useMemo(() => {
    if (product1InputMethod === 'url') {
      if (analysisResult1?.productIdentificationGuess) return analysisResult1.productIdentificationGuess;
      if (analysisResult1) return "Product from URL";
      return product1Url ? (product1Url.length > 30 ? product1Url.substring(0, 27) + "..." : product1Url) : "Product 1";
    }
    return product1InputDesc?.productDescription.substring(0,30) + (product1InputDesc && product1InputDesc.productDescription.length > 30 ? "..." : "") || "Product 1";
  }, [product1InputMethod, product1Url, product1InputDesc, analysisResult1]);

  const product2Name = useMemo(() => {
    if (product2InputMethod === 'url') {
      if (analysisResult2?.productIdentificationGuess) return analysisResult2.productIdentificationGuess;
      if (analysisResult2) return "Product from URL";
      return product2Url ? (product2Url.length > 30 ? product2Url.substring(0, 27) + "..." : product2Url) : "Product 2";
    }
    return product2InputDesc?.productDescription.substring(0,30) + (product2InputDesc && product2InputDesc.productDescription.length > 30 ? "..." : "") || "Product 2";
  }, [product2InputMethod, product2Url, product2InputDesc, analysisResult2]);


  const handleInputMethodChange = (value: string) => {
    setInputMethod(value as "describe" | "url");
    setAnalysisResult(null);
    setAlternativesResult(null);
    setInsightsResult(null);
    setProductUrl(""); 
  }
  
  const isProcessingSingleProduct = isLoadingMainAnalysis || isLoadingUrlExtraction || isLoadingInsights || isLoadingAlternatives;


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
                      <ProductInputForm 
                        onSubmit={handleAnalyzeDescriptionImage} 
                        isLoading={isProcessingSingleProduct} 
                      />
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
                              disabled={isProcessingSingleProduct}
                            />
                          </div>
                          <Button 
                            onClick={handleAnalyzeUrl} 
                            disabled={isProcessingSingleProduct || !productUrl}
                            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                          >
                            {(isLoadingUrlExtraction || isLoadingMainAnalysis) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
                        disabled={isProcessingSingleProduct}
                      />
                      <Label htmlFor={pref.id} className="font-normal cursor-pointer">{pref.label}</Label>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {(isLoadingMainAnalysis || isLoadingUrlExtraction) && !analysisResult && <LoadingSkeleton title="Analyzing Product..."/>}
              {analysisResult && (
                <div className="mt-8"><AnalysisDisplay analysis={analysisResult} /></div>
              )}
              
              {isLoadingInsights && !insightsResult && analysisResult && <LoadingSkeleton title="Generating Insights..."/>}
              {insightsResult && (
                <div className="mt-8"><ProductInsightsDisplay insights={insightsResult} /></div>
              )}

              {isLoadingAlternatives && !alternativesResult && analysisResult && <LoadingSkeleton title="Suggesting Alternatives..."/>}
              {alternativesResult && (
                <div className="mt-8"><AlternativesDisplay alternatives={alternativesResult} /></div>
              )}
            </TabsContent>

            <TabsContent value="compare" className="mt-6 space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Product 1 Input Area */}
                <div>
                  <h2 className="text-xl font-semibold mb-3 text-center font-headline text-primary">Product 1</h2>
                  <Tabs value={product1InputMethod} onValueChange={(val) => { setProduct1InputMethod(val as 'describe' | 'url'); setAnalysisResult1(null); }} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="describe">Describe/Image</TabsTrigger>
                      <TabsTrigger value="url">From URL</TabsTrigger>
                    </TabsList>
                    <TabsContent value="describe" className="mt-4">
                      <ProductInputForm 
                        onSubmit={(values) => {
                           setProduct1InputDesc(values);
                           setProduct1Url(""); // Clear URL if using describe
                           toast({ title: "Product 1 Details Set"});
                        }} 
                        isLoading={isLoadingProduct1 && product1InputMethod === 'describe'} 
                        formId="product1-form-describe"
                        submitButtonText="Set Details for Product 1"
                      />
                    </TabsContent>
                    <TabsContent value="url" className="mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Product 1 URL</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Input 
                            type="url" 
                            placeholder="https://example.com/product1" 
                            value={product1Url}
                            onChange={(e) => setProduct1Url(e.target.value)} 
                            disabled={isLoadingProduct1 || isLoadingProduct2}
                          />
                           <Button className="w-full" onClick={() => {
                            setProduct1InputDesc(null); 
                            if(product1Url) toast({ title: "Product 1 URL Set"}); else toast({title: "Product 1 URL Cleared/Empty", variant: "default"});
                          }} disabled={isLoadingProduct1 || isLoadingProduct2 || product1InputMethod !== 'url'}>
                            {product1Url ? "Confirm Product 1 URL" : "Clear Product 1 URL"}
                          </Button>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Product 2 Input Area */}
                <div>
                  <h2 className="text-xl font-semibold mb-3 text-center font-headline text-primary">Product 2</h2>
                  <Tabs value={product2InputMethod} onValueChange={(val) => { setProduct2InputMethod(val as 'describe' | 'url'); setAnalysisResult2(null); }} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="describe">Describe/Image</TabsTrigger>
                      <TabsTrigger value="url">From URL</TabsTrigger>
                    </TabsList>
                    <TabsContent value="describe" className="mt-4">
                      <ProductInputForm 
                        onSubmit={(values) => {
                          setProduct2InputDesc(values);
                          setProduct2Url("");
                          toast({ title: "Product 2 Details Set"});
                        }} 
                        isLoading={isLoadingProduct2 && product2InputMethod === 'describe'}
                        formId="product2-form-describe"
                        submitButtonText="Set Details for Product 2"
                      />
                    </TabsContent>
                    <TabsContent value="url" className="mt-4">
                       <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Product 2 URL</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Input 
                            type="url" 
                            placeholder="https://example.com/product2" 
                            value={product2Url}
                            onChange={(e) => setProduct2Url(e.target.value)} 
                            disabled={isLoadingProduct1 || isLoadingProduct2}
                          />
                          <Button className="w-full" onClick={() => {
                            setProduct2InputDesc(null);
                            if(product2Url) toast({ title: "Product 2 URL Set"}); else toast({title: "Product 2 URL Cleared/Empty", variant: "default"});
                          }} disabled={isLoadingProduct1 || isLoadingProduct2 || product2InputMethod !== 'url'}>
                             {product2Url ? "Confirm Product 2 URL" : "Clear Product 2 URL"}
                          </Button>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
              <Button 
                onClick={handleAnalyzeComparison} 
                disabled={isCompareButtonDisabled}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3"
                size="lg"
              >
                {(isLoadingProduct1 || isLoadingProduct2 || isLoadingProduct1UrlExtraction || isLoadingProduct2UrlExtraction) && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Compare Products
              </Button>
              {(isLoadingProduct1 || isLoadingProduct2 || isLoadingProduct1UrlExtraction || isLoadingProduct2UrlExtraction) && !(analysisResult1 && analysisResult2) && <LoadingSkeleton title="Comparing Products..." />}
              
              {(analysisResult1 || analysisResult2) && !(isLoadingProduct1 || isLoadingProduct2 || isLoadingProduct1UrlExtraction || isLoadingProduct2UrlExtraction) &&
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
