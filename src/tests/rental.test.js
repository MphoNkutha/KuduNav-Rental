import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../src/index.js';
import Vehicle from '../models/vehicles';  // Removed the redundant import
import Rental from '../models/rental';
import Vehicles from '../models/vehicles';

describe('Rental API tests', () => {
  beforeAll(async () => {
    try {
      const uri = "mongodb+srv://Mpho:flTfkgI7qOnJNIYp@milky.mrz11.mongodb.net/?retryWrites=true&w=majority&appName=milky";
      await mongoose.connect(uri);
      console.log('Connected to test database');

      // Mock some vehicle data
      await Vehicles.create([
        { type: 'bike', station: 'Hall 29', available: true },
        { type: 'scooter', station: 'Hall 29', available: true },
      ]);
    } catch (error) {
      console.error('Error connecting to the database:', error);
    }
  });

  afterAll(async () => {
    try {
      await Rental.deleteMany();  // Clear rentals after tests
      await Vehicle.deleteMany(); // Clear vehicles after tests
      await mongoose.connection.close(); // Ensure connection is closed
      console.log('Test database connection closed');
    } catch (error) {
      console.error('Error during database cleanup:', error);
    }
  });

  test('should retrieve all vehicles', async () => {
    const response = await request(app).get('/vehicles');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

