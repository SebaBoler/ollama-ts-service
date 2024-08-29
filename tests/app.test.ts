import request from "supertest";
import { jest } from "@jest/globals";
import express from "express";
import limiter from "../src/middleware/rateLimiter";
import generateRoute from "../src/routes/generateRoute";
import { isModelAvailable } from "../src/services/ollamaService";
import { OllamaRequestSchema } from "../src/types/ollamaRequestTypes";
import { OllamaResponseSchema } from "../src/types/ollamaResponseTypes";

process.env.OLLAMA_API_URL = "http://localhost:11434";
process.env.VALIDATE_MODEL = "true";

jest.mock("axios", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));
import axios from "axios";

const mockAxios = axios as jest.Mocked<typeof axios>;

describe("App", () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(limiter);
    app.use(express.json());
    app.use("/api", generateRoute);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should start the server and set up routes", async () => {
    const response = await request(app).get("/api");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "API is working" });
  });
});

describe("Rate Limiter", () => {
  it("should limit requests", async () => {
    const app = express();
    app.use(limiter);
    app.get("/", (req, res) => res.send("Hello World"));

    for (let i = 0; i < 101; i++) {
      await request(app).get("/");
    }

    const response = await request(app).get("/");
    expect(response.status).toBe(429);
  });
});

describe("Generate Route", () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api", generateRoute);
  });

  it("should validate request schema", async () => {
    const response = await request(app)
      .post("/api/generate")
      .send({ model: "", prompt: "" });
    expect(response.status).toBe(400);
  });

  it("should check model availability", async () => {
    mockAxios.get.mockResolvedValue({ data: { models: ["test-model"] } });
    const response = await request(app)
      .post("/api/generate")
      .send({ model: "test-model", prompt: "Hello" });
    expect(response.status).toBe(200);
  });

  it("should validate response schema", async () => {
    mockAxios.post.mockResolvedValue({
      data: {
        model: "test-model",
        created_at: "2023-10-01",
        response: "Hello",
      },
    });
    const response = await request(app)
      .post("/api/generate")
      .send({ model: "test-model", prompt: "Hello" });
    expect(response.status).toBe(200);
  });

  it("should handle errors correctly", async () => {
    mockAxios.post.mockRejectedValue(new Error("API Error"));
    const response = await request(app)
      .post("/api/generate")
      .send({ model: "test-model", prompt: "Hello" });
    expect(response.status).toBe(500);
  });
});

// describe("Ollama Service", () => {
//   it("should check if model is available", async () => {
//     mockAxios.get.mockResolvedValue({ data: { models: ["test-model"] } });
//     const result = await isModelAvailable("test-model");
//     expect(result).toBe(true);
//   });

//   it("should return false if model is not available", async () => {
//     mockAxios.get.mockResolvedValue({ data: { models: [] } });
//     const result = await isModelAvailable("test-model");
//     expect(result).toBe(false);
//   });
// });

// describe("Schemas", () => {
//   it("should validate OllamaRequestSchema", () => {
//     const validData = { model: "test-model", prompt: "Hello" };
//     expect(() => OllamaRequestSchema.parse(validData)).not.toThrow();

//     const invalidData = { model: "", prompt: "" };
//     expect(() => OllamaRequestSchema.parse(invalidData)).toThrow();
//   });

//   it("should validate OllamaResponseSchema", () => {
//     const validData = {
//       model: "test-model",
//       created_at: "2023-10-01",
//       response: "Hello",
//     };
//     expect(() => OllamaResponseSchema.parse(validData)).not.toThrow();

//     const invalidData = { model: "", created_at: "", response: "" };
//     expect(() => OllamaResponseSchema.parse(invalidData)).toThrow();
//   });
// });
