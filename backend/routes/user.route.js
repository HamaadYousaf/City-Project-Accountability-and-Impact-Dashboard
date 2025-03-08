import express from 'express'
import { createUser, getUsers, loginUser } from '../controllers/user.controller.js';
const router = express.Router();

router.route('/').get(getUsers).post(createUser)
router.route('/login').post(loginUser);

export default router