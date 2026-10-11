const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  reference: { type: String },
  passengerName: { type: String },
  contact: { type: String },
  busId: { type: String },
  busName: { type: String },
  from: { type: String },
  to: { type: String },
  journeyDate: { type: String },
  passengers: { type: Number },
  totalFare: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);