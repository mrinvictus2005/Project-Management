import mongoose from "mongoose"
import Project from "../models/project.js"
import Task from "../models/task.js"

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id)

const validateProject = ({ name, team = [], dueDate }) => {
    if (!name?.trim()) return "Project name is required."
    if (!Array.isArray(team)) return "Team must be an array of user ids."
    if (team.some((id) => !isObjectId(id))) return "Team contains an invalid user id."
    if (dueDate && Number.isNaN(new Date(dueDate).getTime())) return "Due date is invalid."
    return null
}

export const createProject = async (req, res) => {
    try {
        const message = validateProject(req.body)
        if (message) return res.status(400).json({ status: false, message })

        const project = await Project.create({
            name: req.body.name.trim(),
            description: req.body.description?.trim() || "",
            status: req.body.status?.toLowerCase() || "active",
            dueDate: req.body.dueDate || undefined,
            team: req.body.team || [],
            createdBy: req.user.userId,
        })

        res.status(201).json({
            status: true,
            project,
            message: "Project created successfully.",
        })
    } catch (error) {
        return res.status(400).json({ status: false, message: error.message })
    }
}

export const getProjects = async (req, res) => {
    try {
        const { userId, isAdmin } = req.user
        const query = isAdmin ? {} : { team: { $all: [userId] } }

        const projects = await Project.find(query)
            .populate({ path: "team", select: "name title email" })
            .populate({ path: "createdBy", select: "name email" })
            .sort({ _id: -1 })

        res.status(200).json({ status: true, projects })
    } catch (error) {
        return res.status(400).json({ status: false, message: error.message })
    }
}

export const updateProject = async (req, res) => {
    try {
        const message = validateProject(req.body)
        if (message) return res.status(400).json({ status: false, message })

        const project = await Project.findById(req.params.id)
        if (!project) {
            return res.status(404).json({ status: false, message: "Project not found." })
        }

        project.name = req.body.name.trim()
        project.description = req.body.description?.trim() || ""
        project.status = req.body.status?.toLowerCase() || project.status
        project.dueDate = req.body.dueDate || undefined
        project.team = req.body.team || []

        await project.save()

        res.status(200).json({
            status: true,
            project,
            message: "Project updated successfully.",
        })
    } catch (error) {
        return res.status(400).json({ status: false, message: error.message })
    }
}

export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
        if (!project) {
            return res.status(404).json({ status: false, message: "Project not found." })
        }

        await Task.updateMany({ project: project._id }, { $unset: { project: "" } })
        await Project.findByIdAndDelete(project._id)

        res.status(200).json({
            status: true,
            message: "Project deleted successfully.",
        })
    } catch (error) {
        return res.status(400).json({ status: false, message: error.message })
    }
}
