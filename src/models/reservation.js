import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true  },
  //station(retrieved from the vehicle's station data):
  station: { type: String },
  //vehicleType(retrieved from the vehicle's type data):
  vehicleType: { type: String },
  userId: { type: String},
  status: { type: String, default: 'reserved' },
  timestamp: { type: Date, default: Date.now },
});

const Reservation = mongoose.model('Reservation', reservationSchema);
export default Reservation;
