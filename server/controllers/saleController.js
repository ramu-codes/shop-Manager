import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';

// GET /api/sales
export const getSales = async (req, res) => {
  try {
    const sales = await Sale.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/sales — Create a sale, update stock, handle dues
export const createSale = async (req, res) => {
  try {
    // Generate invoice number
    const count = await Sale.countDocuments({ userId: req.userId });
    const invoiceNo = `INV-${String(count + 1).padStart(4, '0')}`;

    const sale = await Sale.create({
      ...req.body,
      invoiceNo,
      userId: req.userId,
    });

    // Reduce product stock for each item sold
    for (const item of req.body.items) {
      await Product.findOneAndUpdate(
        { _id: item.productId, userId: req.userId },
        { $inc: { stock: -item.quantity } }
      );
    }

    // If payment is on "Due", increase customer's dueAmount
    if (req.body.paymentMode === 'Due' && req.body.customerId) {
      await Customer.findOneAndUpdate(
        { _id: req.body.customerId, userId: req.userId },
        { $inc: { dueAmount: req.body.totalBill } }
      );
    }

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/sales/:id
export const updateSale = async (req, res) => {
  try {
    const sale = await Sale.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/sales/:id — Delete sale, restore stock and dues
export const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!sale) return res.status(404).json({ message: 'Sale not found' });

    // Restore stock
    for (const item of sale.items) {
      await Product.findOneAndUpdate(
        { _id: item.productId, userId: req.userId },
        { $inc: { stock: item.quantity } }
      );
    }

    // Restore customer due amount
    if (sale.paymentMode === 'Due' && sale.customerId) {
      await Customer.findOneAndUpdate(
        { _id: sale.customerId, userId: req.userId },
        { $inc: { dueAmount: -sale.totalBill } }
      );
    }

    res.json({ message: 'Sale deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/sales/next-invoice — Get the next invoice number
export const getNextInvoice = async (req, res) => {
  try {
    const count = await Sale.countDocuments({ userId: req.userId });
    res.json({ invoiceNo: `INV-${String(count + 1).padStart(4, '0')}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
