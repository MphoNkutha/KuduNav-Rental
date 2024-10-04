// import request from 'supertest';
// import dotenv from 'dotenv';
// dotenv.config();

// import mongoose from 'mongoose';
// import express from 'express';
// import Vehicle from '../models/vehicles.js';
// import Rental from '../models/rental.js';
// import Reservation from '../models/reservation.js';
// import Vehicles from '../models/vehicles.js';

// const app = express();


// beforeAll(async () => {
//   // Connect to a test database
//   await mongoose.connect(MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });
// });

// afterAll(async () => {
//   // Disconnect from the test database
//   await mongoose.connection.close();
// });

// beforeEach(async () => {
//   // Clear the database before each test
//   await Vehicles.deleteMany({});
//   await Rental.deleteMany({});
//   await Reservation.deleteMany({});
// });

// describe('Vehicle Endpoints', () => {
//   it('should create a new vehicle', async () => {
//     const res = await request(app)
//       .post('/api/v1/rental/vehicles/add')
//       .send({
//         type: 'Bicycle',
//         station: 'Hall-29',
//       });
//     expect(res.statusCode).toBe(201);
//     expect(res.body.vehicle.type).toBe('Bicycle');
//     expect(res.body.vehicle.station).toBe('Hall-29');
//   });

//   it('should get all available vehicles', async () => {
//     await Vehicle.create({ type: 'Bicycle', station: 'Hall-29', available: true });
//     await Vehicle.create({ type: 'Scooter', station: 'Library-Lawns', available: false });

//     const res = await request(app).get('/api/vehicles');
//     expect(res.statusCode).toBe(200);
//     expect(res.body.length).toBe(1);
//     expect(res.body[0].type).toBe('Bicycle');
//   });

//   it('should get vehicles by station', async () => {
//     await Vehicle.create({ type: 'Bicycle', station: 'Hall-29' });
//     await Vehicle.create({ type: 'Scooter', station: 'Hall-29' });

//     const res = await request(app).get('/api/vehicles/station/Hall-29');
//     expect(res.statusCode).toBe(200);
//     expect(res.body.length).toBe(2);
//   });
// });

// describe('Rental Endpoints', () => {
//   it('should create a new rental', async () => {
//     await Vehicle.create({ type: 'Bicycle', station: 'Hall-29', available: true });

//     const res = await request(app)
//       .post('/api/rentals')
//       .send({
//         type: 'Bicycle',
//         station: 'Hall-29',
//         userId: '123456',
//       });
//     expect(res.statusCode).toBe(201);
//     expect(res.body.rental.userId).toBe('123456');
//   });

//   it('should return a rented vehicle', async () => {
//     const vehicle = await Vehicle.create({ type: 'Bicycle', station: 'Hall-29', available: false });
//     const rental = await Rental.create({ vehicleID: vehicle._id, userId: '123456' });

//     const res = await request(app)
//       .put(`/api/rentals/${rental._id}/return`)
//       .send({ station: 'Library-Lawns' });
//     expect(res.statusCode).toBe(200);
//     expect(res.body.vehicle.available).toBe(true);
//     expect(res.body.vehicle.station).toBe('Library-Lawns');
//   });
// });

// describe('Reservation Endpoints', () => {
//   it('should create a new reservation', async () => {
//     await Vehicle.create({ type: 'Scooter', station: 'Wits-Science-Stadium', available: true });

//     const res = await request(app)
//       .post('/api/reservations')
//       .send({
//         type: 'Scooter',
//         station: 'Wits-Science-Stadium',
//         userId: '789012',
//       });
//     expect(res.statusCode).toBe(201);
//     expect(res.body.reservation.userId).toBe('789012');
//   });

//   it('should redeem a reservation', async () => {
//     const vehicle = await Vehicle.create({ type: 'Skateboard', station: 'Bozolli', available: false });
//     const reservation = await Reservation.create({ vehicleId: vehicle._id, userId: '789012' });

//     const res = await request(app)
//       .post(`/api/reservations/${reservation._id}/redeem`);
//     expect(res.statusCode).toBe(201);
//     expect(res.body.rental.userId).toBe('789012');
//   });
// });

// describe('Error Handling', () => {
//   it('should return 404 when trying to rent unavailable vehicle', async () => {
//     const res = await request(app)
//       .post('/api/rentals')
//       .send({
//         type: 'Bicycle',
//         station: 'Hall-29',
//         userId: '123456',
//       });
//     expect(res.statusCode).toBe(404);
//     expect(res.body.message).toBe('No available vehicles at this station');
//   });

//   it('should return 400 for invalid station', async () => {
//     const res = await request(app)
//       .post('/api/vehicles')
//       .send({
//         type: 'Bicycle',
//         station: 'Invalid Station',
//       });
//     expect(res.statusCode).toBe(400);
//     expect(res.body.message).toBe('Invalid station');
//   });

//   it('should return 400 for invalid vehicle type', async () => {
//     const res = await request(app)
//       .post('/api/vehicles')
//       .send({
//         type: 'Car',
//         station: 'Hall-29',
//       });
//     expect(res.statusCode).toBe(400);
//     expect(res.body.message).toBe('Invalid vehicle type');
//   });
// });