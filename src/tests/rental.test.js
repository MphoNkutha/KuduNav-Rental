import request from 'supertest';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from '../index.js';
import express from 'express';
import Vehicle from '../models/vehicles.js';
import Rental from '../models/rental.js';
import Reservation from '../models/reservation.js';
import Vehicles from '../models/vehicles.js';

dotenv.config();
let server;

const MONGODB_URI= "mongodb+srv://Mpho:flTfkgI7qOnJNIYp@milky.mrz11.mongodb.net/?retryWrites=true&w=majority&appName=milky"

beforeAll(async () => {
  
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});
server = app.listen(3000, () => {
  console.log(`Server is running on port 3000`);
});

afterAll(async () => {
  // Disconnect from the test database
  await mongoose.connection.close();
  if (server) {
  server.close(); // Close the server if it exists
  }
});

beforeEach(async () => {
  // Clear the database before each test
  await Vehicles.deleteMany({});
  await Rental.deleteMany({});
  await Reservation.deleteMany({});
});

describe('Vehicle Endpoints', () => {
  it('should create a new vehicle', async () => {
    const res = await request(app)
      .post('/vehicles/add')
      .send({
        type: 'Bicycle',
        station: 'Hall 29 Rental Station',
      });
    expect(res.statusCode).toBe(201);
    // expect(res.body.vehicle.type).toBe('Bicycle');
    // expect(res.body.vehicle.station).toBe('Hall 29 Rental Station');
  });

  it('should get all available vehicles', async () => {
    await Vehicle.create({ type: 'Bicycle', station: 'Hall 29 Rental Station', available: true });
    await Vehicle.create({ type: 'Scooter', station: 'Library Lawns Rental Station', available: false });

    const res = await request(app).get('/vehicles');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].type).toBe('Bicycle');
  });

  it('should get vehicles by station', async () => {
    await Vehicle.create({ type: 'Bicycle', station: 'Hall 29 Rental Station' });
    await Vehicle.create({ type: 'Scooter', station: 'Hall 29 Rental Station' });

    const res = await request(app).get('/station/Hall 29 Rental Station');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });
});

describe('Rental Endpoints', () => {
  it('should create a new rental', async () => {
    const vehicle1 = await Vehicle.create({ type: 'Bicycle', station: 'Hall 29 Rental Station', available: true });

    const res = await request(app)
      .post('/rentals/add')
      .send({
        type: 'Bicycle',
        station: 'Hall 29 Rental Station',
        userId: '12345678d',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.rental.userId).toBe('12345678d');
  });

  it('should return a rental by id', async () => {
    const vehicle = await Vehicle.create({ type: 'Bicycle', station: 'Hall 29 Rental Station', available: false });
    const rental = await Rental.create({  type: 'Bicycle', station: 'Hall 29 Rental Station', userId: '123456', vehicleID: vehicle._id });

    const res = await request(app)
      .get(`/rentals/${rental._id}`);
      // .send({ station: 'Library Lawns Rental Station' });
    expect(res.statusCode).toBe(200);
    // expect(res.body.vehicle.available).toBe(true);
    // expect(res.body.vehicle.station).toBe('Library Lawns Rental Station');
  });
});

describe('Reservation Endpoints', () => {
  it('should create a new reservation', async () => {
    await Vehicle.create({ type: 'Scooter', station: 'WSS Rental Station', available: true });

    const res = await request(app)
      .post('/reservations/add')
      .send({
        type: 'Scooter',
        station: 'WSS Rental Station',
        userId: '789012',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.reservation.userId).toBe('789012');
  });

  it('should redeem a reservation', async () => {
    const vehicle = await Vehicle.create({ type: 'Skateboard', station: 'Bozolli Rental Station', available: false });
    const reservation = await Reservation.create({ vehicleId: vehicle._id, userId: '789012' });

    const res = await request(app)
      .post(`/reservations/redeem`)
      .send({ reservationId: reservation._id });
    expect(res.statusCode).toBe(201);
    expect(res.body.rental.userId).toBe('789012');
  });
});

describe('Error Handling', () => {
  it('should return 404 when trying to rent unavailable vehicle', async () => {
    const res = await request(app)
      .post('/rentals/add')
      .send({
        type: 'Bicycle',
        station: 'Hall 29 Rental Station',
        userId: '123456',
      });
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('No available vehicles at this station');
  });

  it('should return 400 for invalid station', async () => {
    const res = await request(app)
      .post('/vehicles/add')
      .send({
        type: 'Bicycle',
        station: 'Invalid Station',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Invalid station');
  });

  it('should return 400 for invalid vehicle type', async () => {
    const res = await request(app)
      .post('/vehicles/add')
      .send({
        type: 'Car',
        station: 'Hall 29 Rental Station',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Invalid vehicle type');
  });
});