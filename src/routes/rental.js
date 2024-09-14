import express from 'express';


const router = express.Router();

let bikes = [
  { id: 1, type: 'Bicycle', station: 'West Campus, Hall 29', available: true },
  { id: 2, type: 'Bicycle', station: 'West Campus, Hall 29', available: true },
  { id: 3, type: 'Scooter', station: 'West Campus, MSL', available: true },
  { id: 4, type: 'Scooter', station: 'West Campus, MSL', available: true },
  { id: 5, type: 'Scooter', station: 'East Campus, Bozzoli', available: true },
  { id: 6, type: 'Scooter', station: 'East Campus, Bozzoli', available: true },
  { id: 7, type: 'Scooter', station: 'East Campus, Library Lawns', available: true },
  { id: 8, type: 'Scooter', station: 'East Campus, Library Lawns', available: true },


];

let reservations = [];
let rentals = [];

// Check available bikes
router.get('/bikes', (req, res) => {
  const availableBikes = bikes.filter(bike => bike.available);
  res.json(availableBikes);
});

// Create a reservation
router.post('/reservation', (req, res) => {
    const { bikeId, userId } = req.body;
  
    // Validate request body
    if (!bikeId || !userId) {
      return res.status(400).json({ message: 'Missing bikeId or userId' });
    }
  
    // Find the bike and check availability
    const bike = bikes.find(b => b.id === bikeId && b.available);
  
    if (!bike) {
      return res.status(400).json({ message: 'Bike is not available for reservation' });
    }
  
    // Create a new reservation
    const reservation = {
      reservationId: generateUniqueId(),
      bikeId,
      userId,
      status: 'reserved',
      timestamp: new Date()
    };
  
    // Add reservation to the list and mark bike as unavailable
    reservations.push(reservation);
    bike.available = false;
  
    // Respond with the created reservation
    res.status(201).json(reservation);
  });
  
  // Function to generate unique reservation IDs
  function generateUniqueId() {
    return 'res-' + Date.now(); 
  }
  
//Rent a bike
  router.post('/rent', (req, res) => {
    const { reservationId, userId } = req.body;
  
    // Validate request body
    if (!reservationId || !userId) {
      return res.status(400).json({ message: 'Missing reservationId or userId' });
    }
  
    // Find the reservation
    const reservation = reservations.find(r => r.reservationId === reservationId && r.userId === userId);
  
    // Check if the reservation is valid and in 'reserved' status
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
  
    if (reservation.status !== 'reserved') {
      return res.status(400).json({ message: 'Reservation is not in a reserved state' });
    }
  
    // Update reservation status to 'rented'
    reservation.status = 'rented';
  
    // Add the rental record
    rentals.push({
      userId,
      bikeId: reservation.bikeId,
      rentTimestamp: new Date()
    });
  
    // Respond with success message and updated reservation
    res.status(200).json({
      message: 'Bike rented successfully',
      reservation
    });
  });
  

// Cancel a reservation
router.delete('/cancel', (req, res) => {
  const { reservationId, userId } = req.body;

  // Check for missing parameters
  if (!reservationId || !userId) {
    return res.status(400).json({ message: 'Missing reservationId or userId' });
  }

  // Find the reservation
  const reservation = reservations.find(r => r.reservationId === reservationId && r.userId === userId);

  // Check if reservation exists and is still reserved
  if (!reservation) {
    return res.status(404).json({ message: 'Reservation not found' });
  }

  if (reservation.status !== 'reserved') {
    return res.status(400).json({ message: 'Reservation cannot be cancelled because it is not in a reserved state' });
  }

  // Update reservation status
  reservation.status = 'cancelled';

  // Find the associated bike and make it available
  const bike = bikes.find(b => b.id === reservation.bikeId);
  if (bike) {
    bike.available = true;
  } else {
    // Log the issue if the bike is not found
    console.warn(`Bike with ID ${reservation.bikeId} not found`);
  }

  // Respond with success message
  res.status(200).json({ message: 'Reservation cancelled successfully' });
});

//Check user reservation
router.get('/reservations/:userId', (req, res) => {
    const { userId } = req.params;
  
    // Validate userId
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
  
    // Find reservations for the given userId
    const userReservations = reservations.filter(r => r.userId === userId);
  
    // Check if there are any reservations
    if (userReservations.length === 0) {
      return res.status(404).json({ message: 'No reservations found for this user' });
    }
  
    // Respond with the user's reservations
    res.status(200).json(userReservations);
  });
  

export default router;
