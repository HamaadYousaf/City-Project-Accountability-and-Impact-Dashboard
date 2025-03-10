import express from 'express'
import { createReport, getReports, getReportsByProject, updateReport, deleteReport, getReportsByProjectAdmin, approveReport, deleteAllReports } from '../controllers/report.controller.js';
const router = express.Router();

router.route('/').get(getReports).post(createReport).delete(deleteAllReports)
router.route('/project/:projectId').get(getReportsByProject)
router.route('/project/admin/:projectId').get(getReportsByProjectAdmin)
router.route('/project/admin/approve/:reportId').post(approveReport)
router.route('/:id').put(updateReport).delete(deleteReport)

export default router