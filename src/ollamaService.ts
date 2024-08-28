import axios from 'axios';


const ollamaApiUrl = process.env.OLLAMA_API_URL ?? 'http://localhost:11434';

export async function isModelAvailable(model: string): Promise<boolean> {
  try {
    const response = await axios.get(`${ollamaApiUrl}/api/tags`);
    const availableModels = response.data.models;
        if (Array.isArray(availableModels)) {
      return availableModels.includes(model);
    } else {
      console.error('Unexpected response format:', response.data);
      return false;
    }
  } catch (error) {
    console.error('Error checking model availability:', error);
    return false;
  }
}
