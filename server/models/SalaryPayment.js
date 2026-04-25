import mongoose from 'mongoose';

const salaryPaymentSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true },
    employeeName: { type: String, required: true },
    amount: { type: Number, required: true },
    month: { type: String, required: true },
    date: { type: String, required: true },
    note: { type: String, default: '' },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const SalaryPayment = mongoose.model('SalaryPayment', salaryPaymentSchema);
export default SalaryPayment;
