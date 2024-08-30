import axios from 'axios';
import { inspect } from 'util';

const ollamaApiUrl = process.env.OLLAMA_API_URL ?? 'http://127.0.0.1:11434';

export async function isModelAvailable(model: string): Promise<boolean> {
  try {
    const response = await axios.get(`${ollamaApiUrl}/api/tags`);
    const availableModels = response.data.models;
    if (Array.isArray(availableModels)) {
      return availableModels.some(m => m.model === model);
    } else {
      console.error('Unexpected response format:', response.data);
      return false;
    }
  } catch (error) {
    console.error('Error checking model availability:', inspect(error, { depth: null }));
    return false;
  }
}