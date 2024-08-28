# 🚀 Ollama TypeScript Service

A lightning-fast, secure TypeScript proxy server for the Ollama API. Streamline your AI-powered applications with robust input validation, rate limiting, and error handling.

## ✨ Features

- 🔒 Secure communication with Ollama API
- ✅ Input/output validation using Zod
- 🛡️ DDoS protection with configurable rate limiting
- 🔧 Easy configuration via environment variables
- 🐛 Comprehensive error handling and logging

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or later)
- npm (usually comes with Node.js)
- Access to an Ollama API instance

## 🚀 Quick Start

1. Clone the repository:
```text
git clone https://github.com/SebaBoler/ollama-ts-service
cd ollama-ts-service
```

2. Install dependencies:
```bash
npm install
```

3. Configure your `.env` file:
```text
OLLAMA_API_URL=http://localhost:11434/api/generate
PORT=3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
VALIDATE_MODEL=true
```

## 🏃‍♂️ Running the Service

For development:
```bash
npm run dev
```


For production:
```bash
npm run build
npm start
```


## 🔧 Usage

Send a POST request to `/generate` with the following body:

```json
{
  "model": "llama3.1",
  "prompt": "Your query here",
  "stream": false
}
```

🔧 Configuration
Customize the service using these environment variables:

- `OLLAMA_API_URL`: Ollama API endpoint
- `PORT`: Server listening port
- `RATE_LIMIT_WINDOW_MS`: Rate limiting time window (milliseconds)
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per time window

🤝 Contributing
We welcome contributions! Please see our Contributing Guide for more details.

📜 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgements
Ollama for their amazing AI models
Zod for robust schema validation
Express for powering our server

📞 Support
If you encounter any issues or have questions, please file an issue on the GitHub repository.

Happy coding! 🎉