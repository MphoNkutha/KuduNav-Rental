import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  bikeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bike', required: true },
  //station(retrieved from the vehicle's station data):
  station: { type: String },
  //vehicleType(retrieved from the vehicle's type data):
  vehicleType: { type: String },
  userId: { type: String, required: true },
  status: { type: String, default: 'reserved' },
  timestamp: { type: Date, default: Date.now },
});

const Reservation = mongoose.model('Reservation', reservationSchema);
export default Reservation;
