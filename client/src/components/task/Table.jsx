import React, { useState } from "react"
import { BiMessageAltDetail } from "react-icons/bi"
import {
    MdAttachFile,
    MdKeyboardArrowDown,
    MdKeyboardArrowUp,
    MdKeyboardDoubleArrowUp,
} from "react-icons/md"
import { toast } from "sonner"
import { BGS, PRIOTITYSTYELS, TASK_TYPE, formatDate } from "../../utils"
import clsx from "clsx"
import { FaList, FaWindowRestore } from "react-icons/fa"
import UserInfo from "../UserInfo"
import Button from "../Button"
import ConfirmatioDialog from "../Dialogs"
import { useTrashTaskMutation } from "../../redux/slices/api/taskApiSlice"
import AddTask from "./AddTask"
import { useSelector } from "react-redux"

const ICONS = {
    high: <MdKeyboardDoubleArrowUp />,
    medium: <MdKeyboardArrowUp />,
    low: <MdKeyboardArrowDown />,
}

const Table = ({ tasks }) => {
    const { user } = useSelector((state) => state.auth)
    const [openDialog, setOpenDialog] = useState(false)
    const [selected, setSelected] = useState(null)
    const [openEdit, setOpenEdit] = useState(false)

    const [trashTask] = useTrashTaskMutation()

    const deleteClicks = (id) => {
        setSelected(id)
        setOpenDialog(true)
    }

    const editTaskHandler = (el) => {
        setSelected(el)
        setOpenEdit(true)
    }

    const deleteHandler = async () => {
        try {
            const result = await trashTask({
                id: selected,
                isTrash: "trash",
            }).unwrap()
            toast.success(result?.message)

            setTimeout(() => {
                setOpenDialog(false)
                window.location.reload()
            }, 500)
        } catch (err) {
            console.log(err)
            toast.error(err?.data?.message || err.message)
        }
    }

    const TableHeader = () => (
        <thead className="w-full border-b border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700">
            <tr className="w-full text-gray-900 dark:text-gray-100 text-left">
                <th className="py-2 px-2 font-semibold">Task Title</th>
                <th className="py-2 px-2 font-semibold">Priority</th>
                <th className="py-2 px-2 line-clamp-1 font-semibold">Created At</th>
                <th className="py-2 px-2 font-semibold">Assets</th>
                <th className="py-2 px-2 font-semibold">Team</th>
                {user?.isAdmin && <th className="py-2 px-2 font-semibold"></th>}
            </tr>
        </thead>
    )

    const TableRow = ({ task }) => (
        <tr className="border-b border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
            <td className="py-2 px-2">
                <div className="flex items-center gap-2">
                    <div
                        className={clsx(
                            "w-4 h-4 rounded-full",
                            TASK_TYPE[task.stage]
                        )}
                    />
                    <p className="w-full line-clamp-2 text-base text-gray-900 dark:text-white font-medium">
                        {task?.title}
                    </p>
                </div>
            </td>

            <td className="py-2 px-2">
                <div className={"flex gap-1 items-center"}>
                    <span
                        className={clsx(
                            "text-lg",
                            PRIOTITYSTYELS[task?.priority]
                        )}
                    >
                        {ICONS[task?.priority]}
                    </span>
                    <span className="capitalize line-clamp-1 dark:text-gray-300">
                        {task?.priority} Priority
                    </span>
                </div>
            </td>

            <td className="py-2 px-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(new Date(task?.date))}
                </span>
            </td>

            <td className="py-2 px-2">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1 items-center text-sm text-gray-600 dark:text-gray-400">
                        <BiMessageAltDetail />
                        <span>{task?.activities?.length}</span>
                    </div>
                    <div className="flex gap-1 items-center text-sm text-gray-600 dark:text-gray-400">
                        <MdAttachFile />
                        <span>{task?.assets?.length}</span>
                    </div>
                    <div className="flex gap-1 items-center text-sm text-gray-600 dark:text-gray-400">
                        <FaList />
                        <span>0/{task?.subTasks?.length}</span>
                    </div>
                </div>
            </td>

            <td className="py-2 px-2">
                <div className="flex">
                    {task?.team?.map((m, index) => (
                        <div
                            key={m._id}
                            className={clsx(
                                "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1 ring-2 ring-white dark:ring-slate-800",
                                BGS[index % BGS?.length]
                            )}
                        >
                            <UserInfo user={m} />
                        </div>
                    ))}
                </div>
            </td>

            {user?.isAdmin && (
                <td className="py-2 px-2 flex gap-2 md:gap-4 justify-end">
                    <Button
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 sm:px-0 text-sm md:text-base transition-colors"
                        label="Edit"
                        type="button"
                        onClick={() => editTaskHandler(task)}
                    />

                    <Button
                        className="text-red-700 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 sm:px-0 text-sm md:text-base transition-colors"
                        label="Delete"
                        type="button"
                        onClick={() => deleteClicks(task._id)}
                    />
                </td>
            )}
        </tr>
    )
    return (
        <>
            <div className="bg-white dark:bg-slate-800 px-2 md:px-4 pt-4 pb-9 shadow-md dark:shadow-lg dark:shadow-slate-900/50 rounded border border-gray-100 dark:border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <TableHeader />
                        <tbody>
                            {tasks.map((task, index) => (
                                <TableRow key={index} task={task} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* TODO */}
            <ConfirmatioDialog
                open={openDialog}
                setOpen={setOpenDialog}
                onClick={deleteHandler}
            />

            <AddTask
                open={openEdit}
                setOpen={setOpenEdit}
                task={selected}
                key={new Date().getTime()}
            />
        </>
    )
}

export default Table
