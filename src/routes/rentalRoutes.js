import express from 'express';
import Rental from '../models/rental.js'; 
import Vehicle from '../models/vehicles.js';
import axios from 'axios';


const router = express.Router();
// const newNotification = await axios.post("https://gateway.tandemworkflow.com/api/v1/notification/create/notification")
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


// Get all rentals
router.get("/rentals", async (req, res) => {
  try {
    const userId = req.user;
    const _rentals = await Rental.find({ userId }).sort({rentTimestamp:-1});
    let payload = await Promise.all(
      _rentals.map(async (_) => {
        const vehicle = await Vehicle.findOne({ _id: _.vehicleID });
        const v = VehiclesObj.find((obj) => obj.name == vehicle?.type)
        const obj = {..._._doc, vehicle:v}
        return obj;
      })
    );
    payload = payload.filter((_) => _ != null)
    res.status(200).send(payload);
  } catch (error) {
    console.log(error)
    res.status(500).send(error);
  }
});

// Rent a vehicle, given vehicle type, station, and user ID
router.post("/rentals/add", async (req, res) => {
  try {
    const { type, station } = req.body; // Get all necessary data
    const userId = req.user;
    const vehicle = await Vehicle.findOne({ type, available: true, station });

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    vehicle.available = false;
    await vehicle.save();

    const newRental = await Rental.findOne({
      userId,
      used: false,
      amount: Prices[type],
    });
    newRental.vehicleID = vehicle._id;
    newRental.pickupPoint = station;
    newRental.used = true;
    await newRental.save();

    res
      .status(201)
      .json({
        message: "Vehicle rental object created successfully",
        rental: newRental,
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }

  const notificationData = {
    type: "Rental Request",
    message: "You have successfully rented a vehicle",
    targetedUsers: [userId],   // Identifier for the user    
    scheduleTime: Date.now() + 5 * 60000, // 5 minutes from now
  };
  
  // Call the function to create a notification
  const not = await createNotification(notificationData);
  console.log(not)
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
