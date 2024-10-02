import mongoose from 'mongoose';

const vehiclesSchema = new mongoose.Schema({
  type: { type: String, required: true },
  station: { type: String, required: true },
  available: { type: Boolean, default: true },
});

const Vehicles = mongoose.model('Vehicles', vehiclesSchema);
export default Vehicles;
