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

  describe('POST /reservations/add', () => {
    it('should create a new reservation with valid data', async () => {
      await Vehicle.create({ 
        type: 'Scooter', 
        station: 'WSS Rental Station', 
        available: true 
      });

      const plannedPickupTime = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now
      
      const res = await request(app)
        .post('/reservations/add')
        .send({
          type: 'Scooter',
          station: 'WSS Rental Station',
          userId: '789012',
          plannedPickupTime
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.reservation.userId).toBe('789012');
      expect(res.body.reservation.status).toBe('active');
      // expect(new Date(res.body.reservation.plannedPickupTime)).toEqual(plannedPickupTime);
      // expect(new Date(res.body.reservation.expiresAt)).toEqual(
      //   new Date(plannedPickupTime.getTime() + 15 * 60000)
      // );
    });

    it('should reject reservation with invalid station', async () => {
      const res = await request(app)
        .post('/reservations/add')
        .send({
          type: 'Scooter',
          station: 'Invalid Station',
          userId: '789012',
          plannedPickupTime: new Date(Date.now() + 3600000)
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Invalid station');
    });

    it('should reject reservation with past pickup time', async () => {
      await Vehicle.create({ 
        type: 'Scooter', 
        station: 'WSS Rental Station', 
        available: true 
      });

      const res = await request(app)
        .post('/reservations/add')
        .send({
          type: 'Scooter',
          station: 'WSS Rental Station',
          userId: '789012',
          plannedPickupTime: new Date(Date.now() - 3600000) // 1 hour ago
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Planned pickup time must be in the future');
    });
  });

  describe('POST /reservations/redeem', () => {
    it('should successfully redeem a valid reservation', async () => {
      const vehicle = await Vehicle.create({ 
        type: 'Skateboard', 
        station: 'Bozolli Rental Station', 
        available: false 
      });

      const plannedPickupTime = new Date(Date.now() - 5 * 60000); // 5 minutes ago
      const reservation = await Reservation.create({ 
        vehicleId: vehicle._id, 
        userId: '789012',
        status: 'active',
        plannedPickupTime,
        expiresAt: new Date(plannedPickupTime.getTime() + 15 * 60000)
      });

      const res = await request(app)
        .post('/reservations/redeem')
        .send({ reservationId: reservation._id });

      expect(res.statusCode).toBe(201);
      expect(res.body.rental.userId).toBe('789012');
      expect(res.body.reservation.status).toBe('redeemed');
    });

    it('should reject early redemption', async () => {
      const vehicle = await Vehicle.create({ 
        type: 'Skateboard', 
        station: 'Bozolli Rental Station', 
        available: false 
      });

      const plannedPickupTime = new Date(Date.now() + 3600000); // 1 hour from now
      const reservation = await Reservation.create({ 
        vehicleId: vehicle._id, 
        userId: '789012',
        status: 'active',
        plannedPickupTime,
        expiresAt: new Date(plannedPickupTime.getTime() + 15 * 60000)
      });

      const res = await request(app)
        .post('/reservations/redeem')
        .send({ reservationId: reservation._id });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Too early to redeem. Please come back at the planned pickup time');
    });

    it('should reject expired reservation redemption', async () => {
      const vehicle = await Vehicle.create({ 
        type: 'Skateboard', 
        station: 'Bozolli Rental Station', 
        available: false 
      });

      const plannedPickupTime = new Date(Date.now() - 30 * 60000); // 30 minutes ago
      const reservation = await Reservation.create({ 
        vehicleId: vehicle._id, 
        userId: '789012',
        status: 'active',
        plannedPickupTime,
        expiresAt: new Date(plannedPickupTime.getTime() + 15 * 60000)
      });

      const res = await request(app)
        .post('/reservations/redeem')
        .send({ reservationId: reservation._id });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Reservation has expired');

      // Verify vehicle is made available again
      const updatedVehicle = await Vehicle.findById(vehicle._id);
      expect(updatedVehicle.available).toBe(true);
    });
  });

  describe('GET /reservations', () => {
    it('should return only active reservations', async () => {
      const vehicle = await Vehicle.create({ 
        type: 'Skateboard', 
        station: 'Bozolli Rental Station', 
        available: false 
      });

      await Reservation.create([
        {
          vehicleId: vehicle._id,
          userId: '789012',
          status: 'active',
          plannedPickupTime: new Date(Date.now() + 3600000),
          expiresAt: new Date(Date.now() + 3600000 + 15 * 60000)
        },
        {
          vehicleId: vehicle._id,
          userId: '789013',
          status: 'expired',
          plannedPickupTime: new Date(Date.now() - 3600000),
          expiresAt: new Date(Date.now() - 3600000 + 15 * 60000)
        }
      ]);

      const res = await request(app)
        .get('/reservations');

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].status).toBe('active');
      expect(res.body[0].userId).toBe('789012');
    });
  });

  describe('GET /reservations/:id', () => {
    it('should return a specific reservation', async () => {
      const vehicle = await Vehicle.create({ 
        type: 'Skateboard', 
        station: 'Bozolli Rental Station', 
        available: false 
      });

      const reservation = await Reservation.create({
        vehicleId: vehicle._id,
        userId: '789012',
        status: 'active',
        plannedPickupTime: new Date(Date.now() + 3600000),
        expiresAt: new Date(Date.now() + 3600000 + 15 * 60000)
      });

      const res = await request(app)
        .get(`/reservations/${reservation._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.userId).toBe('789012');
    });

    it('should return 404 for non-existent reservation', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/reservations/${nonExistentId}`);

      expect(res.statusCode).toBe(404);
    });
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