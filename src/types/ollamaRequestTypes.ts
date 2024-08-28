import { z } from 'zod';

export const OllamaRequestSchema = z.object({
  model: z.string().min(1),
  prompt: z.string().min(1),
  stream: z.boolean().optional()
});
