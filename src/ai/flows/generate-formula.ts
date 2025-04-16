// File: src/ai/flows/generate-formula.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow that takes a mathematical question in natural language
 * and returns a Wolfram Language formula representing the problem.
 *
 * - generateFormula -  A function that takes a natural language question as input and returns a Wolfram Language formula.
 * - GenerateFormulaInput - The input type for the generateFormula function.
 * - GenerateFormulaOutput - The return type for the generateFormula function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateFormulaInputSchema = z.object({
  question: z.string().describe('The mathematical question in natural language.'),
});
export type GenerateFormulaInput = z.infer<typeof GenerateFormulaInputSchema>;

const GenerateFormulaOutputSchema = z.object({
  formula: z.string().describe('The Wolfram Language formula representing the question.'),
});
export type GenerateFormulaOutput = z.infer<typeof GenerateFormulaOutputSchema>;

export async function generateFormula(input: GenerateFormulaInput): Promise<GenerateFormulaOutput> {
  return generateFormulaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFormulaPrompt',
  input: {
    schema: z.object({
      question: z.string().describe('The mathematical question in natural language.'),
    }),
  },
  output: {
    schema: z.object({
      formula: z.string().describe('The Wolfram Language formula representing the question.'),
    }),
  },
  prompt: `You are a mathematical expert. Convert the following mathematical question into a Wolfram Language formula.

Question: {{{question}}}

Formula:`, // Corrected Handlebars syntax here
});

const generateFormulaFlow = ai.defineFlow<
  typeof GenerateFormulaInputSchema,
  typeof GenerateFormulaOutputSchema
>({
  name: 'generateFormulaFlow',
  inputSchema: GenerateFormulaInputSchema,
  outputSchema: GenerateFormulaOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
