import clsx from "clsx"
import moment from "moment"
import React from "react"
import { FaNewspaper } from "react-icons/fa"
import { FaArrowsToDot } from "react-icons/fa6"
import { LuClipboardEdit } from "react-icons/lu"
import {
    MdAdminPanelSettings,
    MdKeyboardArrowDown,
    MdKeyboardArrowUp,
    MdKeyboardDoubleArrowUp,
    MdOutlineWarningAmber,
} from "react-icons/md"
import { Chart } from "../components/Chart"
import Loading from "../components/Loader"
import UserInfo from "../components/UserInfo"
import { useGetDashboardStatsQuery } from "../redux/slices/api/taskApiSlice"
import { BGS, PRIOTITYSTYELS, TASK_TYPE, getInitials } from "../utils"

const TaskTable = ({ tasks }) => {
    const ICONS = {
        high: <MdKeyboardDoubleArrowUp />,
        medium: <MdKeyboardArrowUp />,
        low: <MdKeyboardArrowDown />,
    }

    const TableHeader = () => (
        <thead className="border-b border-gray-300 ">
            <tr className="text-black dark:text-slate-100 text-left">
                <th className="py-2">Task Title</th>
                <th className="py-2">Priority</th>
                <th className="py-2">Team</th>
                <th className="py-2 hidden md:block">Due Date</th>
            </tr>
        </thead>
    )

    const TableRow = ({ task }) => (
        <tr className="border-b border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-300/10 dark:hover:bg-slate-800/60">
            <td className="py-2">
                <div className="flex items-center gap-2">
                    <div
                        className={clsx(
                            "w-4 h-4 rounded-full",
                            TASK_TYPE[task.stage]
                        )}
                    />

                    <p className="text-base text-black dark:text-white">
                        {task.title}
                    </p>
                </div>
            </td>

            <td className="py-2">
                <div className="flex gap-1 items-center">
                    <span
                        className={clsx(
                            "text-lg",
                            PRIOTITYSTYELS[task.priority]
                        )}
                    >
                        {ICONS[task.priority]}
                    </span>
                    <span className="capitalize">{task.priority}</span>
                </div>
            </td>

            <td className="py-2">
                <div className="flex">
                    {task.team.map((m, index) => (
                        <div
                            key={index}
                            className={clsx(
                                "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                                BGS[index % BGS.length]
                            )}
                        >
                            <UserInfo user={m} />
                        </div>
                    ))}
                </div>
            </td>
            <td className="py-2 hidden md:block">
                <span className="text-base text-gray-600">
                    {task?.date
                        ? moment(task.date).format("DD MMM YYYY")
                        : "No date"}
                </span>
            </td>
        </tr>
    )
    return (
        <>
            <div className="w-full md:w-2/3 bg-white dark:bg-slate-900 px-2 md:px-4 pt-4 pb-4 shadow-md rounded-lg border border-transparent dark:border-slate-800">
                <h3 className="px-1 pb-3 text-lg font-bold text-slate-800 dark:text-white">
                    Recent Tasks
                </h3>
                <table className="w-full">
                    <TableHeader />
                    <tbody>
                        {tasks?.length ? (
                            tasks.map((task, id) => (
                                <TableRow key={id} task={task} />
                            ))
                        ) : (
                            <tr>
                                <td
                                    className="py-6 text-gray-500 dark:text-slate-400"
                                    colSpan={4}
                                >
                                    No recent tasks yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    )
}

const UserTable = ({ users }) => {
    const TableHeader = () => (
        <thead className="border-b border-gray-300 ">
            <tr className="text-black dark:text-slate-100 text-left">
                <th className="py-2">Full Name</th>
                <th className="py-2">Status</th>
                <th className="py-2">Created At</th>
            </tr>
        </thead>
    )

    const TableRow = ({ user }) => (
        <tr className="border-b border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-400/10 dark:hover:bg-slate-800/60">
            <td className="py-2">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm bg-violet-700">
                        <span className="text-center">
                            {getInitials(user?.name)}
                        </span>
                    </div>

                    <div>
                        <p className="text-slate-800 dark:text-white">
                            {user.name}
                        </p>
                        <span className="text-xs text-black dark:text-slate-300">
                            {user?.role}
                        </span>
                    </div>
                </div>
            </td>

            <td>
                <p
                    className={clsx(
                        "w-fit px-3 py-1 rounded-full text-sm",
                        user?.isActive
                            ? "bg-blue-200 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                    )}
                >
                    {user?.isActive ? "Active" : "Disabled"}
                </p>
            </td>
            <td className="py-2 text-sm">
                {moment(user?.createdAt).fromNow()}
            </td>
        </tr>
    )

    return (
        <div className="w-full md:w-1/3 bg-white dark:bg-slate-900 h-fit px-2 md:px-6 py-4 shadow-md rounded-lg border border-transparent dark:border-slate-800">
            <h3 className="pb-3 text-lg font-bold text-slate-800 dark:text-white">
                Active Team
            </h3>
            <table className="w-full mb-5">
                <TableHeader />
                <tbody>
                    {users?.map((user, index) => (
                        <TableRow key={index + user?._id} user={user} />
                    ))}
                </tbody>
            </table>
        </div>
    )
}
const Dashboard = () => {
    const { data, isLoading } = useGetDashboardStatsQuery()

    if (isLoading) {
        return (
            <div className="py-10">
                <Loading />
            </div>
        )
    }

    const totals = data?.tasks || {}
    const completionRate = data?.totalTasks
        ? Math.round(((totals.completed || 0) / data.totalTasks) * 100)
        : 0
    const activeTasks =
        (totals.todo || 0) + (totals["in progress"] || 0)

    const stats = [
        {
            _id: "1",
            label: "TOTAL TASKS",
            total: data?.totalTasks || 0,
            monthTotal: data?.thisMonth?.totalTasks || 0,
            icon: <FaNewspaper />,
            bg: "from-blue-700 to-indigo-600",
        },
        {
            _id: "2",
            label: "COMPLETED",
            total: totals["completed"] || 0,
            monthTotal: data?.thisMonth?.completed || 0,
            icon: <MdAdminPanelSettings />,
            bg: "from-teal-700 to-emerald-500",
        },
        {
            _id: "3",
            label: "IN PROGRESS",
            total: totals["in progress"] || 0,
            monthTotal: data?.thisMonth?.["in progress"] || 0,
            icon: <LuClipboardEdit />,
            bg: "from-amber-500 to-orange-500",
        },
        {
            _id: "4",
            label: "TODOS",
            total: totals["todo"] || 0,
            monthTotal: data?.thisMonth?.todo || 0,
            icon: <FaArrowsToDot />,
            bg: "from-pink-700 to-rose-500",
        },
        {
            _id: "5",
            label: "OVERDUE",
            total: data?.overdueTasks || 0,
            monthTotal: data?.thisMonth?.overdue || 0,
            icon: <MdOutlineWarningAmber />,
            bg: "from-red-700 to-red-500",
        },
    ]

    const Card = ({ label, count, monthTotal, bg, icon }) => {
        return (
            <div className="w-full min-h-32 bg-white dark:bg-slate-900 p-5 shadow-md rounded-xl flex items-center justify-between border border-transparent dark:border-slate-800 relative overflow-hidden">
                <div
                    className={clsx(
                        "absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
                        bg
                    )}
                />
                <div className="h-full flex flex-1 flex-col justify-between">
                    <p className="text-sm font-bold tracking-wide text-gray-500 dark:text-slate-400">
                        {label}
                    </p>
                    <span className="text-3xl font-black text-slate-950 dark:text-white">
                        {count}
                    </span>
                    <span className="text-sm text-gray-400 dark:text-slate-500">
                        {monthTotal} created this month
                    </span>
                </div>

                <div
                    className={clsx(
                        "w-11 h-11 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br shadow-lg",
                        bg
                    )}
                >
                    {icon}
                </div>
            </div>
        )
    }
    return (
        <div className="h-full py-4">
            <section className="mb-6 rounded-2xl bg-gradient-to-r from-slate-950 via-blue-900 to-teal-800 p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute right-8 top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute right-40 bottom-0 h-24 w-24 rounded-full bg-cyan-300/20 blur-xl" />
                <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
                    <div>
                        <p className="text-sm font-bold text-cyan-200">
                            VeyraFlow Command Center
                        </p>
                        <h1 className="text-3xl md:text-4xl font-black mt-2">
                            Workspace health at a glance
                        </h1>
                        <p className="text-white/75 mt-2 max-w-2xl">
                            Track delivery, workload, overdue risk, and team
                            progress from live database activity.
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur">
                            <p className="text-xs text-white/60">Completion</p>
                            <p className="text-2xl font-black">{completionRate}%</p>
                        </div>
                        <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur">
                            <p className="text-xs text-white/60">Active</p>
                            <p className="text-2xl font-black">{activeTasks}</p>
                        </div>
                        <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur">
                            <p className="text-xs text-white/60">Overdue</p>
                            <p className="text-2xl font-black">
                                {data?.overdueTasks || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
                {stats.map(({ icon, bg, label, total, monthTotal }, index) => (
                    <Card
                        key={index}
                        icon={icon}
                        bg={bg}
                        label={label}
                        count={total}
                        monthTotal={monthTotal}
                    />
                ))}
            </div>

            <div className="w-full bg-white dark:bg-slate-900 my-8 p-5 rounded-xl shadow-md border border-transparent dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h4 className="text-xl text-gray-700 dark:text-white font-bold">
                            Priority Distribution
                        </h4>
                        <p className="text-sm text-gray-400 dark:text-slate-500">
                            Real task count grouped by priority.
                        </p>
                    </div>
                </div>
                {data?.graphData?.length ? (
                    <Chart data={data?.graphData} />
                ) : (
                    <div className="h-48 flex items-center justify-center text-gray-500 dark:text-slate-400">
                        No priority data yet.
                    </div>
                )}
            </div>

            <div className="w-full flex flex-col md:flex-row gap-4 2xl:gap-10 py-4">
                {/* /left */}

                <TaskTable tasks={data?.last10Task} />

                {/* /right */}

                <UserTable users={data?.users} />
            </div>
        </div>
    )
}

export default Dashboard
