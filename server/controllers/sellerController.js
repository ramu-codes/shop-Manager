import Seller from '../models/Seller.js';

// GET /api/sellers
export const getSellers = async (req, res) => {
  try {
    const sellers = await Seller.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/sellers/:id
export const getSeller = async (req, res) => {
  try {
    const seller = await Seller.findOne({ _id: req.params.id, userId: req.userId });
    if (!seller) return res.status(404).json({ message: 'Seller not found' });
    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/sellers
export const createSeller = async (req, res) => {
  try {
    const seller = await Seller.create({ ...req.body, userId: req.userId });
    res.status(201).json(seller);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/sellers/:id
export const updateSeller = async (req, res) => {
  try {
    const seller = await Seller.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!seller) return res.status(404).json({ message: 'Seller not found' });
    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/sellers/:id
export const deleteSeller = async (req, res) => {
  try {
    const seller = await Seller.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!seller) return res.status(404).json({ message: 'Seller not found' });
    res.json({ message: 'Seller deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
