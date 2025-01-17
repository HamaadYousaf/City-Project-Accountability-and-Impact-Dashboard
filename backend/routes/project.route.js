import express from 'express'
const router = express.Router();
import { createProject, getProjects } from '../controllers/project.controller.js';

router.route('/').get(getProjects).post(createProject)

export default router