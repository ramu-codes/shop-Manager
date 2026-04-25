import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import SalaryPayment from '../models/SalaryPayment.js';

// =================== EMPLOYEES ===================

// GET /api/employees
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/employees
export const createEmployee = async (req, res) => {
  try {
    const employee = await Employee.create({ ...req.body, userId: req.userId });
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/employees/:id
export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/employees/:id
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =================== ATTENDANCE ===================

// GET /api/attendance?month=2024-03
export const getAttendance = async (req, res) => {
  try {
    const filter = { userId: req.userId };
    if (req.query.month) {
      // Filter attendance by month prefix (e.g., "2024-03")
      filter.date = { $regex: `^${req.query.month}` };
    }
    const attendance = await Attendance.find(filter);
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/attendance — Upsert attendance (one record per employee per day)
export const markAttendance = async (req, res) => {
  try {
    const { employeeId, date, status } = req.body;
    const attendance = await Attendance.findOneAndUpdate(
      { employeeId, date, userId: req.userId },
      { status },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =================== SALARY PAYMENTS ===================

// GET /api/salary-payments
export const getSalaryPayments = async (req, res) => {
  try {
    const payments = await SalaryPayment.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/salary-payments
export const createSalaryPayment = async (req, res) => {
  try {
    const payment = await SalaryPayment.create({ ...req.body, userId: req.userId });
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
