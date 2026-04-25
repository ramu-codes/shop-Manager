import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, trim: true },
    printPrice: { type: Number, default: 0 },
    purchasePrice: { type: Number, default: 0 },
    sellPrice: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    image: { type: String, default: '' },
    category: { type: String, default: 'Other' },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
