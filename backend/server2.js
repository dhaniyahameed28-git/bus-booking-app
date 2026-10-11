const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connect
mongoose.connect('mongodb://127.0.0.1:27017/busDB')
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.log(err));

// Simple Booking Schema - Bus check illa
const bookingSchema = new mongoose.Schema({
  passengerName: String,
  contact: String,
  from: String,
  to: String,
  journeyDate: String,
  passengers: Number,
  totalFare: Number,
  busName: String,
  reference: String,
  busId: String
}, { strict: false });

const Booking = mongoose.model('Booking', bookingSchema);

app.post('/api/bookings', async (req, res) => {
  try {
    console.log('Received:', req.body);
    const b = new Booking(req.body);
    const saved = await b.save();
    console.log('SAVED! ID:', saved._id);
    res.json({ success: true, _id: saved._id, booking: saved });
  } catch (e) {
    console.log('ERROR:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.listen(3000, () => console.log('Server2 running on 3000'));