import app from '../../src/index.js';
import request from 'supertest';

describe('Rental API', () => {
  let server;

  beforeAll((done) => {
    server = app.listen(3000, done);
  });

  afterAll((done) => {
    server.close(done);
  });

  // Test case 1: Check available bikes
  it('should return available bikes', async () => {
    const res = await request(server).get('/bikes');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // Test case 2: Create a reservation
  it('should create a reservation for a bike', async () => {
    const res = await request(server)
      .post('/reservation')
      .send({ bikeId: 1, userId: 'user123' });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('reservationId');
    expect(res.body).toHaveProperty('status', 'reserved');
  });

  // Test case 3: Rent a bike
  it('should rent a bike based on a reservation', async () => {
    // First, create a reservation
    const reservation = await request(server)
      .post('/reservation')
      .send({ bikeId: 3, userId: 'user123' });

    // Now, rent the reserved bike
    const res = await request(app)
      .post('/rent')
      .send({ reservationId: reservation.body.reservationId, userId: 'user123' });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Bike rented successfully');
  });

  // Test case 4: Cancel a reservation
  it('should cancel a reservation', async () => {
    // Create a reservation to cancel
    const reservation = await request(server)
      .post('/reservation')
      .send({ bikeId: 2, userId: 'user456' });

    // Cancel the reservation
    const res = await request(server)
      .delete('/cancel')
      .send({ reservationId: reservation.body.reservationId, userId: 'user456' });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Reservation cancelled successfully');
  });

  // Test case 5: Get user reservations
  it('should return reservations for a user', async () => {
    const res = await request(server).get('/reservations/user123');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0); // There should be at least one reservation for user123
  });
});
