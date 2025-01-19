import express from 'express'
const router = express.Router();
import { createProject, getProjects, getProject } from '../controllers/project.controller.js';

router.route('/').get(getProjects).post(createProject)
router.route('/:id').get(getProject)

export default router