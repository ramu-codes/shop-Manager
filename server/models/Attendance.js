import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true },
    date: { type: String, required: true },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Half Day'],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Compound index to ensure one attendance record per employee per day per user
attendanceSchema.index({ employeeId: 1, date: 1, userId: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
