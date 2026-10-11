
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Booking = require('./models/Booking');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Sample bus data
const buses = [
  {
    id: 'BUS001',
    name: 'KSRTC Swift',
    from: 'Kozhikode',
    to: 'Kannur',
    fare: 450,
    time: '06:00 AM'
  },
  {
    id: 'BUS002',
    name: 'Private Express',
    from: 'Kozhikode',
    to: 'Kannur',
    fare: 500,
    time: '08:30 AM'
  },
  {
    id: 'BUS003',
    name: 'KSRTC Fast',
    from: 'Kozhikode',
    to: 'Ernakulam',
    fare: 600,
    time: '07:00 AM'
  }
];

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB ERROR:', err.message);
  });

// Home route
app.get('/', (req, res) => {
  res.send('Bus Booking Backend is running!');
});

// Get all buses or filter by source and destination
app.get('/api/buses', (req, res) => {
  const { from, to } = req.query;

  let filteredBuses = buses;

  if (from) {
    filteredBuses = filteredBuses.filter((bus) =>
      bus.from.toLowerCase().includes(from.trim().toLowerCase())
    );
  }

  if (to) {
    filteredBuses = filteredBuses.filter((bus) =>
      bus.to.toLowerCase().includes(to.trim().toLowerCase())
    );
  }

  res.json(filteredBuses);
});

// Get all bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (err) {
    console.error('Get bookings ERROR:', err.message);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings.'
    });
  }
});

// Get a single booking by reference
app.get('/api/bookings/:reference', async (req, res) => {
  try {
    const booking = await Booking.findOne({
      reference: req.params.reference
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    console.error('Get booking ERROR:', err.message);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking.'
    });
  }
});

// Create a new booking
app.post('/api/bookings', async (req, res) => {
  try {
    const {
      passengerName,
      contact,
      busId,
      journeyDate,
      passengers
    } = req.body;

    // Validate required fields
    if (
      typeof passengerName !== 'string' ||
      !passengerName.trim() ||
      typeof contact !== 'string' ||
      !contact.trim() ||
      typeof busId !== 'string' ||
      !busId.trim() ||
      typeof journeyDate !== 'string' ||
      !journeyDate.trim() ||
      !Number.isInteger(passengers) ||
      passengers < 1
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid passenger, contact, bus, date, and passenger-count details.'
      });
    }

    // Validate date format and calendar date
    if (!/^\d{4}-\d{2}-\d{2}$/.test(journeyDate)) {
      return res.status(400).json({
        success: false,
        message: 'Journey date must use YYYY-MM-DD format.'
      });
    }

    const parsedDate = new Date(`${journeyDate}T00:00:00.000Z`);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== journeyDate
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid journey date.'
      });
    }

    // Find selected bus
    const bus = buses.find((item) => item.id === busId.trim());

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Selected bus was not found.'
      });
    }

    // Generate booking reference
    const reference = `BK${Date.now()}${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    // Calculate fare on the server
    const totalFare = bus.fare * passengers;

    // Save booking to MongoDB
    const booking = await Booking.create({
      reference,
      passengerName: passengerName.trim(),
      contact: contact.trim(),
      busId: bus.id,
      busName: bus.name,
      from: bus.from,
      to: bus.to,
      journeyDate,
      passengers,
      totalFare
    });

    console.log('Booking saved:', booking._id);

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      data: booking
    });
  } catch (err) {
    console.error('Create booking ERROR:', err.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to create booking.'
    });
  }
});

// Delete a booking by reference
app.delete('/api/bookings/:reference', async (req, res) => {
  try {
    const booking = await Booking.findOneAndDelete({
      reference: req.params.reference
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully.'
    });
  } catch (err) {
    console.error('Delete booking ERROR:', err.message);

    res.status(500).json({
      success: false,
      message: 'Failed to delete booking.'
    });
  }
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found.'
  });
});

// Start server after MongoDB connects
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await mongoose.connection.asPromise();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Unable to start server:', err.message);
    process.exit(1);
  }
}

startServer();
