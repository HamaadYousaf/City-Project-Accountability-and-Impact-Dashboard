import express from 'express'
const router = express.Router();
import { createProject, getProjects, getProject, getSummary, insertManyProjects, deleteAll } from '../controllers/project.controller.js';

router.route('/').get(getProjects).post(createProject)
router.route('/summary').get(getSummary)
router.route('/:id').get(getProject)
router.route('/insertMany').post(insertManyProjects)
router.route('/deleteAll').delete(deleteAll)

export default router