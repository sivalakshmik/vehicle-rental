import axios from 'axios';

router.post('/', async (req, res) => {
  const { vehicleId, userId, startDate, endDate } = req.body;

  // Check for overlapping bookings
  const conflict = await Booking.findOne({
    vehicle: vehicleId,
    status: 'confirmed',
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
    ]
  });

  if (conflict) return res.status(409).json({ message: 'Vehicle already booked for selected dates' });

  const booking = await Booking.create({ vehicle: vehicleId, user: userId, startDate, endDate });
  res.status(201).json(booking);
});
router.put('/:id', async (req, res) => {
  const updated = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  await Booking.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
  res.json({ message: 'Booking cancelled' });
});

