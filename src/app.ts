import express from "express";
import dotenv from "dotenv";
import chalk from "chalk";
import generateRoute from "./routes/generateRoute";
import limiter from "./middleware/rateLimiter";

dotenv.config();

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const url = `http://localhost:${port}`;

app.use(limiter);

app.use(express.json());

app.use("/", generateRoute);

app.listen(port, () => {
  console.log(`🚀 Server running at ${chalk.blue(url)}`);
  console.log(
    `Model validation is ${
      process.env.VALIDATE_MODEL === "true"
        ? chalk.green("enabled")
        : chalk.red("disabled")
    }`
  );
});
