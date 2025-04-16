'use server';
/**
 * @fileOverview A flow that generates a step-by-step solution to a mathematical problem when the AI deems it helpful.
 *
 * - generateStepByStepSolution - A function that generates the step-by-step solution.
 * - GenerateStepByStepSolutionInput - The input type for the generateStepByStepSolution function.
 * - GenerateStepByStepSolutionOutput - The return type for the generateStepByStepSolution function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateStepByStepSolutionInputSchema = z.object({
  problem: z.string().describe('The mathematical problem to solve.'),
  wolframFormula: z.string().optional().describe('The Wolfram Language formula for the problem, if available.'),
});
export type GenerateStepByStepSolutionInput = z.infer<typeof GenerateStepByStepSolutionInputSchema>;

const GenerateStepByStepSolutionOutputSchema = z.object({
  stepByStepSolution: z.string().describe('The step-by-step solution to the problem.'),
});
export type GenerateStepByStepSolutionOutput = z.infer<typeof GenerateStepByStepSolutionOutputSchema>;

export async function generateStepByStepSolution(
  input: GenerateStepByStepSolutionInput
): Promise<GenerateStepByStepSolutionOutput> {
  return generateStepByStepSolutionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStepByStepSolutionPrompt',
  input: {
    schema: z.object({
      problem: z.string().describe('The mathematical problem to solve.'),
      wolframFormula: z.string().optional().describe('The Wolfram Language formula for the problem, if available.'),
    }),
  },
  output: {
    schema: z.object({
      stepByStepSolution: z.string().describe('The step-by-step solution to the problem.'),
    }),
  },
  prompt: `You are an expert math tutor who specializes in providing step-by-step solutions to mathematical problems. Consider the user's question, and provide a detailed, step-by-step solution.  If a Wolfram Language formula is provided, use it to guide your solution.

Problem: {{{problem}}}
{{~#if wolframFormula}}
Wolfram Language Formula: {{{wolframFormula}}}
{{~/if}}`,
});

const generateStepByStepSolutionFlow = ai.defineFlow<
  typeof GenerateStepByStepSolutionInputSchema,
  typeof GenerateStepByStepSolutionOutputSchema
>({
  name: 'generateStepByStepSolutionFlow',
  inputSchema: GenerateStepByStepSolutionInputSchema,
  outputSchema: GenerateStepByStepSolutionOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});

