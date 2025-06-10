
'use server';
/**
 * @fileOverview Generates actionable insights and highlights based on a product's environmental impact analysis
 * and user's sustainability preferences.
 *
 * - generateProductInsights - A function that generates insights.
 * - GenerateProductInsightsInput - The input type for the function.
 * - GenerateProductInsightsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { AnalyzeProductDescriptionOutputSchema } from '../schemas/product-analysis-schemas';
import type { AnalyzeProductDescriptionOutput } from './analyze-product-description';


const GenerateProductInsightsInputSchema = z.object({
  productQuery: z.string().describe("The original product query or description provided by the user."),
  analysisResult: AnalyzeProductDescriptionOutputSchema.describe("The full environmental impact analysis output for the product."),
  sustainabilityPreferences: z.array(z.string()).optional().describe('User preferences for sustainability aspects, e.g., "low carbon footprint", "recycled materials". Available preferences: "Low Carbon Footprint", "Water Conservation", "Recycled Materials", "Renewable Materials", "High Recyclability".'),
});
export type GenerateProductInsightsInput = z.infer<typeof GenerateProductInsightsInputSchema>;

const GenerateProductInsightsOutputSchema = z.object({
  actionableTips: z
    .array(z.string())
    .describe('List of 2-3 concise, actionable tips for the consumer related to this specific product or similar future purchases. Focus on what the user can *do*. These tips should be strongly influenced by user\'s sustainabilityPreferences if provided.'),
  positiveHighlights: z
    .array(z.string())
    .describe('List of 1-2 notable positive sustainability aspects of this product, if any. If primarily negative, this can be empty or state "No significant positive aspects noted." Highlight aspects that align with user\'s sustainabilityPreferences if applicable.'),
  areasForConsideration: z
    .array(z.string())
    .describe('List of 1-2 general areas consumers should consider for this *type* of product to make more sustainable choices in the future. These are broader than actionable tips and should also reflect user\'s sustainabilityPreferences if provided.'),
});
export type GenerateProductInsightsOutput = z.infer<typeof GenerateProductInsightsOutputSchema>;

export async function generateProductInsights(
  input: GenerateProductInsightsInput
): Promise<GenerateProductInsightsOutput> {
  return generateProductInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductInsightsPrompt',
  input: {schema: GenerateProductInsightsInputSchema},
  output: {schema: GenerateProductInsightsOutputSchema},
  prompt: `You are an AI assistant specialized in providing clear, actionable, and encouraging sustainability insights to consumers, tailored to their preferences.
Given the product query, its detailed environmental impact analysis, and the user's stated sustainability preferences (if any), generate targeted insights.

Original Product Query: {{{productQuery}}}

User Sustainability Preferences:
{{#if sustainabilityPreferences}}
{{#each sustainabilityPreferences}}
- {{{this}}}
{{/each}}
{{else}}
User has not specified any particular sustainability preferences. Provide general insights.
{{/if}}

Environmental Impact Analysis:
Overall Score: {{analysisResult.overallSustainabilityScore}}/100
Summary: {{analysisResult.environmentalImpactAnalysis}}
Key Factors: {{analysisResult.keyFactors}}
Carbon Footprint: {{analysisResult.detailedAnalysis.carbonFootprint.analysis}} (Impact: {{analysisResult.detailedAnalysis.carbonFootprint.impactLevel}})
Water Usage: {{analysisResult.detailedAnalysis.waterUsage.analysis}} (Impact: {{analysisResult.detailedAnalysis.waterUsage.impactLevel}})
Material Sourcing: {{analysisResult.detailedAnalysis.materialSourcing.analysis}} (Impact: {{analysisResult.detailedAnalysis.materialSourcing.impactLevel}})
Recyclability: {{analysisResult.detailedAnalysis.recyclability.analysis}} (Impact: {{analysisResult.detailedAnalysis.recyclability.impactLevel}})
Ingredient Analysis: {{analysisResult.detailedAnalysis.ingredientAnalysis.overallIngredientSummary}} (Impact: {{analysisResult.detailedAnalysis.ingredientAnalysis.ingredientImpactLevel}})
{{#if analysisResult.productIdentificationGuess}}
Identified Product (from image): {{analysisResult.productIdentificationGuess}}
{{/if}}

Based on this, provide the following insights strictly in the JSON format defined by the output schema:
1.  **actionableTips**: Generate 2-3 concise tips a consumer can take if they are considering purchasing *this product* or *similar products*. These should be practical actions. *Strongly align these tips with the user's sustainabilityPreferences.* For example, if they prefer "Low Carbon Footprint," tips should focus on reducing carbon impact related to this product. If no preferences, give general tips.
2.  **positiveHighlights**: Identify 1-2 positive sustainability aspects from the analysis. *If any highlights align with the user's sustainabilityPreferences, emphasize them.* If the product is largely unsustainable, it's okay if this is empty or explicitly states that few positives were found. Be honest but constructive.
3.  **areasForConsideration**: Offer 1-2 broader points or questions a consumer should think about when purchasing *this type* of product in the future. *These areas should also be guided by the user's sustainabilityPreferences.* For instance, if they prefer "Recycled Materials," suggest considering brands known for high recycled content in this product category. If no preferences, give general areas.

Focus on being helpful, empowering, and not overly critical. The goal is to guide the user towards better choices aligned with their stated priorities.
`,
});

const generateProductInsightsFlow = ai.defineFlow(
  {
    name: 'generateProductInsightsFlow',
    inputSchema: GenerateProductInsightsInputSchema,
    outputSchema: GenerateProductInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
