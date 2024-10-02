import express from 'express';
import Rental from '../models/rental.js'; 
import Vehicle from '../models/vehicles.js';


const router = express.Router();

// Get all rentals
router.get('/rentals', async (req, res) => {
  try {
    const rentals = await Rental.find();
    res.status(200).send(rentals);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Rent a vehicle
router.post('/rentals/add', async (req, res) => {
  try {
    const { vehicleID, userId } = req.body; // Get all necessary data
    const vehicle = await Vehicle.findById(vehicleID);
    console.log(vehicle);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check if the vehicle is available
    if (!vehicle.available) {
      return res.status(400).json({ vehicle, message: 'Vehicle is not available for rental' });
    }

    vehicle.available = false;
    await vehicle.save(); 
    
    const newRental = new Rental({ vehicleID, userId });
    await newRental.save();
    
    res.status(201).json({ message: 'Vehicle rented successfully', rental: newRental });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a rental by ID
router.get('/rentals/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const rental = await Rental.findById(id);
    if (!rental) {
      return res.status(404).send();
    }
    res.status(200).send(rental);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a rental by ID
router.put('/rentals/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const rental = await Rental.findByIdAndUpdate(id, req.body, { new: true });
    if (!rental) {
      return res.status(404).send();
    }
    res.status(200).send(rental);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a rental by ID
router.delete('/rentals/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const rental = await Rental.findByIdAndDelete(id);
    if (!rental) {
      return res.status(404).send();
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;
