
'use server';
/**
 * @fileOverview A flow that attempts to extract product name and description from a given URL.
 *
 * - extractProductInfoFromUrl - A function that handles the URL information extraction process.
 * - ExtractProductInfoFromUrlInput - The input type for the extractProductInfoFromUrl function.
 * - ExtractProductInfoFromUrlOutput - The return type for the extractProductInfoFromUrl function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractProductInfoFromUrlInputSchema = z.object({
  productUrl: z.string().url().describe('The URL of the product page.'),
});
export type ExtractProductInfoFromUrlInput = z.infer<typeof ExtractProductInfoFromUrlInputSchema>;

const ExtractProductInfoFromUrlOutputSchema = z.object({
  productName: z.string().optional().describe('The extracted or inferred name of the product. Could be a best guess or a generic placeholder if extraction fails.'),
  productDescription: z.string().describe('The extracted or inferred description of the product. This will be used for further environmental analysis. If extraction fails, this might be a summary of the URL or a note about the failure.'),
});
export type ExtractProductInfoFromUrlOutput = z.infer<typeof ExtractProductInfoFromUrlOutputSchema>;

export async function extractProductInfoFromUrl(
  input: ExtractProductInfoFromUrlInput
): Promise<ExtractProductInfoFromUrlOutput> {
  return extractProductInfoFromUrlFlow(input);
}

const extractProductInfoPrompt = ai.definePrompt({
  name: 'extractProductInfoFromUrlPrompt',
  input: {schema: ExtractProductInfoFromUrlInputSchema},
  output: {schema: ExtractProductInfoFromUrlOutputSchema},
  prompt: `You are an AI assistant tasked with extracting product information from a given URL.
Your goal is to identify the product's name and generate a concise description suitable for environmental impact analysis.

Product URL: {{{productUrl}}}

Tasks:
1.  Analyze the URL structure and any semantic information it might contain.
2.  If possible, infer the product's name. If a clear name isn't available, use a generic placeholder like "Product from [domain]" or state that the name is unclear.
3.  Infer or summarize the product's key characteristics to form a description. This description should be detailed enough for an environmental impact assessment. Focus on material, type of product, and potential manufacturing indicators if discernible.
4.  If the URL is from a known e-commerce site (e.g., Amazon, eBay, Walmart, Target, IKEA, etc.), attempt to extract details based on common page structures for such sites, if your knowledge allows.
5.  If direct content extraction from the live URL is not possible for you, clearly state this limitation and provide the best possible inference based on the URL itself.

Provide your response strictly in the JSON format defined by the output schema.
If you cannot confidently extract a meaningful description, the 'productDescription' should explain this (e.g., "Unable to extract detailed product information from the provided URL. The URL appears to be for [brief description of URL content if identifiable].").
The 'productName' can be "Unknown Product" if not identifiable.
`,
});

const extractProductInfoFromUrlFlow = ai.defineFlow(
  {
    name: 'extractProductInfoFromUrlFlow',
    inputSchema: ExtractProductInfoFromUrlInputSchema,
    outputSchema: ExtractProductInfoFromUrlOutputSchema,
  },
  async input => {
    const {output} = await extractProductInfoPrompt(input);
    return output!;
  }
);
