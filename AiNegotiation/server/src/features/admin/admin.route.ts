import { Router } from 'express';
import { authenticate } from '../../middlewares/custom/auth.middleware.ts';
import { requireAdmin } from '../../middlewares/custom/admin.middleware.ts';
import { adminController } from './admin.controller.ts';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// Products
router.get('/products', adminController.listProducts);
router.post('/products', adminController.createProduct);
router.put('/products/:productId', adminController.updateProduct);
router.delete('/products/:productId', adminController.deleteProduct);

// Users
router.get('/users', adminController.listUsers);
router.patch('/users/:userId/role', adminController.promoteUser);

export default router;

