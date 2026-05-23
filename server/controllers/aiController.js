import Project from "../models/project.js"
import Task from "../models/task.js"

const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash"

const compactTask = (task) => ({
    title: task.title,
    stage: task.stage,
    priority: task.priority,
    dueDate: task.date ? task.date.toISOString().slice(0, 10) : "none",
    project: task.project?.name || "none",
    team: task.team?.map((member) => member.name).join(", ") || "none",
})

const compactProject = (project) => ({
    name: project.name,
    status: project.status,
    dueDate: project.dueDate ? project.dueDate.toISOString().slice(0, 10) : "none",
    teamSize: project.team?.length || 0,
})

const buildContext = async ({ userId, isAdmin }) => {
    const today = new Date()
    const taskQuery = isAdmin
        ? { isTrashed: false }
        : { isTrashed: false, team: { $all: [userId] } }
    const projectQuery = isAdmin ? {} : { team: { $all: [userId] } }

    const tasks = await Task.find(taskQuery)
        .populate({ path: "team", select: "name role title" })
        .populate({ path: "project", select: "name status dueDate" })
        .sort({ date: 1 })
        .limit(25)

    const projects = await Project.find(projectQuery)
        .populate({ path: "team", select: "name" })
        .sort({ dueDate: 1 })
        .limit(12)

    const overdue = tasks.filter(
        (task) => task.stage !== "completed" && task.date && task.date < today
    )
    const dueSoon = tasks.filter((task) => {
        if (!task.date || task.stage === "completed") return false
        const days = (task.date - today) / (1000 * 60 * 60 * 24)
        return days >= 0 && days <= 7
    })

    return {
        role: isAdmin ? "Admin" : "Member",
        permissions: isAdmin
            ? "Can manage users, projects, tasks, trash, assignments, and dashboard."
            : "Can view assigned projects/tasks and update assigned task activity/status only.",
        summary: {
            totalTasks: tasks.length,
            overdueTasks: overdue.length,
            dueSoonTasks: dueSoon.length,
            totalProjects: projects.length,
        },
        overdue: overdue.slice(0, 6).map(compactTask),
        dueSoon: dueSoon.slice(0, 6).map(compactTask),
        projects: projects.slice(0, 8).map(compactProject),
        tasks: tasks.slice(0, 10).map(compactTask),
    }
}

const extractGeminiText = (data) =>
    data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim()

export const chatWithAssistant = async (req, res) => {
    try {
        const { message, history = [] } = req.body

        if (!message?.trim()) {
            return res.status(400).json({
                status: false,
                message: "Ask the assistant a question first.",
            })
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(400).json({
                status: false,
                message:
                    "Gemini API key is missing. Add GEMINI_API_KEY in server/.env and restart the backend.",
            })
        }

        const context = await buildContext(req.user)
        const safeHistory = history
            .slice(-6)
            .map((item) => `${item.role}: ${String(item.text).slice(0, 400)}`)
            .join("\n")

        const prompt = `
You are VeyraFlow AI, a concise project and task assistant.
Help the logged-in user finish work before deadlines.
Use only the provided workspace context. If data is missing, say what to check in the app.
Keep answers short, practical, and action-oriented. Prefer bullets. Do not invent tasks, users, or projects.

User role and permissions:
${JSON.stringify({ role: context.role, permissions: context.permissions })}

Workspace context:
${JSON.stringify(context)}

Recent chat:
${safeHistory || "none"}

User question:
${message.trim()}
`

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": process.env.GEMINI_API_KEY,
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: prompt }],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 350,
                    },
                }),
            }
        )

        const data = await response.json()

        if (!response.ok) {
            return res.status(502).json({
                status: false,
                message:
                    data?.error?.message ||
                    "Gemini could not answer right now. Check your API key or quota.",
            })
        }

        res.status(200).json({
            status: true,
            answer:
                extractGeminiText(data) ||
                "I could not generate an answer. Try asking in a simpler way.",
            contextSummary: context.summary,
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: error.message })
    }
}
