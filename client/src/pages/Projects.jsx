import React, { useState } from "react"
import { IoMdAdd } from "react-icons/io"
import { toast } from "sonner"
import clsx from "clsx"
import Button from "../components/Button"
import Loading from "../components/Loader"
import Textbox from "../components/Textbox"
import Title from "../components/Title"
import {
    useCreateProjectMutation,
    useDeleteProjectMutation,
    useGetProjectsQuery,
    useUpdateProjectMutation,
} from "../redux/slices/api/projectApiSlice"
import { useGetTeamListQuery } from "../redux/slices/api/userApiSlice"
import { dateFormatter } from "../utils"
import { useSelector } from "react-redux"

const emptyProject = {
    name: "",
    description: "",
    dueDate: "",
    status: "active",
    team: [],
}

const Projects = () => {
    const { user } = useSelector((state) => state.auth)
    const [form, setForm] = useState(emptyProject)
    const [editing, setEditing] = useState(null)
    const { data, isLoading, refetch } = useGetProjectsQuery()
    const { data: team = [] } = useGetTeamListQuery(undefined, {
        skip: !user?.isAdmin,
    })
    const [createProject, { isLoading: isCreating }] = useCreateProjectMutation()
    const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation()
    const [deleteProject] = useDeleteProjectMutation()

    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    const toggleMember = (id) => {
        setForm((prev) => ({
            ...prev,
            team: prev.team.includes(id)
                ? prev.team.filter((memberId) => memberId !== id)
                : [...prev.team, id],
        }))
    }

    const resetForm = () => {
        setForm(emptyProject)
        setEditing(null)
    }

    const submitHandler = async (e) => {
        e.preventDefault()

        try {
            const payload = {
                ...form,
                name: form.name.trim(),
                description: form.description.trim(),
                dueDate: form.dueDate || undefined,
            }

            const result = editing
                ? await updateProject({ ...payload, _id: editing }).unwrap()
                : await createProject(payload).unwrap()

            toast.success(result.message)
            resetForm()
            refetch()
        } catch (err) {
            toast.error(err?.data?.message || err.message)
        }
    }

    const editProject = (project) => {
        setEditing(project._id)
        setForm({
            name: project.name,
            description: project.description || "",
            status: project.status,
            dueDate: project.dueDate ? dateFormatter(project.dueDate) : "",
            team: project.team?.map((member) => member._id) || [],
        })
    }

    const removeProject = async (id) => {
        try {
            const result = await deleteProject(id).unwrap()
            toast.success(result.message)
            refetch()
        } catch (err) {
            toast.error(err?.data?.message || err.message)
        }
    }

    if (isLoading) {
        return (
            <div className="py-10">
                <Loading />
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-6">
                <Title title="Projects" />
            </div>

            {user?.isAdmin && (
                <form
                    onSubmit={submitHandler}
                    className="bg-white dark:bg-slate-800 px-4 py-5 shadow-md dark:shadow-lg dark:shadow-slate-900/50 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-100 dark:border-slate-700"
                >
                    <Textbox
                        label="Project Name"
                        name="name"
                        type="text"
                        placeholder="Website redesign"
                        className="w-full rounded"
                        register={{
                            value: form.name,
                            onChange: (e) => updateField("name", e.target.value),
                        }}
                    />

                    <div className="w-full">
                        <label className="text-slate-800 dark:text-gray-300 text-sm font-medium">Status</label>
                        <select
                            className="w-full bg-white dark:bg-slate-700 px-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                            value={form.status}
                            onChange={(e) => updateField("status", e.target.value)}
                        >
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>

                    <Textbox
                        label="Due Date"
                        name="dueDate"
                        type="date"
                        className="w-full rounded"
                        register={{
                            value: form.dueDate,
                            onChange: (e) => updateField("dueDate", e.target.value),
                        }}
                    />

                    <Textbox
                        label="Description"
                        name="description"
                        type="text"
                        placeholder="Short project goal"
                        className="w-full rounded"
                        register={{
                            value: form.description,
                            onChange: (e) => updateField("description", e.target.value),
                        }}
                    />

                    <div className="md:col-span-2">
                        <p className="text-slate-800 dark:text-gray-300 mb-3 text-sm font-medium">Team Members</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {team?.map((member) => (
                                <label
                                    key={member._id}
                                    className="flex items-center gap-2 border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        className="rounded accent-blue-600 dark:accent-blue-400"
                                        checked={form.team.includes(member._id)}
                                        onChange={() => toggleMember(member._id)}
                                    />
                                    <span className="text-gray-700 dark:text-gray-300 text-sm">{member.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3">
                        {editing && (
                            <Button
                                label="Cancel"
                                className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                                onClick={resetForm}
                            />
                        )}
                        <Button
                            type="submit"
                            label={editing ? "Update Project" : "Create Project"}
                            icon={<IoMdAdd className="text-lg" />}
                            className="flex flex-row-reverse gap-1 items-center bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-md transition-colors"
                        />
                    </div>
                </form>
            )}

            <div className="bg-white dark:bg-slate-800 px-2 md:px-4 py-4 shadow-md dark:shadow-lg dark:shadow-slate-900/50 rounded-lg overflow-x-auto border border-gray-100 dark:border-slate-700">
                <table className="w-full mb-5">
                    <thead className="border-b border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50">
                        <tr className="text-gray-900 dark:text-gray-100 text-left font-semibold">
                            <th className="py-2 px-2">Project</th>
                            <th className="py-2 px-2">Status</th>
                            <th className="py-2 px-2">Due Date</th>
                            <th className="py-2 px-2">Team</th>
                            {user?.isAdmin && <th className="py-2 px-2"></th>}
                        </tr>
                    </thead>
                    <tbody>
                        {data?.projects?.map((project) => (
                            <tr
                                key={project._id}
                                className="border-b border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                                <td className="p-2">
                                    <p className="text-gray-900 dark:text-white font-medium">{project.name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{project.description}</p>
                                </td>
                                <td className="p-2 capitalize text-sm">{project.status}</td>
                                <td className="p-2 text-sm">
                                    {project.dueDate ? dateFormatter(project.dueDate) : "No due date"}
                                </td>
                                <td className="p-2 text-sm">
                                    {project.team?.map((member) => member.name).join(", ") || "No team"}
                                </td>
                                {user?.isAdmin && (
                                    <td className="p-2 flex gap-4 justify-end">
                                        <Button
                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-semibold sm:px-0 transition-colors"
                                            label="Edit"
                                            onClick={() => editProject(project)}
                                        />
                                        <Button
                                            className="text-red-700 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 font-semibold sm:px-0 transition-colors"
                                            label="Delete"
                                            onClick={() => removeProject(project._id)}
                                        />
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {data?.projects?.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 py-4">No projects created yet.</p>
                )}
            </div>
        </div>
    )
}

export default Projects
