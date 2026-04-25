import mongoose from 'mongoose';

// Sub-schema for individual items in a sale
const saleItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    sellPrice: { type: Number, required: true },
    mrp: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, required: true },
    customerId: { type: String, default: '' },
    customerName: { type: String, required: true },
    customerPhone: { type: String, default: '' },
    items: [saleItemSchema],
    totalBill: { type: Number, required: true },
    totalDiscount: { type: Number, default: 0 },
    paymentMode: {
      type: String,
      enum: ['Cash', 'Online', 'Due'],
      default: 'Cash',
    },
    date: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Sale = mongoose.model('Sale', saleSchema);
export default Sale;
