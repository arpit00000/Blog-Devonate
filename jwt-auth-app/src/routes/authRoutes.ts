import { Router } from 'express';
import AuthController from '../controllers/authController';

const router = Router();
const authController = new AuthController();

const setAuthRoutes = (app) => {
    app.post('/api/auth/signup', authController.signUp);
    app.post('/api/auth/signin', authController.signIn);
};

export default setAuthRoutes;