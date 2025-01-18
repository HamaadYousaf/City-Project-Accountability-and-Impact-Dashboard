import express from 'express'
import { createComment, getComments } from '../controllers/comment.controller.js';
const router = express.Router();

router.route('/').get(getComments).post(createComment)

export default router