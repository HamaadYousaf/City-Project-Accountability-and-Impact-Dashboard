import express from 'express'
import { createUser, getUsers } from '../controllers/user.controller.js';
const router = express.Router();

router.route('/').get(getUsers).post(createUser)

export default router