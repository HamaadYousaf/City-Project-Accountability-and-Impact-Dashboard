import express from 'express'
import { createReport, getReports, getReportsByProject, updateReport, deleteReport } from '../controllers/report.controller.js';
const router = express.Router();

router.route('/').get(getReports).post(createReport)
router.route('/project/:projectId').get(getReportsByProject)
router.route('/:id').put(updateReport).delete(deleteReport)

export default router 