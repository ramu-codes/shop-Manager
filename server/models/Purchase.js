import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema(
  {
    sellerId: { type: String, default: '' },
    sellerName: { type: String, default: '' },
    itemId: { type: String, default: '' },
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    purchasePrice: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    date: { type: String, required: true },
    image: { type: String, default: '' },
    estimatedProfit: { type: Number, default: 0 },
    sellPrice: { type: Number, default: 0 },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Purchase = mongoose.model('Purchase', purchaseSchema);
export default Purchase;
