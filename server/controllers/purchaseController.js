import Purchase from '../models/Purchase.js';
import Product from '../models/Product.js';

// GET /api/purchases
export const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/purchases — Create purchase and update product stock
export const createPurchase = async (req, res) => {
  try {
    const purchase = await Purchase.create({ ...req.body, userId: req.userId });

    // Update product stock (or create new product if not found)
    if (req.body.itemId) {
      const existing = await Product.findOne({ _id: req.body.itemId, userId: req.userId });
      if (existing) {
        existing.stock += req.body.quantity;
        existing.purchasePrice = req.body.purchasePrice;
        if (req.body.sellPrice) existing.sellPrice = req.body.sellPrice;
        await existing.save();
      }
    } else {
      // Create a new product from purchase if no itemId was provided
      await Product.create({
        itemName: req.body.itemName,
        printPrice: req.body.sellPrice || 0,
        purchasePrice: req.body.purchasePrice,
        sellPrice: req.body.sellPrice || 0,
        stock: req.body.quantity,
        image: req.body.image || '',
        category: 'Other',
        userId: req.userId,
      });
    }

    res.status(201).json(purchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/purchases/:id
export const updatePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!purchase) return res.status(404).json({ message: 'Purchase not found' });
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/purchases/:id — Delete purchase and restore stock
export const deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!purchase) return res.status(404).json({ message: 'Purchase not found' });

    // Restore product stock
    if (purchase.itemId) {
      await Product.findOneAndUpdate(
        { _id: purchase.itemId, userId: req.userId },
        { $inc: { stock: -purchase.quantity } }
      );
    }

    res.json({ message: 'Purchase deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
