import { Project } from "../models/project.model.js";

// Get all projects
export const getProjects = async (req, res) => {
    try {
        const { status, category } = req.query; // Get query parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;


        let filter = {};

        // Add filtering conditions if query params exist
        if (status) {
            filter.status = { $regex: new RegExp(`^${status}$`, 'i') };
        }
        if (category) {
            filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
        }

        const projects = await Project.find(filter)
            .skip(skip)
            .limit(limit)
            .exec();

        res.status(200).json({ data: projects });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

// Get project by id
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

// Create project
export const createProject = async (req, res) => {
    try {
        const project = await Project.create(req.body)
        res.status(200).json(project)
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}

// Insert many projects
export const insertManyProjects = async (req, res) => {
    try {
        let projects = []
        const projectsInDB = await Project.find({}, { project_name: 1, _id: 0 })
        let projectNames = []

        for (const project of projectsInDB) {
            projectNames.push(project.project_name)
        }

        for (const project of req.body) {
            if (projectNames.includes(project.project_name)) {
                continue
            }

            let status = "Planning Started"

            if (project.status == "Planning") {
                status = "Planning Started"
            }
            else if (project.status == "Under construction") {
                status = "Construction Started"
            }
            else if (project.status == "Complete") {
                status = "Completed"
            }
            else {
                status = project.status
            }

            projects.push({
                project_name: project.project_name,
                description: project.description,
                location: project.location,
                original_completion_date: project.original_completion_date,
                current_completion_date: project.current_completion_date,
                planning_start_date: project.planning_start_date,
                planning_complete_date: project.planning_complete_date,
                construction_start_date: project.construction_start_date,
                status: status,
                original_budget: project.original_budget,
                current_budget: project.current_budget,
                category: project.category,
                result: project.result,
                area: project.area,
                region: project.region,
                address: project.address,
                postal_code: project.postal_code,
                municipal_funding: project.municipal_funding,
                provincial_funding: project.provincial_funding,
                federal_funding: project.federal_funding,
                other_funding: project.other_funding,
                performance_metric: project.performance_metric,
                efficiency: project.efficiency,
                website: project.website
            })
        }

        if (projects.length != 0) {
            await Project.insertMany(projects)
        }

        res.status(200).json("Projects inserted successfully")
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}

// Get summary of projects
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

// Delete all projects
export const deleteAll = async (req, res) => {
    try {
        await Project.deleteMany()
        res.status(200).json("All projects deleted successfully")
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}