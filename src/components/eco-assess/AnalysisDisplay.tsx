
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileText, MountainSnow, ShieldAlert, Cloud, Waves, Leaf, Recycle, Info, FlaskConical, Download, Loader2 } from "lucide-react";
import type { AnalyzeProductDescriptionOutput } from "@/ai/schemas/product-analysis-schemas"; 
import { ImpactLevelBadge, IngredientAssessmentBadge } from "./Badges";
import { Button } from "@/components/ui/button";
import { generateAnalysisCsv } from "@/lib/report-utils";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef, useState } from "react";

type AnalysisDisplayProps = {
  analysis: AnalyzeProductDescriptionOutput;
};

export default function AnalysisDisplay({ analysis }: AnalysisDisplayProps) {
  const score = analysis.overallSustainabilityScore;
  const analysisReportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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

  const handleDownloadCsv = () => {
    const csvData = generateAnalysisCsv(analysis);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "ecoassess_report.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleDownloadPdf = async () => {
    if (!analysisReportRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const canvas = await html2canvas(analysisReportRef.current, {
        scale: 2, 
        useCORS: true,
        logging: process.env.NODE_ENV === "development", // Enable logging only in dev
        
        // Attempt to improve text rendering if default is blurry
        onclone: (document) => {
            // You can try to apply specific styles to the cloned document if needed
            // For example, to ensure fonts are loaded or to force certain rendering modes
            // This is advanced and might not always be necessary or effective
        }
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate the ratio to fit the image within the PDF page, maintaining aspect ratio
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const newImgWidth = imgWidth * ratio;
      const newImgHeight = imgHeight * ratio;

      // Center the image on the page (optional)
      const imgX = (pdfWidth - newImgWidth) / 2;
      const imgY = 0; // Start from top, or add margin like (pdfHeight - newImgHeight) / 2 for vertical centering

      pdf.addImage(imgData, 'PNG', imgX, imgY, newImgWidth, newImgHeight);
      pdf.save('ecoassess_report.pdf');
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Ideally, show a toast to the user here
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-2">
            <div className="flex-grow">
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Environmental Impact Report
                </CardTitle>
                <CardDescription>
                Overall Environmental Score: {score}/100 (0 = Very Unsustainable, 100 = Highly Sustainable)
                </CardDescription>
            </div>
            <div className="flex gap-2 self-start sm:self-center">
                <Button variant="outline" size="sm" onClick={handleDownloadCsv} disabled={isGeneratingPdf}>
                <Download className="mr-2 h-4 w-4" /> CSV
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={isGeneratingPdf}>
                {isGeneratingPdf ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Download className="mr-2 h-4 w-4" />
                )}
                PDF
                </Button>
            </div>
        </div>
      </CardHeader>
      <div ref={analysisReportRef}> {/* This div wraps all content that should be in the PDF */}
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
      </div> {/* End of analysisReportRef div */}
    </Card>
  );
}
