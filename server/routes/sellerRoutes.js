import express from 'express';
import { getSellers, getSeller, createSeller, updateSeller, deleteSeller } from '../controllers/sellerController.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

router.route('/').get(getSellers).post(createSeller);
router.route('/:id').get(getSeller).put(updateSeller).delete(deleteSeller);

export default router;
