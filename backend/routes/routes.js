import express from 'express';
import controller from '../controllers/controllers.js';
const router=express.Router();

router.post('/register',controller.Register);
router.post('/login',controller.Login);

export default router;