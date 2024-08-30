import { z } from 'zod';

export const OllamaResponseSchema = z.object({
  model: z.string(),
  created_at: z.string(),
  response: z.string(),
  total_duration: z.number()
});

export type OllamaResponse = z.infer<typeof OllamaResponseSchema>;
