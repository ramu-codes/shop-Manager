import mongoose from 'mongoose';

const dailyEntrySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['revenue', 'expenditure'],
      required: true,
    },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, default: 'Other' },
    date: { type: String, required: true },
    time: { type: String, default: '' },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const DailyEntry = mongoose.model('DailyEntry', dailyEntrySchema);
export default DailyEntry;
