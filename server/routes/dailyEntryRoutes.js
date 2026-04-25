import express from 'express';
import { getDailyEntries, createDailyEntry, updateDailyEntry, deleteDailyEntry } from '../controllers/dailyEntryController.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

router.route('/').get(getDailyEntries).post(createDailyEntry);
router.route('/:id').put(updateDailyEntry).delete(deleteDailyEntry);

export default router;
