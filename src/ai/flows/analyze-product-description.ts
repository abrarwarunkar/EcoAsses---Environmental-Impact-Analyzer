
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
  productDescription: z.string().describe('The description of the product to analyze. This could be user-provided text, or text extracted from a URL or other source.'),
  imageDataUri: z.string().optional().describe("An image of the product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type AnalyzeProductDescriptionInput = z.infer<typeof AnalyzeProductDescriptionInputSchema>;

const ImpactCategorySchema = z.object({
  analysis: z.string().describe("Detailed textual analysis for this category, highlighting key impact drivers and considerations."),
  impactLevel: z.enum(["low", "medium", "high", "unknown"]).describe("Estimated impact level (low, medium, high, or unknown). If unknown, explain why a determination cannot be confidently made.")
});

const AnalyzeProductDescriptionOutputSchema = z.object({
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
  prompt: `You are a highly meticulous and knowledgeable environmental impact assessor AI. Your task is to analyze the provided product information for its environmental impact with a high degree of accuracy and detail.

Product Description: {{{productDescription}}}
{{#if imageDataUri}}
Product Photo: {{media url=imageDataUri}}
Based *purely* on the visual information in the photo, attempt to identify the product (e.g., "a red cotton t-shirt", "a plastic water bottle", "a laptop computer"). This is your 'productIdentificationGuess'. If you cannot clearly identify it from the image, state that identification is unclear. Use this visual identification to complement the textual description for your analysis.
{{/if}}

Provide your analysis strictly in the following JSON structured format, adhering to the output schema. Ensure all fields are populated thoughtfully.

1.  **environmentalImpactAnalysis**: Provide a comprehensive, general summary of the product's overall environmental impact, synthesizing key findings from your detailed analysis below.
2.  **keyFactors**: Identify and list the most significant environmental factors and potential concerns associated with this product. These should be derived from the detailed analysis.
3.  **productIdentificationGuess** (Only if an image was provided): Your best guess of what the product is based on the image content.
4.  **detailedAnalysis**:
    *   **carbonFootprint**:
        *   **analysis**: Provide a detailed textual analysis of the product's carbon footprint. Consider the entire lifecycle: raw material extraction, manufacturing processes (energy sources, efficiency), transportation (modes, distances), energy consumption during the product's use phase (if applicable), and emissions from end-of-life processing (disposal, recycling).
        *   **impactLevel**: Estimate the carbon footprint impact as 'low', 'medium', 'high', or 'unknown'. If 'unknown', clearly state why.
    *   **waterUsage**:
        *   **analysis**: Provide a detailed textual analysis of the water usage (blue water footprint, grey water, etc.) associated with the product. Consider water consumed in raw material cultivation/extraction, manufacturing, and processing. Note any regional water stress implications if data allows.
        *   **impactLevel**: Estimate water usage impact as 'low', 'medium', 'high', or 'unknown'. If 'unknown', clearly state why.
    *   **materialSourcing**:
        *   **analysis**: Provide a detailed textual analysis of the sustainability of the materials used and their sourcing. Evaluate if materials are virgin, recycled, renewable, non-renewable, biodegradable, or from certified sustainable sources (e.g., FSC, GOTS, Fair Trade). Discuss the impacts of extraction/production of these materials. Note any known ethical sourcing concerns or benefits.
        *   **impactLevel**: Estimate material sourcing impact as 'low', 'medium', 'high', or 'unknown'. If 'unknown', clearly state why.
    *   **recyclability**:
        *   **analysis**: Provide a detailed textual analysis of the product's end-of-life options. Assess its design for disassembly and recyclability. Are materials easily separable and commonly recycled? Mention compatibility with existing recycling infrastructure. Discuss compostability or biodegradability if applicable, and the likely impact of landfilling if that is the primary disposal route.
        *   **impactLevel**: Estimate the recyclability/end-of-life impact as 'low' (highly recyclable/beneficial end-of-life), 'medium', 'high' (problematic disposal, low recyclability), or 'unknown'. If 'unknown', clearly state why.
5.  **overallSustainabilityScore**: Assign a numerical score from 0 (very unsustainable) to 100 (highly sustainable). This score must be a thoughtful aggregation of your comprehensive analysis across all detailed categories, reflecting a balanced, evidence-based assessment. Justify how you arrived at this score implicitly through your detailed analyses.

Strive for thoroughness and specificity in your textual analysis for each section. Your goal is to provide an actionable and informative assessment. Ensure your entire response strictly adheres to the JSON schema provided for the output.
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
