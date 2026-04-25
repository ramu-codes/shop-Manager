import DailyEntry from '../models/DailyEntry.js';

// GET /api/daily-entries
export const getDailyEntries = async (req, res) => {
  try {
    const entries = await DailyEntry.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/daily-entries
export const createDailyEntry = async (req, res) => {
  try {
    const entry = await DailyEntry.create({ ...req.body, userId: req.userId });
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/daily-entries/:id
export const updateDailyEntry = async (req, res) => {
  try {
    const entry = await DailyEntry.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/daily-entries/:id
export const deleteDailyEntry = async (req, res) => {
  try {
    const entry = await DailyEntry.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
