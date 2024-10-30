import express from 'express';
import Reservation from '../models/reservation.js'; 
import Vehicle from '../models/vehicles.js'; 
import Rental from '../models/rental.js';
// import axios from "axios"
const router = express.Router();


async function createNotification(notificationData) {
  try {
    const response = await axios.post("https://gateway.tandemworkflow.com/api/v1/notification/create/notification", notificationData);
    console.log("Notification created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}


router.post('/reservations/add', async (req, res) => {
  const { type, station, userId, plannedPickupTime } = req.body;

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

    // Validate userId and plannedPickupTime
    if (!userId || !plannedPickupTime) {
      return res.status(400).json({ message: 'User ID and planned pickup time are required' });
    }

    // Validate that plannedPickupTime is in the future
    const pickupTime = new Date(plannedPickupTime);
    if (pickupTime < new Date()) {
      return res.status(400).json({ message: 'Planned pickup time must be in the future' });
    }

    // Find all available vehicles at the station
    const availableVehicles = await Vehicle.find({ type, station, available: true });
    
    if (availableVehicles.length === 0) {
      return res.status(404).json({ message: 'No available vehicles at this station' });
    }

    // Select the first available vehicle and reserve it
    const selectedVehicle = availableVehicles[0];
    selectedVehicle.available = false;
    await selectedVehicle.save();

    // Create a new reservation
    const newReservation = new Reservation({
      vehicleId: selectedVehicle._id,
      station,
      vehicleType: type,
      userId,
      plannedPickupTime: pickupTime,
      expiresAt: new Date(pickupTime.getTime() + 15 * 60000) 
    });
    await newReservation.save();

    res.status(201).json({
      message: 'Reservation successful',
      reservation: {
        ...newReservation.toObject(),
        expirationTime: newReservation.expiresAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
  const notificationData = {
    type: "Rental Request",
    message: "You have successfully reserved a vehicle",
    targetedUsers: [userId],   // Identifier for the user    
    scheduleTime: Date.now() + 5 * 60000, // 5 minutes from now
  };
  
  // Call the function to create a notification
  const not = await createNotification(notificationData);
  console.log(not)
});

// Redeem a reservation and start the rental
router.post('/reservations/redeem', async (req, res) => {
  const { reservationId } = req.body;

  try {
    if (!reservationId) {
      return res.status(400).json({ message: 'Reservation ID is required' });
    }

    // Find the reservation
    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check if reservation is expired
    if (reservation.status === 'expired') {
      return res.status(400).json({ message: 'Reservation has expired' });
    }

    // Check if it's too early to redeem
    const currentTime = new Date();
    const plannedTime = new Date(reservation.plannedPickupTime);
    const timeDiff = Math.abs(currentTime - plannedTime) / 60000; // difference in minutes

    if (currentTime < plannedTime) {
      return res.status(400).json({ 
        message: 'Too early to redeem. Please come back at the planned pickup time' 
      });
    }

    if (timeDiff > 15) {
      // Update reservation status to expired
      reservation.status = 'expired';
      await reservation.save();
      
      // Make vehicle available again
      const vehicle = await Vehicle.findById(reservation.vehicleId);
      if (vehicle) {
        vehicle.available = true;
        await vehicle.save();
      }
      
      return res.status(400).json({ message: 'Reservation has expired' });
    }

    // Find the vehicle
    const vehicle = await Vehicle.findById(reservation.vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Create new rental
    const newRental = new Rental({
      vehicleID: reservation.vehicleId,
      userId: reservation.userId,
      startTime: new Date(),
    });
    await newRental.save();

    // Update reservation status
    reservation.status = 'redeemed';
    await reservation.save();

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

// Get all active reservations
router.get('/reservations', async (req, res) => {
  try {
    const reservations = await Reservation.find({ status: 'active' });
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json(error);
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

export default router;
