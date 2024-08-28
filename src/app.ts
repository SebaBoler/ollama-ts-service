import express, { Request, Response } from 'express';
import axios, {AxiosError} from 'axios';
import dotenv from 'dotenv';
import { z } from 'zod';
import rateLimit from 'express-rate-limit'
import { OllamaRequestSchema } from './ollamaRequestTypes';
import { OllamaResponseSchema, OllamaResponse } from './ollamaResponseTypes';
import { isModelAvailable } from './ollamaService';
import chalk from 'chalk';

dotenv.config();

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const url = `http://localhost:${port}`;
const ollamaApiUrl = process.env.OLLAMA_API_URL ?? 'http://localhost:11434/api/generate';
const validateModel = process.env.VALIDATE_MODEL === 'true';

const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) : 15 * 60 * 1000, // default 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) : 100, // default 100 requests
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);

app.use(express.json());

app.post('/generate', async (req: Request, res: Response) => {
  try {
    const validatedData = OllamaRequestSchema.parse(req.body);
    if (validateModel) {
      const modelAvailable = await isModelAvailable(validatedData.model);
      
    if (!modelAvailable) {
        return res.status(400).json({ error: `Model '${validatedData.model}' is not available` });
      }
    }
    const ollamaResponse = await axios.post<OllamaResponse>(ollamaApiUrl, {
      model: validatedData.model,
      prompt: validatedData.prompt,
      stream: validatedData.stream ?? false
    });

    const validatedResponse = OllamaResponseSchema.parse(ollamaResponse.data);

    res.json(validatedResponse);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid request data', details: error.errors });
    } else if (error instanceof AxiosError) {
      console.error('Axios error:', error.response?.data);
      res.status(error.response?.status ?? 500).json({ error: 'Error communicating with Ollama API' });
    } else if (error instanceof Error) {
      console.error('Unexpected error:', error.message);
      res.status(500).json({ error: 'An unexpected error occurred' });
    } else {
      console.error('Unknown error:', error);
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

const coloredUrl = chalk.blue(url);

app.listen(port, () => {
  console.log(`Server running at ${coloredUrl}`);
  console.log(
    `Model validation is ${
      validateModel
        ? chalk.green('enabled')
        : chalk.red('disabled')
    }`
  );
});