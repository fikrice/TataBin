import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { sequelize } from './src/models/index.js';
import errorHandler from './src/middlewares/errorHandler.js';
import { authLimiter, apiLimiter } from './src/middlewares/rateLimiter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting untuk semua API endpoint
app.use('/api', apiLimiter);

// Base Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to TataBin WMS API'
  });
});

// Registrasi Rute API Autentikasi
import authRouter from './src/routes/auth.js';
app.use('/api/auth', authLimiter, authRouter);

// Registrasi Rute API Master Data
import warehouseRouter from './src/routes/warehouse.js';
import storageBinRouter from './src/routes/storageBin.js';
import assetRouter from './src/routes/asset.js';
import supplierRouter from './src/routes/supplier.js';
import userRouter from './src/routes/user.js';
app.use('/api/warehouses', warehouseRouter);
app.use('/api/storage-bins', storageBinRouter);
app.use('/api/assets', assetRouter);
app.use('/api/suppliers', supplierRouter);
app.use('/api/users', userRouter);

// Registrasi Rute API Operasional (Inbound & Outbound)
import inboundRouter from './src/routes/inbound.js';
import outboundRouter from './src/routes/outbound.js';
app.use('/api/inbound', inboundRouter);
app.use('/api/outbound', outboundRouter);

// Registrasi Rute API Laporan & Analitik
import reportRouter from './src/routes/report.js';
import analyticsRouter from './src/routes/analytics.js';
app.use('/api/reports', reportRouter);
app.use('/api/analytics', analyticsRouter);

// Centralized Error Handler
app.use(errorHandler);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
