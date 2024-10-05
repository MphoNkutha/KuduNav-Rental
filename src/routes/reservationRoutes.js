import express from 'express';
import Reservation from '../models/reservation.js'; 
import Vehicle from '../models/vehicles.js'; 
import Rental from '../models/rental.js';
const router = express.Router();

// Create a new reservation, given vehicle type, station, and user ID
router.post('/reservations/add', async (req, res) => {
  const { type, station, userId} = req.body;

  try {
    // Validate the station
    const validStations = ["Hall 29 Rental Station", "Library Lawns Rental Station", "WSS Rental Station", "Bozolli Rental Station"];
    if (!validStations.includes(station)) {
      return res.status(400).json({ message: 'Invalid station' });
    }

    // Validate the vehicle type
    const validVehicleTypes = ["Bicycle", "Scooter", "Skateboard"];
    if (!validVehicleTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid vehicle type' });
    }

    // Validate userId
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
    const newReservation = new Reservation({
      vehicleId: selectedVehicle._id,
      userId
    });
    await newReservation.save();

    // Send back the reserved vehicle and reservation details
    res.status(201).json({
      message: 'Reservation successful',
      // vehicle: selectedVehicle,
      reservation: newReservation
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});



// Get all reservations
router.get('/reservations', async (req, res) => {
  try {
    const reservations = await Reservation.find();
    res.status(200).send(reservations);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get a reservation by ID
router.get('/reservations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).send();
    }
    res.status(200).send(reservation);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a reservation by ID
router.put('/reservations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const reservation = await Reservation.findByIdAndUpdate(id, req.body, { new: true });
    if (!reservation) {
      return res.status(404).send();
    }
    res.status(200).send(reservation);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a reservation by ID
router.delete('/reservations/delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const reservation = await Reservation.findByIdAndDelete(id);
    if (!reservation) {
      return res.status(404).send();
    }
    res.status(204).send({message: 'Reservation deleted.'});
  } catch (error) {
    res.status(500).send(error);
  }
});

//Redeem a reservation and start the rental
router.post('/reservations/redeem', async (req, res) => {
  const { reservationId } = req.body;

  try {
    // Validate request body
    if (!reservationId) {
      return res.status(400).json({ message: 'Reservation ID is required' });
    }

    // Find the reservation
    const reservation = await Reservation.findById(reservationId);

    // If no reservation is found, return an error
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Find the vehicle associated with the reservation
    const vehicle = await Vehicle.findById(reservation.vehicleId);

    // If no vehicle is found, return an error
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Create a new rental record
    const newRental = new Rental({
      vehicleID: reservation.vehicleId,
      userId: reservation.userId, 
      startTime: new Date(), 
    });
    await newRental.save();

    //Delete the reservation
    await Reservation.findByIdAndDelete(reservationId);

    // Respond with the rental details
    res.status(201).json({
      message: 'Rental started successfully',
      reservation,
      vehicle,
      rental: newRental,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});




export default router;
