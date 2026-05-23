import Notice from "../models/notification.js"
import Project from "../models/project.js"
import Task from "../models/task.js"
import User from "../models/user.js"
import mongoose from "mongoose"

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id)

const validateTaskPayload = ({ title, team, stage, date, priority, project }) => {
    if (!title?.trim()) return "Task title is required."
    if (!Array.isArray(team) || team.length === 0) return "Assign at least one team member."
    if (team.some((id) => !isObjectId(id))) return "Team contains an invalid user id."
    if (project && !isObjectId(project)) return "Project id is invalid."
    if (date && Number.isNaN(new Date(date).getTime())) return "Task date is invalid."
    if (stage && !["todo", "in progress", "completed"].includes(stage.toLowerCase())) {
        return "Task stage is invalid."
    }
    if (priority && !["high", "medium", "normal", "low"].includes(priority.toLowerCase())) {
        return "Task priority is invalid."
    }
    return null
}

const canAccessTask = (task, userId, isAdmin) => {
    if (isAdmin) return true
    return task?.team?.some((memberId) => memberId.toString() === userId)
}

export const createTask = async (req, res) => {
    try {
        const { userId } = req.user

        const { title, team, stage, date, priority, assets, project } = req.body
        const message = validateTaskPayload(req.body)
        if (message) return res.status(400).json({ status: false, message })

        if (project) {
            const projectExists = await Project.exists({ _id: project })
            if (!projectExists) {
                return res.status(404).json({ status: false, message: "Project not found." })
            }
        }

        let text = "New task has been assigned to you"
        if (team?.length > 1) {
            text = text + ` and ${team?.length - 1} others.`
        }

        text =
            text +
            ` The task priority is set a ${priority} priority, so check and act accordingly. The task date is ${new Date(
                date
            ).toDateString()}. Thank you!!!`

        const activity = {
            type: "assigned",
            activity: text,
            by: userId,
        }

        const task = await Task.create({
            title: title.trim(),
            team,
            stage: stage.toLowerCase(),
            date,
            priority: priority.toLowerCase(),
            project: project || undefined,
            assets,
            activities: activity,
        })

        await Notice.create({
            team,
            text,
            task: task._id,
        })

        res.status(200).json({
            status: true,
            task,
            message: "Task created successfully.",
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ status: false, message: error.message })
    }
}

export const duplicateTask = async (req, res) => {
    try {
        const { id } = req.params

        const task = await Task.findById(id)

        const newTask = await Task.create({
            ...task,
            title: task.title + " - Duplicate",
        })

        newTask.team = task.team
        newTask.subTasks = task.subTasks
        newTask.assets = task.assets
        newTask.priority = task.priority
        newTask.stage = task.stage
        newTask.project = task.project

        await newTask.save()

        //alert users of the task
        let text = "New task has been assigned to you"
        if (task.team.length > 1) {
            text = text + ` and ${task.team.length - 1} others.`
        }

        text =
            text +
            ` The task priority is set a ${
                task.priority
            } priority, so check and act accordingly. The task date is ${task.date.toDateString()}. Thank you!!!`

        await Notice.create({
            team: task.team,
            text,
            task: newTask._id,
        })

        res.status(200).json({
            status: true,
            message: "Task duplicated successfully.",
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ status: false, message: error.message })
    }
}

export const postTaskActivity = async (req, res) => {
    try {
        const { id } = req.params
        const { userId, isAdmin } = req.user
        const { type, activity } = req.body
        const normalizedType = type?.toLowerCase()
        const allowedTypes = [
            "assigned",
            "started",
            "in progress",
            "bug",
            "completed",
            "commented",
        ]

        const task = await Task.findById(id)
        if (!task) {
            return res.status(404).json({ status: false, message: "Task not found." })
        }

        if (!canAccessTask(task, userId, isAdmin)) {
            return res.status(403).json({
                status: false,
                message: "You can only update activities for tasks assigned to you.",
            })
        }

        if (!activity?.trim()) {
            return res.status(400).json({ status: false, message: "Activity message is required." })
        }

        if (!allowedTypes.includes(normalizedType)) {
            return res.status(400).json({ status: false, message: "Activity type is invalid." })
        }

        if (!isAdmin && normalizedType === "assigned") {
            return res.status(403).json({
                status: false,
                message: "Only admins can mark a task as assigned.",
            })
        }

        const data = {
            type: normalizedType,
            activity: activity.trim(),
            by: userId,
        }

        task.activities.push(data)

        if (["started", "in progress"].includes(normalizedType)) {
            task.stage = "in progress"
        }

        if (normalizedType === "completed") {
            task.stage = "completed"
        }

        await task.save()

        res.status(200).json({
            status: true,
            message: "Activity posted successfully.",
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ status: false, message: error.message })
    }
}

export const dashboardStatistics = async (req, res) => {
    try {
        const { userId, isAdmin } = req.user
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const allTasks = isAdmin
            ? await Task.find({
                  isTrashed: false,
              })
                  .populate({
                      path: "team",
                      select: "name role title email",
                  })
                  .populate({
                      path: "project",
                      select: "name status dueDate",
                  })
                  .sort({ _id: -1 })
            : await Task.find({
                  isTrashed: false,
                  team: { $all: [userId] },
              })
                  .populate({
                      path: "team",
                      select: "name role title email",
                  })
                  .populate({
                      path: "project",
                      select: "name status dueDate",
                  })
                  .sort({ _id: -1 })

        const users = await User.find({ isActive: true })
            .select("name title role isAdmin isActive createdAt")
            .limit(10)
            .sort({ _id: -1 })

        //   group task by stage and calculate counts
        const groupTaskks = allTasks.reduce((result, task) => {
            const stage = task.stage

            if (!result[stage]) {
                result[stage] = 1
            } else {
                result[stage] += 1
            }

            return result
        }, {})

        // Group tasks by priority
        const groupData = Object.entries(
            allTasks.reduce((result, task) => {
                const { priority } = task

                result[priority] = (result[priority] || 0) + 1
                return result
            }, {})
        ).map(([name, total]) => ({ name, total }))

        // calculate total tasks
        const totalTasks = allTasks?.length
        const last10Task = allTasks?.slice(0, 10)
        const now = new Date()
        const overdueTasks = allTasks.filter(
            (task) => task.stage !== "completed" && task.date && task.date < now
        )
        const thisMonthTasks = allTasks.filter(
            (task) => task.createdAt >= startOfMonth
        )
        const thisMonthByStage = thisMonthTasks.reduce((result, task) => {
            result[task.stage] = (result[task.stage] || 0) + 1
            return result
        }, {})
        const thisMonthOverdue = thisMonthTasks.filter(
            (task) => task.stage !== "completed" && task.date && task.date < now
        ).length

        const summary = {
            totalTasks,
            overdueTasks: overdueTasks.length,
            thisMonth: {
                totalTasks: thisMonthTasks.length,
                completed: thisMonthByStage.completed || 0,
                "in progress": thisMonthByStage["in progress"] || 0,
                todo: thisMonthByStage.todo || 0,
                overdue: thisMonthOverdue,
            },
            last10Task,
            users: isAdmin ? users : [],
            tasks: groupTaskks,
            graphData: groupData,
        }

        res.status(200).json({
            status: true,
            message: "Successfully",
            ...summary,
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ status: false, message: error.message })
    }
}

export const getTasks = async (req, res) => {
    try {
        const { userId, isAdmin } = req.user
        const { stage, isTrashed, search } = req.query

        let query = { isTrashed: isTrashed ? true : false }

        if (stage) {
            query.stage = stage
        }

        if (search?.trim()) {
            query.$or = [
                { title: { $regex: search.trim(), $options: "i" } },
                { priority: { $regex: search.trim(), $options: "i" } },
                { stage: { $regex: search.trim(), $options: "i" } },
            ]
        }

        if (!isAdmin) {
            query.team = { $all: [userId] }
        }

        let queryResult = Task.find(query)
            .populate({
                path: "team",
                select: "name title email",
            })
            .populate({
                path: "project",
                select: "name status dueDate",
            })
            .sort({ _id: -1 })

        const tasks = await queryResult

        res.status(200).json({
            status: true,
            tasks,
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ status: false, message: error.message })
    }
}

export const taskInsights = async (req, res) => {
    try {
        const { userId, isAdmin } = req.user
        const now = new Date()
        const nextWeek = new Date(now)
        nextWeek.setDate(now.getDate() + 7)

        const taskQuery = isAdmin
            ? { isTrashed: false }
            : { isTrashed: false, team: { $all: [userId] } }
        const projectQuery = isAdmin ? {} : { team: { $all: [userId] } }

        const [tasks, projects, users] = await Promise.all([
            Task.find(taskQuery)
                .populate({ path: "team", select: "name title role email" })
                .populate({ path: "project", select: "name status dueDate" })
                .sort({ date: 1 }),
            Project.find(projectQuery).populate({ path: "team", select: "name" }),
            isAdmin
                ? User.find({ isActive: true }).select("name title role email")
                : User.find({ _id: userId }).select("name title role email"),
        ])

        const completed = tasks.filter((task) => task.stage === "completed")
        const overdue = tasks.filter(
            (task) => task.stage !== "completed" && task.date && task.date < now
        )
        const dueSoon = tasks.filter(
            (task) =>
                task.stage !== "completed" &&
                task.date &&
                task.date >= now &&
                task.date <= nextWeek
        )

        const byStage = tasks.reduce((result, task) => {
            result[task.stage] = (result[task.stage] || 0) + 1
            return result
        }, {})

        const byPriority = tasks.reduce((result, task) => {
            result[task.priority] = (result[task.priority] || 0) + 1
            return result
        }, {})

        const workload = users.map((user) => {
            const assigned = tasks.filter((task) =>
                task.team?.some((member) => member._id.toString() === user._id.toString())
            )
            const active = assigned.filter((task) => task.stage !== "completed")
            const userOverdue = active.filter((task) => task.date && task.date < now)

            return {
                _id: user._id,
                name: user.name,
                title: user.title,
                role: user.role,
                total: assigned.length,
                active: active.length,
                completed: assigned.length - active.length,
                overdue: userOverdue.length,
            }
        })

        const projectHealth = projects.map((project) => {
            const projectTasks = tasks.filter(
                (task) => task.project?._id?.toString() === project._id.toString()
            )
            const projectCompleted = projectTasks.filter(
                (task) => task.stage === "completed"
            ).length
            const projectOverdue = projectTasks.filter(
                (task) => task.stage !== "completed" && task.date && task.date < now
            ).length

            return {
                _id: project._id,
                name: project.name,
                status: project.status,
                dueDate: project.dueDate,
                totalTasks: projectTasks.length,
                completedTasks: projectCompleted,
                overdueTasks: projectOverdue,
                completionRate: projectTasks.length
                    ? Math.round((projectCompleted / projectTasks.length) * 100)
                    : 0,
            }
        })

        const riskScore = Math.min(
            100,
            overdue.length * 20 + dueSoon.length * 8 + (byStage.todo || 0) * 3
        )

        res.status(200).json({
            status: true,
            summary: {
                totalTasks: tasks.length,
                completedTasks: completed.length,
                activeTasks: tasks.length - completed.length,
                overdueTasks: overdue.length,
                dueSoonTasks: dueSoon.length,
                totalProjects: projects.length,
                completionRate: tasks.length
                    ? Math.round((completed.length / tasks.length) * 100)
                    : 0,
                riskScore,
            },
            byStage,
            byPriority,
            workload,
            projectHealth,
            overdueTasks: overdue.slice(0, 10),
            dueSoonTasks: dueSoon.slice(0, 10),
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ status: false, message: error.message })
    }
}

export const getTask = async (req, res) => {
    try {
        const { userId, isAdmin } = req.user
        const { id } = req.params

        const task = await Task.findById(id)
            .populate({
                path: "project",
                select: "name status dueDate",
            })
            .populate({
                path: "team",
                select: "name title role email",
            })
            .populate({
                path: "activities.by",
                select: "name",
            })

        if (!task) {
            return res.status(404).json({ status: false, message: "Task not found." })
        }

        if (!canAccessTask(task, userId, isAdmin)) {
            return res.status(403).json({
                status: false,
                message: "You can only view tasks assigned to you.",
            })
        }

        res.status(200).json({
            status: true,
            task,
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ status: false, message: error.message })
    }
}

export const createSubTask = async (req, res) => {
    try {
        const { title, tag, date } = req.body

        const { id } = req.params

        const newSubTask = {
            title,
            date,
            tag,
        }

        const task = await Task.findById(id)

        task.subTasks.push(newSubTask)

        await task.save()

        res.status(200).json({
            status: true,
            message: "SubTask added successfully.",
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ status: false, message: error.message })
    }
}

export const updateTask = async (req, res) => {
    try {
        const { id } = req.params
        const { title, date, team, stage, priority, assets, project } = req.body
        const message = validateTaskPayload(req.body)
        if (message) return res.status(400).json({ status: false, message })

        if (project) {
            const projectExists = await Project.exists({ _id: project })
            if (!projectExists) {
                return res.status(404).json({ status: false, message: "Project not found." })
            }
        }

        const task = await Task.findById(id)

        task.title = title.trim()
        task.date = date
        task.priority = priority.toLowerCase()
        task.assets = assets
        task.stage = stage.toLowerCase()
        task.team = team
        task.project = project || undefined

        await task.save()

        res.status(200).json({
            status: true,
            message: "Task updated successfully.",
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ status: false, message: error.message })
    }
}

export const trashTask = async (req, res) => {
    try {
        const { id } = req.params

        const task = await Task.findById(id)

        task.isTrashed = true

        await task.save()

        res.status(200).json({
            status: true,
            message: `Task trashed successfully.`,
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ status: false, message: error.message })
    }
}

export const deleteRestoreTask = async (req, res) => {
    try {
        const { id } = req.params
        const { actionType } = req.query

        if (actionType === "delete") {
            await Task.findByIdAndDelete(id)
        } else if (actionType === "deleteAll") {
            await Task.deleteMany({ isTrashed: true })
        } else if (actionType === "restore") {
            const resp = await Task.findById(id)

            resp.isTrashed = false
            resp.save()
        } else if (actionType === "restoreAll") {
            await Task.updateMany(
                { isTrashed: true },
                { $set: { isTrashed: false } }
            )
        }

        res.status(200).json({
            status: true,
            message: `Operation performed successfully.`,
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ status: false, message: error.message })
    }
}
