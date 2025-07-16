import express from 'express';
import healthRoutes from './health.js';
import bankStatementRoutes from './bankStatements.js';
import invoicesRoutes from './invoices.js';
import matchingRoutes from './matching.js';

const router = express.Router();

// Mount routes
router.use('/health', healthRoutes);
router.use('/bank-statements', bankStatementRoutes);
router.use('/invoices', invoicesRoutes);
router.use('/matching', matchingRoutes);

export default router; 