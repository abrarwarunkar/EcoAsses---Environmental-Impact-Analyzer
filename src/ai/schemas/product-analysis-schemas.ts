
/**
 * @fileOverview Defines shared Zod schemas for product analysis used by AI flows.
 */
import { z } from 'genkit';

export const ImpactCategorySchema = z.object({
  analysis: z.string().describe("Detailed textual analysis for this category, highlighting key impact drivers and considerations."),
  impactLevel: z.enum(["low", "medium", "high", "unknown"]).describe("Estimated impact level (low, medium, high, or unknown). If unknown, explain why a determination cannot be confidently made.")
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
  }).describe("Detailed breakdown of impact across different environmental categories. Provide thorough yet concise analyses. Avoid vague statements; be specific where possible."),
  overallSustainabilityScore: z.number().min(0).max(100).describe("An overall sustainability score for the product, from 0 (very unsustainable) to 100 (highly sustainable). This score should be a thoughtful aggregation of your findings in the detailedAnalysis, reflecting a balanced view of all factors."),
});
