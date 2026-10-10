const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// Sample data - 6 operators as per assignment
let buses = [
  { id: 1, operator: "Asian Travels", name: "Asian AC Seater", from: "Cochin", to: "Calicut", departure: "06:00 AM", arrival: "10:30 AM", duration: "4h 30m", price: 450, available: 35, total: 40, date: "2026-10-11" },
  { id: 2, operator: "A1 Travels", name: "A1 Luxury Coach", from: "Cochin", to: "Calicut", departure: "09:00 AM", arrival: "01:30 PM", duration: "4h 30m", price: 600, available: 20, total: 35, date: "2026-10-11" },
  { id: 3, operator: "Kerala Lines", name: "Kerala Lines Super Fast", from: "Calicut", to: "Cochin", departure: "07:00 AM", arrival: "11:30 AM", duration: "4h 30m", price: 400, available: 28, total: 40, date: "2026-10-11" },
  { id: 4, operator: "Kallada Travels", name: "Kallada Multi Axle", from: "Cochin", to: "Calicut", departure: "10:30 PM", arrival: "03:00 AM", duration: "4h 30m", price: 750, available: 15, total: 30, date: "2026-10-11" },
  { id: 5, operator: "Kerala RTC", name: "KSRTC Garuda", from: "Cochin", to: "Calicut", departure: "02:00 PM", arrival: "06:30 PM", duration: "4h 30m", price: 380, available: 40, total: 45, date: "2026-10-11" },
  { id: 6, operator: "Greenline Travels", name: "Greenline Sleeper", from: "Calicut", to: "Cochin", departure: "11:00 PM", arrival: "03:30 AM", duration: "4h 30m", price: 850, available: 18, total: 30, date: "2026-10-11" }
];

let bookings = [];

app.get('/api/buses', (req, res) => {
  const { from, to, date } = req.query;
  let result = buses;
  if (from) result = result.filter(b => b.from.toLowerCase() === from.toLowerCase());
  if (to) result = result.filter(b => b.to.toLowerCase() === to.toLowerCase());
  if (date) result = result.filter(b => b.date === date);
  res.json(result);
});

app.post('/api/book', (req, res) => {
  const { busId, name, phone, seatsCount } = req.body;
  if (!name || !phone || !seatsCount) return res.status(400).json({ error: "Missing details" });
  const bus = buses.find(b => b.id == busId);
  if (!bus || bus.available < seatsCount) return res.status(400).json({ error: "Seats not available" });
  bus.available -= seatsCount;
  const booking = { id: "BK" + Date.now(), bus, name, phone, seats: seatsCount, total: bus.price * seatsCount, date: new Date() };
  bookings.push(booking);
  res.json({ message: "Booking Confirmed", booking });
});

app.get('/api/bookings/:id', (req, res) => {
  const b = bookings.find(x => x.id === req.params.id);
  if (!b) return res.status(404).json({ error: "Not found" });
  res.json(b);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));