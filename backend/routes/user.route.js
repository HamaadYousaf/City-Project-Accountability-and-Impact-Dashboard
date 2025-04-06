import express from 'express'
import { createUser, getUsers, loginUser, deleteUser } from '../controllers/user.controller.js';
const router = express.Router();

router.route('/').get(getUsers).post(createUser)
router.route('/login').post(loginUser);
router.route('/:id').delete(deleteUser);

export default router