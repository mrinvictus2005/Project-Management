import clsx from "clsx"
import React from "react"
import { FaChartLine, FaExclamationTriangle, FaProjectDiagram } from "react-icons/fa"
import { MdChecklist, MdGroups, MdTrendingUp } from "react-icons/md"
import Loading from "../components/Loader"
import Title from "../components/Title"
import { useGetTaskInsightsQuery } from "../redux/slices/api/taskApiSlice"
import { dateFormatter } from "../utils"

const Reports = () => {
    const { data, isLoading } = useGetTaskInsightsQuery()

    if (isLoading) {
        return (
            <div className="py-10">
                <Loading />
            </div>
        )
    }

    const summary = data?.summary || {}
    const cards = [
        {
            label: "Completion Rate",
            value: `${summary.completionRate || 0}%`,
            hint: `${summary.completedTasks || 0} of ${summary.totalTasks || 0} tasks completed`,
            icon: <MdTrendingUp />,
            bg: "bg-teal-600",
        },
        {
            label: "Active Work",
            value: summary.activeTasks || 0,
            hint: `${summary.dueSoonTasks || 0} due in the next 7 days`,
            icon: <MdChecklist />,
            bg: "bg-blue-700",
        },
        {
            label: "Delivery Risk",
            value: `${summary.riskScore || 0}/100`,
            hint: `${summary.overdueTasks || 0} overdue tasks`,
            icon: <FaExclamationTriangle />,
            bg: (summary.riskScore || 0) > 60 ? "bg-red-600" : "bg-amber-500",
        },
        {
            label: "Projects",
            value: summary.totalProjects || 0,
            hint: "Tracked in workspace",
            icon: <FaProjectDiagram />,
            bg: "bg-violet-700",
        },
    ]

    const statLine = (label, value, color) => (
        <div className="flex items-center justify-between gap-4 pb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
            <span className={clsx("font-semibold text-lg", color)}>{value || 0}</span>
        </div>
    )

    return (
        <div className="w-full py-4">
            <div className="mb-6">
                <Title title="Reports & Insights" />
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Real-time delivery health, workload, overdue risk, and project progress.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                {cards.map((card) => (
                    <div
                        key={card.label}
                        className="bg-white dark:bg-slate-800 rounded-lg shadow-md dark:shadow-lg dark:shadow-slate-900/50 p-5 flex items-center justify-between border border-gray-100 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-xl transition-all"
                    >
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{card.label}</p>
                            <p className="text-3xl font-bold text-gray-950 dark:text-white mt-2">
                                {card.value}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{card.hint}</p>
                        </div>
                        <div
                            className={clsx(
                                "w-12 h-12 rounded-full flex items-center justify-center text-white text-xl",
                                card.bg
                            )}
                        >
                            {card.icon}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 my-8">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md dark:shadow-lg dark:shadow-slate-900/50 p-5 border border-gray-100 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-xl transition-all">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4">
                        Task Mix
                    </h3>
                    <div className="space-y-3">
                        {statLine("To do", data?.byStage?.todo, "text-blue-700 dark:text-blue-400")}
                        {statLine(
                            "In progress",
                            data?.byStage?.["in progress"],
                            "text-amber-600 dark:text-amber-400"
                        )}
                        {statLine(
                            "Completed",
                            data?.byStage?.completed,
                            "text-teal-700 dark:text-teal-400"
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md dark:shadow-lg dark:shadow-slate-900/50 p-5 border border-gray-100 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-xl transition-all">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4">
                        Priority Mix
                    </h3>
                    <div className="space-y-3">
                        {statLine("High", data?.byPriority?.high, "text-red-600 dark:text-red-400")}
                        {statLine(
                            "Medium",
                            data?.byPriority?.medium,
                            "text-amber-600 dark:text-amber-400"
                        )}
                        {statLine(
                            "Normal",
                            data?.byPriority?.normal,
                            "text-blue-700 dark:text-blue-400"
                        )}
                        {statLine("Low", data?.byPriority?.low, "text-gray-600 dark:text-gray-400")}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md dark:shadow-lg dark:shadow-slate-900/50 p-5 border border-gray-100 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-xl transition-all">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4">
                        Next Actions
                    </h3>
                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <p>
                            {summary.overdueTasks || 0} overdue tasks need review.
                        </p>
                        <p>
                            {summary.dueSoonTasks || 0} tasks are due within 7 days.
                        </p>
                        <p>
                            Keep high-priority work under active progress to reduce
                            delivery risk.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md dark:shadow-lg dark:shadow-slate-900/50 p-5 overflow-x-auto border border-gray-100 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-xl transition-all">
                    <div className="flex items-center gap-2 mb-4">
                        <MdGroups className="text-blue-700 dark:text-blue-400 text-xl" />
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                            Team Workload
                        </h3>
                    </div>
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50">
                            <tr className="text-gray-700 dark:text-gray-300">
                                <th className="py-2 px-2">Member</th>
                                <th className="py-2 px-2">Active</th>
                                <th className="py-2 px-2">Done</th>
                                <th className="py-2 px-2">Overdue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.workload?.map((item) => (
                                <tr key={item._id} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="py-3 px-2">
                                        <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.title}</p>
                                    </td>
                                    <td className="py-3 px-2 text-gray-700 dark:text-gray-300">{item.active}</td>
                                    <td className="py-3 px-2 text-gray-700 dark:text-gray-300">{item.completed}</td>
                                    <td className={clsx("py-3 px-2 font-semibold", item.overdue ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300")}>
                                        {item.overdue}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md dark:shadow-lg dark:shadow-slate-900/50 p-5 overflow-x-auto border border-gray-100 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-xl transition-all">
                    <div className="flex items-center gap-2 mb-4">
                        <FaChartLine className="text-teal-700 dark:text-teal-400 text-xl" />
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                            Project Health
                        </h3>
                    </div>
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50">
                            <tr className="text-gray-700 dark:text-gray-300">
                                <th className="py-2 px-2">Project</th>
                                <th className="py-2 px-2">Progress</th>
                                <th className="py-2 px-2">Overdue</th>
                                <th className="py-2 px-2">Due</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.projectHealth?.map((item) => (
                                <tr key={item._id} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="py-3 px-2">
                                        <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{item.status}</p>
                                    </td>
                                    <td className="py-3 px-2 text-gray-700 dark:text-gray-300">{item.completionRate}%</td>
                                    <td className={clsx("py-3 px-2 font-semibold", item.overdueTasks ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300")}>
                                        {item.overdueTasks}
                                    </td>
                                    <td className="py-3 px-2 text-gray-700 dark:text-gray-300">
                                        {item.dueDate ? dateFormatter(item.dueDate) : "No date"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Reports
