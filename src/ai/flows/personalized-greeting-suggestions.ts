'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized greeting suggestions based on a given theme.
 *
 * The flow takes a theme as input and returns a list of suggested greetings.
 * - `suggestPersonalizedGreetings` - A function that calls the personalized greeting suggestions flow.
 * - `PersonalizedGreetingSuggestionsInput` - The input type for the `suggestPersonalizedGreetings` function.
 * - `PersonalizedGreetingSuggestionsOutput` - The return type for the `suggestPersonalizedGreetings` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedGreetingSuggestionsInputSchema = z.object({
  theme: z.string().describe('The theme for generating personalized greeting suggestions.'),
});
export type PersonalizedGreetingSuggestionsInput = z.infer<
  typeof PersonalizedGreetingSuggestionsInputSchema
>;

const PersonalizedGreetingSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of personalized greeting suggestions based on the theme.'),
});
export type PersonalizedGreetingSuggestionsOutput = z.infer<
  typeof PersonalizedGreetingSuggestionsOutputSchema
>;

const personalizedGreetingSuggestionsPrompt = ai.definePrompt({
  name: 'personalizedGreetingSuggestionsPrompt',
  input: {schema: PersonalizedGreetingSuggestionsInputSchema},
  output: {schema: PersonalizedGreetingSuggestionsOutputSchema},
  prompt: `You are a creative greeting generator. Based on the given theme, generate 5 personalized greeting suggestions.

Theme: {{{theme}}}

Suggestions:`, // Removed numbering to let LLM decide the format
});

const personalizedGreetingSuggestionsFlow = ai.defineFlow(
  {
    name: 'personalizedGreetingSuggestionsFlow',
    inputSchema: PersonalizedGreetingSuggestionsInputSchema,
    outputSchema: PersonalizedGreetingSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await personalizedGreetingSuggestionsPrompt(input);
    return output!;
  }
);

export async function suggestPersonalizedGreetings(
  input: PersonalizedGreetingSuggestionsInput
): Promise<PersonalizedGreetingSuggestionsOutput> {
  return personalizedGreetingSuggestionsFlow(input);
}
