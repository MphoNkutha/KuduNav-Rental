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

// Rent a vehicle, given vehicle type, station, and user ID
router.post('/rentals/add', async (req, res) => {
  const { type, station, userId} = req.body;

  try {
    // Validate the station
    const validStations = ["Hall-29", "Library-Lawns", "Wits-Science-Stadium", "Bozolli"];
    if (!validStations.includes(station)) {
      return res.status(400).json({ message: 'Invalid station' });
    }

    // Validate the vehicle type
    const validVehicleTypes = ["Bicycle", "Scooter", "Skateboard"];
    if (!validVehicleTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid vehicle type' });
    }

    //Validate userId
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Find all available vehicles at the station
    const availableVehicles = await Vehicle.find({ type, station, available: true });
    
    // If no available vehicles, return an error message
    if (availableVehicles.length === 0) {
      return res.status(404).json({ message: 'No available vehicles at this station' });
    }

    // Select the first available vehicle and reserve it
    const selectedVehicle = availableVehicles[0];
    selectedVehicle.available = false; // Mark it as unavailable
    await selectedVehicle.save(); // Save the updated vehicle status

    // Create a new reservation
    const newRental = new Rental({
      vehicleID: selectedVehicle._id,
      userId
    });
    await newRental.save();

    // Send back the reserved vehicle and reservation details
    res.status(201).json({
      message: 'Rental successful',
      vehicle: selectedVehicle,
      rental: newRental
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
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
router.put('/rentals/update/:id', async (req, res) => {
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

// End a rental and return a vehicle
router.put('/rentals/return/:id', async (req, res) => {
  const { id } = req.params;
  const { station } = req.body; // Get the drop-off station from request body

  try {
    // Find the rental by ID
    const rental = await Rental.findById(id);
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    // Find the vehicle associated with the rental
    const vehicle = await Vehicle.findById(rental.vehicleID);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Update the vehicle's availability and station
    vehicle.available = true;
    vehicle.station = station; // Update the vehicle's station
    await vehicle.save();


    rental.returnedAt = new Date(); 
    rental.station = station;

    //Remove the rental from the "all rentals" collection
    await Rental.findByIdAndDelete(id);

    res.status(200).json({ message: 'Vehicle returned successfully', vehicle });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
