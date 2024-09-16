import express from "express";
import router from "./routes/rental.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const app = express();

app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

app.use(router);

const PORT = process.env.PORT || 3000;

export default app;
