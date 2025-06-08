
'use server';
/**
 * @fileOverview A flow that analyzes a product description and optionally an image,
 * returning a detailed analysis of its environmental impact, including specific categories and an overall score.
 *
 * - analyzeProductDescription - A function that handles the product description and image analysis process.
 * - AnalyzeProductDescriptionInput - The input type for the analyzeProductDescription function.
 * - AnalyzeProductDescriptionOutput - The return type for the analyzeProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeProductDescriptionInputSchema = z.object({
  productDescription: z.string().describe('The description of the product to analyze.'),
  imageDataUri: z.string().optional().describe("An image of the product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type AnalyzeProductDescriptionInput = z.infer<typeof AnalyzeProductDescriptionInputSchema>;

const ImpactCategorySchema = z.object({
  analysis: z.string().describe("Detailed textual analysis for this category."),
  impactLevel: z.enum(["low", "medium", "high", "unknown"]).describe("Estimated impact level (low, medium, high, or unknown).")
});

const AnalyzeProductDescriptionOutputSchema = z.object({
  environmentalImpactAnalysis: z
    .string()
    .describe('A general summary analysis of the environmental impact of the product.'),
  keyFactors: z.string().describe('Key environmental factors and potential concerns for the product.'),
  detailedAnalysis: z.object({
    carbonFootprint: ImpactCategorySchema.describe("Breakdown of carbon footprint impact."),
    waterUsage: ImpactCategorySchema.describe("Breakdown of water usage impact."),
    materialSourcing: ImpactCategorySchema.describe("Breakdown of material sourcing impact."),
    recyclability: ImpactCategorySchema.describe("Breakdown of recyclability and end-of-life impact."),
  }).describe("Detailed breakdown of impact across different environmental categories."),
  overallSustainabilityScore: z.number().min(0).max(100).describe("An overall sustainability score for the product, from 0 to 100."),
});
export type AnalyzeProductDescriptionOutput = z.infer<typeof AnalyzeProductDescriptionOutputSchema>;

export async function analyzeProductDescription(
  input: AnalyzeProductDescriptionInput
): Promise<AnalyzeProductDescriptionOutput> {
  return analyzeProductDescriptionFlow(input);
}

const analyzeProductDescriptionPrompt = ai.definePrompt({
  name: 'analyzeProductDescriptionPrompt',
  input: {schema: AnalyzeProductDescriptionInputSchema},
  output: {schema: AnalyzeProductDescriptionOutputSchema},
  prompt: `You are an expert environmental impact assessor AI. Analyze the provided product information for its environmental impact.

Product Description: {{{productDescription}}}
{{#if imageDataUri}}
Product Photo: {{media url=imageDataUri}}
{{/if}}

Provide your analysis in the following structured format:
1.  **environmentalImpactAnalysis**: A concise, general summary of the product's overall environmental impact.
2.  **keyFactors**: A list or short paragraph of the key environmental factors and potential concerns associated with this product.
3.  **detailedAnalysis**:
    *   **carbonFootprint**:
        *   **analysis**: A detailed textual analysis of the product's carbon footprint throughout its lifecycle (manufacturing, transport, use, disposal).
        *   **impactLevel**: Estimate the carbon footprint impact as 'low', 'medium', 'high', or 'unknown'.
    *   **waterUsage**:
        *   **analysis**: A detailed textual analysis of the water usage associated with the product (e.g., in raw material extraction, manufacturing).
        *   **impactLevel**: Estimate the water usage impact as 'low', 'medium', 'high', or 'unknown'.
    *   **materialSourcing**:
        *   **analysis**: A detailed textual analysis of the sustainability of the materials used and their sourcing (e.g., virgin vs. recycled, sustainable certifications, ethical sourcing).
        *   **impactLevel**: Estimate the material sourcing impact as 'low', 'medium', 'high', or 'unknown'.
    *   **recyclability**:
        *   **analysis**: A detailed textual analysis of the product's end-of-life options, including its recyclability, compostability, or disposal recommendations.
        *   **impactLevel**: Estimate the recyclability/end-of-life impact as 'low' (highly recyclable/beneficial), 'medium', 'high' (problematic disposal), or 'unknown'.
4.  **overallSustainabilityScore**: A numerical score from 0 (very unsustainable) to 100 (highly sustainable) representing the product's overall environmental friendliness. Base this score on your comprehensive analysis.

Ensure your entire response strictly adheres to the JSON schema provided for the output.
`,
});

const analyzeProductDescriptionFlow = ai.defineFlow(
  {
    name: 'analyzeProductDescriptionFlow',
    inputSchema: AnalyzeProductDescriptionInputSchema,
    outputSchema: AnalyzeProductDescriptionOutputSchema,
  },
  async input => {
    const {output} = await analyzeProductDescriptionPrompt(input);
    return output!;
  }
);
