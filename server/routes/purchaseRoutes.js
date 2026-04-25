import express from 'express';
import { getPurchases, createPurchase, updatePurchase, deletePurchase } from '../controllers/purchaseController.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

router.route('/').get(getPurchases).post(createPurchase);
router.route('/:id').put(updatePurchase).delete(deletePurchase);

export default router;
