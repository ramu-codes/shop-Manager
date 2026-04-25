import express from 'express';
import { getSales, createSale, updateSale, deleteSale, getNextInvoice } from '../controllers/saleController.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

router.get('/next-invoice', getNextInvoice);
router.route('/').get(getSales).post(createSale);
router.route('/:id').put(updateSale).delete(deleteSale);

export default router;
