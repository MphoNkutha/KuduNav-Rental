import mongoose from 'mongoose';

const rentalSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  vehicleID: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicles', required: true },
  rentTimestamp: { type: Date, default: Date.now },
  returnTimestamp: { type: Date },
});

const Rental = mongoose.model('Rental', rentalSchema);
export default Rental;
