CREATE TABLE bikes (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50),
  station VARCHAR(100),
  available BOOLEAN
);

CREATE TABLE reservations (
  reservation_id SERIAL PRIMARY KEY,
  bike_id INTEGER REFERENCES bikes(id),
  user_id VARCHAR(50),
  status VARCHAR(20),
  timestamp TIMESTAMP
);

CREATE TABLE rentals (
  rental_id SERIAL PRIMARY KEY,
  user_id VARCHAR(50),
  bike_id INTEGER REFERENCES bikes(id),
  rent_timestamp TIMESTAMP
);
