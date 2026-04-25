import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { getAllowedOrigins, normalizeOrigin } from './config/env.js';

import authRoutes from './routes/authRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';
import productRoutes from './routes/productRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import saleRoutes from './routes/saleRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import dailyEntryRoutes from './routes/dailyEntryRoutes.js';

import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

const allowedOrigins = getAllowedOrigins();

function isAllowedOrigin(origin) {
  if (!origin) return true;
  const normalized = normalizeOrigin(origin);
  return allowedOrigins.includes(normalized);
}

/**
 * @returns {import('express').Express}
 */
export default function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  app.use(
    cors({
      origin(origin, callback) {
        if (isAllowedOrigin(origin)) return callback(null, true);
        return callback(new Error(`CORS blocked for origin: ${origin}`), false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use('/api/auth', authRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/sellers', sellerRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/purchases', purchaseRoutes);
  app.use('/api/sales', saleRoutes);
  app.use('/api/expenses', expenseRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/employees', employeeRoutes);
  app.use('/api/daily-entries', dailyEntryRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'EasyShop API is running' });
  });

  app.use('/api', notFound);
  app.use(errorHandler);

  return app;
}
