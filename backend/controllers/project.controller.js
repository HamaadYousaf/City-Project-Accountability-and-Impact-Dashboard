import { Project } from "../models/project.model.js";

export const getProjects = async (req, res) => {
    try {
        const projects = await Project.find();
        res.status(200).json({ data: projects });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const getProject = async (req, res) => {
    try {
        let id = req.params.id
        const project = await Project.findById(id)

        if (project == null) {
            res.status(404).json({ msg: `project with id ${id} not found` });
        }
        else {
            const yearDiff = project.current_completion_date.getFullYear() - project.original_completion_date.getFullYear();
            const monthDiff = project.current_completion_date.getMonth() - project.original_completion_date.getMonth();
            const delay = yearDiff * 12 + monthDiff;

            const projectObject = project.toObject();
            projectObject.delay = delay;
            projectObject.budget_change = project.current_budget - project.original_budget

            res.status(200).json({ data: projectObject });
        }
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const createProject = async (req, res) => {
    try {
        const project = await Project.create(req.body)
        res.status(200).json(project)
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}

export const getSummary = async (req, res) => {
    try {
        const projects = await Project.find();
        let performance = 0
        let original_budget = 0
        let current_budget = 0
        let delays = 0

        for (const p of projects) {
            performance += p.performance_metric
            original_budget += p.original_budget
            current_budget += p.current_budget

            const yearDiff = p.current_completion_date.getFullYear() - p.original_completion_date.getFullYear();
            const monthDiff = p.current_completion_date.getMonth() - p.original_completion_date.getMonth();
            const totalMonths = yearDiff * 12 + monthDiff;
            delays += totalMonths
        }

        performance /= projects.length
        delays /= projects.length
        let budget_change = (current_budget - original_budget) / original_budget

        const result = await Project.aggregate([
            // Group by efficiency and count occurrences
            {
                $group: {
                    _id: "$efficiency",
                    count: { $sum: 1 }
                }
            },
            // Sort by count in descending order
            {
                $sort: {
                    count: -1
                }
            },
            // Get only the first (most frequent) result
            {
                $limit: 1
            }
        ]);

        res.status(200).json({
            performance: performance,
            original_budget: original_budget,
            current_budget: current_budget,
            budget_change: budget_change,
            delays: delays,
            efficiency: result[0]._id
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}