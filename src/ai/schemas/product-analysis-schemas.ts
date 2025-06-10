
/**
 * @fileOverview Defines shared Zod schemas for product analysis used by AI flows.
 */
import { z } from 'genkit';

export const ImpactCategorySchema = z.object({
  analysis: z.string().describe("Detailed textual analysis for this category, highlighting key impact drivers and considerations."),
  impactLevel: z.enum(["low", "medium", "high", "unknown"]).describe("Estimated impact level (low, medium, high, or unknown). If unknown, explain why a determination cannot be confidently made.")
});

export const IngredientDetailSchema = z.object({
  name: z.string().describe("The name of the identified ingredient."),
  healthHazards: z.string().optional().describe("Potential health hazards or concerns associated with this ingredient. Be specific if possible (e.g., skin irritant, allergen, endocrine disruptor). If none known from input, state 'No specific health hazards noted based on provided information'."),
  environmentalImpact: z.string().optional().describe("Known environmental impacts (e.g., non-biodegradable, aquatic toxicity, unsustainable sourcing). If none known from input, state 'No specific environmental impacts noted based on provided information'."),
  assessment: z.enum(["Generally Safe", "Use with Caution", "Potential Concern", "Unknown"]).describe("Overall assessment of this ingredient based on available information."),
});

export const AnalyzeProductDescriptionOutputSchema = z.object({
  environmentalImpactAnalysis: z
    .string()
    .describe('A comprehensive, general summary analysis of the overall environmental impact of the product, synthesizing key findings.'),
  keyFactors: z.string().describe('A list or concise paragraph identifying the most significant environmental factors and potential concerns for the product based on the detailed analysis.'),
  productIdentificationGuess: z.string().optional().describe('If an image was provided, your best guess of what the product is based on the image content. State if identification is unclear.'),
  detailedAnalysis: z.object({
    carbonFootprint: ImpactCategorySchema.describe("Detailed breakdown of carbon footprint impact. Consider the entire lifecycle: raw material extraction, manufacturing processes, transportation (local and international), energy consumption during use (if applicable), and end-of-life disposal or recycling emissions."),
    waterUsage: ImpactCategorySchema.describe("Detailed breakdown of water usage impact. Analyze both direct and indirect water consumption. Consider water scarcity in sourcing regions if information allows."),
    materialSourcing: ImpactCategorySchema.describe("Detailed breakdown of material sourcing impact. Evaluate if materials are renewable, recycled, biodegradable, or from certified sustainable sources (e.g., FSC, Fair Trade). Consider the impact of extracting virgin materials versus using recycled content and any known ethical sourcing concerns."),
    recyclability: ImpactCategorySchema.describe("Detailed breakdown of recyclability and end-of-life impact. Assess design for recyclability, material separability, and availability of established recycling streams. Consider compostability or biodegradability where relevant, and the impact of landfilling."),
    ingredientAnalysis: z.object({
      identifiedIngredients: z.array(IngredientDetailSchema).optional().describe("List of ingredients identified from the product description and their individual analysis. If no ingredients are explicitly mentioned or identifiable, this array may be empty or omitted."),
      overallIngredientSummary: z.string().describe("A general summary of the product's ingredient profile, potential concerns, and overall safety/sustainability from an ingredient perspective. If no ingredients identified, state this clearly."),
      ingredientImpactLevel: z.enum(["low", "medium", "high", "unknown"]).describe("Overall estimated impact level of the product's ingredients (low: generally benign, medium: some concerns, high: significant concerns, unknown: insufficient information).")
    }).describe("Analysis of the product's ingredients, their potential health hazards, and environmental impacts. Focus SOLELY on information derivable from the provided product description and image.")
  }).describe("Detailed breakdown of impact across different environmental categories. Provide thorough yet concise analyses. Avoid vague statements; be specific where possible."),
  overallSustainabilityScore: z.number().min(0).max(100).describe("An overall sustainability score for the product, from 0 (very unsustainable) to 100 (highly sustainable). This score should be a thoughtful aggregation of your findings in the detailedAnalysis, reflecting a balanced view of all factors."),
});

