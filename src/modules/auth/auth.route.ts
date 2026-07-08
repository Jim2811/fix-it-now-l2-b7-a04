import { Router } from 'express';
import { authController } from './auth.controller';
import { Role } from '../../../generated/prisma/client';
import { auth } from '../../middleware/auth';

const router = Router();

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/me', auth(Role.ADMIN, Role.CUSTOMER, Role.TECHNICIAN), authController.getMyProfile);

export const authRoutes = router;