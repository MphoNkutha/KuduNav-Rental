import express from "express";
import router from "./routes/rental.js";

const app = express();

app.use(express.json());

app.use(router);

const PORT = process.env.PORT || 3000;

export default app;
