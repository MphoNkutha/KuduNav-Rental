import express from "express";
import vehicleRoutes from './routes/vehicleRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import rentalRoutes from './routes/rentalRoutes.js';
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';

const app = express();

app.use(express.json());


// Use the routes
app.use('/', vehicleRoutes);
app.use('/', reservationRoutes);
app.use('/', rentalRoutes);

export default app;