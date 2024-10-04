import express from 'express';
dotenv.config();
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import vehicleRoutes from './routes/vehicleRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import rentalRoutes from './routes/rentalRoutes.js';
import { MongoClient } from 'mongodb'; 
import { ServerApiVersion } from 'mongodb';

const app = express();
app.use(express.json());

const PORT = process.env.PORT;
const uri = process.env.MONGODB_URI;


const dbInit = async () => {
    try {
        await mongoose.connect(uri);
        mongoose.set("strictQuery", false);
    }catch (err){
        console.error(err);
        process.exit(1);
    }

}
await dbInit();
// Use the routes
app.use('/api/v1/rental', vehicleRoutes);
app.use('/api/v1/rental', reservationRoutes);
app.use('/api/v1/rental', rentalRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



