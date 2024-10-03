import mongoose, { mongo } from 'mongoose';


export const VehicleTypes = ['Scooter', 'Bicycle', 'Skateboard']

export const populateObject = (type) => ({
  name: type,
  image: type.toLowerCase(), // You would use a proper type for images in a real app
})

const vehiclesSchema = new mongoose.Schema({
  type: { type: String, enum:VehicleTypes , required: true },
  station: String,
  available: { type: Boolean, default: true }
});



const Vehicles = mongoose.model('Vehicle', vehiclesSchema);
export default Vehicles;