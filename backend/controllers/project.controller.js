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
            res.status(200).json({ data: project });
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
        for (const p of projects) {
            performance += p.performance_metric
            original_budget += p.original_budget
            current_budget += p.current_budget
        }

        performance /= projects.length

        res.status(200).json({
            performance: performance,
            original_budget: original_budget,
            current_budget: current_budget,
            budget_change: (current_budget - original_budget)
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}