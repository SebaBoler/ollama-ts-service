import express, { Request, Response } from "express";
import { OllamaRequestSchema } from "../types/ollamaRequestTypes";
import {
  OllamaResponseSchema,
  OllamaResponse,
} from "../types/ollamaResponseTypes";
import { isModelAvailable } from "../services/ollamaService";
import axios, { AxiosError } from "axios";
import { z } from "zod";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({ message: "API is working" });
});

router.post("/generate", async (req: Request, res: Response) => {
  try {
    const validatedData = OllamaRequestSchema.parse(req.body);
    if (process.env.VALIDATE_MODEL === "true") {
      const modelAvailable = await isModelAvailable(validatedData.model);
      if (!modelAvailable) {
        return res
          .status(400)
          .json({ error: `Model '${validatedData.model}' is not available` });
      }
    }
    const ollamaResponse = await axios.post<OllamaResponse>(
      process.env.OLLAMA_API_URL!,
      {
        model: validatedData.model,
        prompt: validatedData.prompt,
        stream: validatedData.stream ?? false,
      }
    );

    const validatedResponse = OllamaResponseSchema.parse(ollamaResponse.data);

    res.json(validatedResponse);
  } catch (error) {
    const errors = error as Error | AxiosError;

    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ error: "Invalid request data", details: error.errors });
    } else if (error instanceof AxiosError) {
      console.error("Axios error:", error.response?.data);
      res
        .status(error.response?.status ?? 500)
        .json({ error: "Error communicating with Ollama API" });
    } else if (error instanceof Error) {
      console.error("Unexpected error:", error.message);
      res.status(500).json({ error: "An unexpected error occurred" });
    } else {
      console.error("Unknown error:", error);
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

export default router;
