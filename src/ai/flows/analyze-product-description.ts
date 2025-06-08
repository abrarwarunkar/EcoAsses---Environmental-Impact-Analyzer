// This file is machine-generated - edit with care!
'use server';
/**
 * @fileOverview A flow that analyzes a product description and returns an analysis of its environmental impact.
 *
 * - analyzeProductDescription - A function that handles the product description analysis process.
 * - AnalyzeProductDescriptionInput - The input type for the analyzeProductDescription function.
 * - AnalyzeProductDescriptionOutput - The return type for the analyzeProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeProductDescriptionInputSchema = z.object({
  productDescription: z.string().describe('The description of the product to analyze.'),
});
export type AnalyzeProductDescriptionInput = z.infer<typeof AnalyzeProductDescriptionInputSchema>;

const AnalyzeProductDescriptionOutputSchema = z.object({
  environmentalImpactAnalysis: z
    .string()
    .describe('An analysis of the environmental impact of the product described in the product description.'),
  keyFactors: z.string().describe('Key environmental factors and potential concerns.'),
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
  prompt: `Analyze the following product description for its environmental impact, highlighting key factors and potential concerns:\n\nProduct Description: {{{productDescription}}}\n\nEnvironmental Impact Analysis:`, 
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
