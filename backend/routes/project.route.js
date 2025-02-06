import express from 'express'
const router = express.Router();
import { createProject, getProjects, getProject, getSummary, insertManyProjects } from '../controllers/project.controller.js';

router.route('/').get(getProjects).post(createProject)
router.route('/summary').get(getSummary)
router.route('/:id').get(getProject)
router.route('/insertMany').post(insertManyProjects)

export default router