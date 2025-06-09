
'use server';

/**
 * @fileOverview Suggests sustainable alternative products based on an initial product query,
 * its environmental impact, and user preferences.
 *
 * - suggestSustainableAlternatives - A function that suggests sustainable alternatives.
 * - SuggestSustainableAlternativesInput - The input type for the suggestSustainableAlternatives function.
 * - SuggestSustainableAlternativesOutput - The return type for the suggestSustainableAlternatives function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSustainableAlternativesInputSchema = z.object({
  productQuery: z
    .string()
    .describe('The initial product query from the user.'),
  environmentalImpactScore: z.number().describe('The environmental impact score of the initial product (0-100, higher is better).'),
  breakdown: z.string().describe('A detailed breakdown of the environmental impact score.'),
  sustainabilityPreferences: z.array(z.string()).optional().describe('User preferences for sustainability aspects, e.g., "low carbon footprint", "recycled materials", "water conservation". Available preferences: "Low Carbon Footprint", "Water Conservation", "Recycled Materials", "Renewable Materials", "High Recyclability".'),
});
export type SuggestSustainableAlternativesInput = z.infer<
  typeof SuggestSustainableAlternativesInputSchema
>;

const SuggestSustainableAlternativesOutputSchema = z.object({
  alternatives: z
    .array(z.string())
    .describe('A list of more sustainable alternative products (at least three if possible).'),
  reasoning: z.string().describe('The reasoning behind the suggested alternatives, explaining how they are more sustainable and how they align with user preferences if provided.'),
});
export type SuggestSustainableAlternativesOutput = z.infer<
  typeof SuggestSustainableAlternativesOutputSchema
>;

export async function suggestSustainableAlternatives(
  input: SuggestSustainableAlternativesInput
): Promise<SuggestSustainableAlternativesOutput> {
  return suggestSustainableAlternativesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSustainableAlternativesPrompt',
  input: {schema: SuggestSustainableAlternativesInputSchema},
  output: {schema: SuggestSustainableAlternativesOutputSchema},
  prompt: `You are an AI assistant that suggests more sustainable alternative products based on an initial product query, its environmental impact assessment, and user preferences.

  Product Query: {{{productQuery}}}
  Environmental Impact Score of original product (0-100, higher is better): {{{environmentalImpactScore}}}
  Impact Breakdown of original product: {{{breakdown}}}

  {{#if sustainabilityPreferences}}
  The user has expressed the following sustainability preferences:
  {{#each sustainabilityPreferences}}
  - {{{this}}}
  {{/each}}
  Prioritize suggestions that align with these preferences. When providing reasoning, explicitly mention how the alternatives meet these preferences.
  {{else}}
  The user has not specified any particular sustainability preferences. Provide general sustainable alternatives.
  {{/if}}

  Suggest at least three sustainable alternatives. For each alternative, briefly explain why it is more sustainable than the original product.
  Consider factors like materials, production processes, lifecycle, and end-of-life options.
  If the original product has a high score (e.g., > 70), acknowledge this and suggest alternatives that might be even better or comparable in different aspects.
  
  Format your response strictly as a JSON object with "alternatives" (an array of strings) and "reasoning" (a string summarizing why these alternatives are good choices, potentially referencing the preferences) fields.
  Example reasoning: "These alternatives focus on [key sustainable aspect like recycled materials or lower emissions]. Product X uses organic cotton, reducing pesticide use. Product Y is made locally, minimizing transport carbon. Product Z is designed for easy disassembly and recycling."
`,
});

const suggestSustainableAlternativesFlow = ai.defineFlow(
  {
    name: 'suggestSustainableAlternativesFlow',
    inputSchema: SuggestSustainableAlternativesInputSchema,
    outputSchema: SuggestSustainableAlternativesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
