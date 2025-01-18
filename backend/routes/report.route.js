import express from 'express'
import { createReport, getReports } from '../controllers/report.controller.js';
const router = express.Router();

router.route('/').get(getReports).post(createReport)

export default router