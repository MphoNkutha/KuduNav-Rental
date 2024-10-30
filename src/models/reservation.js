import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  vehicleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vehicle', 
    required: true 
  },
  station: { type: String },
  vehicleType: { type: String },
  userId: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['active', 'expired', 'redeemed'],
    default: 'active' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  plannedPickupTime: { 
    type: Date, 
    required: true 
  },
  expiresAt: { 
    type: Date,
    required: true
  }
});

// Add an index to automatically expire documents
reservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Middleware to set expiration time before saving
reservationSchema.pre('save', function(next) {
  if (this.isNew) {
    // Set expiration to 15 minutes after planned pickup time
    this.expiresAt = new Date(this.plannedPickupTime.getTime() + 15 * 60000);
  }
  next();
});

const Reservation = mongoose.model('Reservation', reservationSchema);
export default Reservation;
