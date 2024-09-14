import express from "express";
import router from "./routes/rental";
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';

const app = express();

app.use(express.json());

app.use(router);

const PORT = process.env.PORT || 3000;

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// Define a simple route
app.get('/', (req, res) => {
    // res.sendFile(__dirname + '/pages/index.html')
});

// Start the server
/* app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); */

export default app;