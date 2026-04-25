import express from 'express';
import { getExpenses, createExpense, deleteExpense } from '../controllers/expenseController.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

router.route('/').get(getExpenses).post(createExpense);
router.route('/:id').delete(deleteExpense);

export default router;
