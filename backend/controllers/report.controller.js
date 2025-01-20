import { Report } from '../models/report.model.js'

export const getReports = async (req, res) => {
    try {
        const reports = await Report.find()
        res.status(200).json({ data: reports })
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}

export const createReport = async (req, res) => {
    try {
        const report = await Report.create(req.body)
        res.status(200).json({ data: report })
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}