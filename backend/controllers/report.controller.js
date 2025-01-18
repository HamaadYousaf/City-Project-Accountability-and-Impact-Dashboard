import { Report } from '../models/report.model.js'

export const getReports = async (req, res) => {
    try {
        const report = await Report.find()
        res.status(200).json(report)
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}

export const createReport = async (req, res) => {
    try {
        const report = await Report.create(req.body)
        res.status(200).json(report)
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}