import express from 'express';
import healthRoutes from './health.js';
import bankStatementRoutes from './bankStatements.js';
const router = express.Router();
// Mount routes
router.use('/health', healthRoutes);
router.use('/bank-statements', bankStatementRoutes);
export default router;
//# sourceMappingURL=index.js.map