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