import express from 'express';
import {
  getEmployees, createEmployee, updateEmployee, deleteEmployee,
  getAttendance, markAttendance,
  getSalaryPayments, createSalaryPayment,
} from '../controllers/employeeController.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

router.route('/').get(getEmployees).post(createEmployee);

router.route('/attendance').get(getAttendance).post(markAttendance);

router.route('/salary-payments').get(getSalaryPayments).post(createSalaryPayment);

router.route('/:id').put(updateEmployee).delete(deleteEmployee);

export default router;
