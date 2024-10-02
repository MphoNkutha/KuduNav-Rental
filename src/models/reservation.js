import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  bikeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bike', required: true },
  userId: { type: String, required: true },
  status: { type: String, default: 'reserved' },
  timestamp: { type: Date, default: Date.now },
});

const Reservation = mongoose.model('Reservation', reservationSchema);
export default Reservation;
