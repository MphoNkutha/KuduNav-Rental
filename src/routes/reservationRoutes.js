import express from 'express';
import Reservation from '../models/reservation.js'; // Make sure you create a Reservation model

const router = express.Router();

// Create a new reservation
router.post('/reservations/add', async (req, res) => {
  try {
    const reservation = new Reservation(req.body);
    await reservation.save();
    res.status(201).send(reservation);
  } catch (error) {
    res.status(400).send(error);
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
router.delete('/reservations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const reservation = await Reservation.findByIdAndDelete(id);
    if (!reservation) {
      return res.status(404).send();
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;
