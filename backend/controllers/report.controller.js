import { Report } from '../models/report.model.js'

export const getReports = async (req, res) => {
    try {
        const reports = await Report.find()
        res.status(200).json({ data: reports })
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}

export const getReportsByProject = async (req, res) => {
    try {
        const { projectId } = req.params
        const reports = await Report.find({ projectId })
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


export const updateReport = async (req, res) => {
    try {
        const { id } = req.params
        const report = await Report.findByIdAndUpdate(id, req.body, { new: true })
        if (!report) {
            return res.status(404).json({ msg: 'Report not found' })
        }
        res.status(200).json({ data: report })
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}

export const deleteReport = async (req, res) => {
    try {
        const { id } = req.params
        const report = await Report.findByIdAndDelete(id)
        if (!report) {
            return res.status(404).json({ msg: 'Report not found' })
        }
        res.status(200).json({ msg: 'Report deleted successfully' })
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}