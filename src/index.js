import express from "express";
<<<<<<< HEAD
import router from "./routes/rentalRoutes.js";
import rental from './models/rental.js';
import rentalRoutes from './routes/rentalRoutes.js'; // Make sure this matches the file name


// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
=======
import router from "./routes/rental.js";
>>>>>>> ad5d28f68a9f6ca01b2675e08092651bd2eabc7b

const app = express();

app.use(express.json());

app.use(router);

const PORT = process.env.PORT || 3000;
<<<<<<< HEAD
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// Define a simple route
app.get('/', (req, res) => {
    // res.sendFile(__dirname + '/pages/index.html')
});

// Start the server
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// }); 

export default app;
=======

export default app;
>>>>>>> ad5d28f68a9f6ca01b2675e08092651bd2eabc7b
