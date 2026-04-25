import Payment from '../models/Payment.js';
import Customer from '../models/Customer.js';

// GET /api/payments
export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/payments — Record a payment and reduce customer's due
export const createPayment = async (req, res) => {
  try {
    const payment = await Payment.create({ ...req.body, userId: req.userId });

    // Reduce customer's due amount
    if (req.body.customerId) {
      await Customer.findOneAndUpdate(
        { _id: req.body.customerId, userId: req.userId },
        { $inc: { dueAmount: -req.body.amount } }
      );
    }

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
