import express from 'express';
import mongoose from 'mongoose';
import rentalRoutes from './routes/rentalRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/milky', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Use routes
app.use('/api', rentalRoutes);
app.use('/api', reservationRoutes);
app.use('/api', vehicleRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
