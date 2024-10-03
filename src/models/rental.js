import mongoose from 'mongoose';

const rentalSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  vehicleID: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  pickupPoint:String,
  dropoffPoint:String,
  rentTimestamp: { type: Date, default: Date.now },
  returnedAt: { type: Date },
});


const Rental = mongoose.model('Rental', rentalSchema);
export default Rental;
