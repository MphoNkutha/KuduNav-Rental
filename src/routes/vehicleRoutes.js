import express from 'express';
import Vehicles from '../models/vehicles.js';

const router = express.Router();

// Get available vehicles
router.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicles.find({ available: true });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a vehicle by ID
router.get('/vehicles/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const vehicle = await Vehicles.findById(id);
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      res.status(200).json(vehicle);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

// Add a new vehicle
router.post('/vehicles/add', async (req, res) => {
  const { type, station } = req.body;

  if (!type || !station ) {
    return res.status(400).json({ message: 'Missing type or station' });
  }
//   if(!(station == "Hall-29") || !(station == "Library-Lawns")||!(station == "Wits-Science-Stadium") || !(station == "Bozolli")){
//     return res.status(400).json({ message: 'Invalid station' });
//   }
// if(!(type == "Bicycle") || !(type == "Scooter") || !(type == "Skateboard") )

  try {
    const newVehicle = new Vehicles({ type, station });
    await newVehicle.save();
    res.status(201).json({ message: 'Vehicle added successfully', vehicles: newVehicle });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a vehicle
router.delete('/vehicles/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const vehicle = await Vehicles.findByIdAndDelete(id);
  
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
  
      res.status(200).json({ message: 'Vehicle deleted successfully', vehicle });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

export default router;
