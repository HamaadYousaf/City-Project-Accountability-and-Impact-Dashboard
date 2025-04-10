import { Report } from '../models/report.model.js'

export const getReports = async (req, res) => {
    try {
        const reports = await Report.find()
        res.status(200).json({ data: reports })
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}

export const approveReport = async (req, res) => {
    try {
        const { reportId } = req.params
        const report = await Report.findByIdAndUpdate(reportId, { approved: true }, { new: true })
        if (!report) {
            return res.status(404).json({ msg: 'Report not found' })
        }
        res.status(200).json({ data: report })
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}

export const getReportsByProjectAdmin = async (req, res) => {
    try {
        const { projectId } = req.params
        const reports = await Report.find({ project: projectId })
        res.status(200).json({ data: reports })
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}
export const getReportsByProject = async (req, res) => {
    try {
        const { projectId } = req.params
        const reports = await Report.find({ project: projectId, approved: true })
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

export const deleteAllReports = async (req, res) => {
    try {
        await Report.deleteMany()
        res.status(200).json({ msg: 'All reports deleted successfully' })
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}

export const deleteUserReports = async (req, res) => {
    try {
        const userId = req.params.userId;
        await Report.deleteMany({ user: userId });
        res.status(200).json({ msg: 'All user reports deleted successfully' });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};
