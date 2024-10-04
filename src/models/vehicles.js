import mongoose, { mongo } from 'mongoose';


export const VehicleTypes = ['Scooter', 'Bicycle', 'Skateboard']

export const Prices = {
  'Scooter':10,
  'Bicycle':25,
  'Skateboard':15
}

export const VehiclesObj = [
  {
    name:'Scooter',
    type:'Scooter',
    image: 'scooter',
    price:10,
  },
  {
    name:'Bicycle',
    type:'Bicycle',
    image: 'bicycle',
    price:25,
  },
  {
    name:'Skateboard',
    type:'Skateboard',
    image: 'skateboard',
    price:15,
  }
]


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