import mongoose from 'mongoose';

const rentalSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  vehicleID: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  pickupPoint:String,
  dropoffPoint:String,
  rentTimestamp: { type: Date, default: Date.now },
  returnedAt: { type: Date },
  used:{type: mongoose.Schema.Types.Boolean, default:false},
  amount:{type: mongoose.Schema.Types.Number}
});


const Rental = mongoose.model('Rental', rentalSchema);
export default Rental;
