import type { AnalyzeProductDescriptionOutput, IngredientDetail } from "@/ai/schemas/product-analysis-schemas";

function escapeCsvCell(cellData: string | number | boolean | undefined | null): string {
  if (cellData === undefined || cellData === null) {
    return "";
  }
  const stringData = String(cellData);
  if (stringData.includes(',') || stringData.includes('\n') || stringData.includes('"')) {
    return `"${stringData.replace(/"/g, '""')}"`;
  }
  return stringData;
}

export function generateAnalysisCsv(analysis: AnalyzeProductDescriptionOutput): string {
  const headers = [
    "Category", "Sub Category", "Detail", "Impact Level", "Value"
  ];
  const rows: string[][] = [];

  rows.push(["Overall", "Sustainability Score", "", "", String(analysis.overallSustainabilityScore)]);
  rows.push(["Overall", "Environmental Impact Analysis", "", "", analysis.environmentalImpactAnalysis]);
  rows.push(["Overall", "Key Factors", "", "", analysis.keyFactors]);
  if (analysis.productIdentificationGuess) {
    rows.push(["Overall", "Product Identification (Image)", "", "", analysis.productIdentificationGuess]);
  }

  const detailed = analysis.detailedAnalysis;
  rows.push(["Detailed Analysis", "Carbon Footprint", "Analysis", detailed.carbonFootprint.impactLevel, detailed.carbonFootprint.analysis]);
  rows.push(["Detailed Analysis", "Water Usage", "Analysis", detailed.waterUsage.impactLevel, detailed.waterUsage.analysis]);
  rows.push(["Detailed Analysis", "Material Sourcing", "Analysis", detailed.materialSourcing.impactLevel, detailed.materialSourcing.analysis]);
  rows.push(["Detailed Analysis", "Recyclability", "Analysis", detailed.recyclability.impactLevel, detailed.recyclability.analysis]);

  if (detailed.ingredientAnalysis) {
    rows.push(["Ingredient Analysis", "Overall Summary", "", detailed.ingredientAnalysis.ingredientImpactLevel, detailed.ingredientAnalysis.overallIngredientSummary]);
    if (detailed.ingredientAnalysis.identifiedIngredients && detailed.ingredientAnalysis.identifiedIngredients.length > 0) {
      detailed.ingredientAnalysis.identifiedIngredients.forEach((ing: IngredientDetail, index: number) => {
        rows.push([
          "Ingredient Analysis",
          `Ingredient ${index + 1} Name`,
          "",
          ing.assessment,
          ing.name
        ]);
        rows.push([
          "Ingredient Analysis",
          `Ingredient ${index + 1} Health Hazards`,
          "",
          "",
          ing.healthHazards || "N/A"
        ]);
        rows.push([
          "Ingredient Analysis",
          `Ingredient ${index + 1} Environmental Impact`,
          "",
          "",
          ing.environmentalImpact || "N/A"
        ]);
      });
    }
  }

  const csvContent = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map(row => row.map(escapeCsvCell).join(','))
  ].join('\n');

  return csvContent;
}
