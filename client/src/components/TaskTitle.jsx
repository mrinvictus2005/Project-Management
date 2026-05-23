import clsx from "clsx"
import React from "react"
import { IoMdAdd } from "react-icons/io"

const TaskTitle = ({ label, className }) => {
    return (
        <div className="w-full h-10 md:h-12 px-2 md:px-4 rounded bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-700 flex items-center justify-between border border-gray-100 dark:border-slate-600 shadow-sm hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-slate-900/50 transition-all">
            <div className="flex gap-2 items-center">
                <div className={clsx("w-4 h-4 rounded-full shadow-sm", className)} />
                <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium">{label}</p>
            </div>

            <button className="hidden md:block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                <IoMdAdd className="text-lg" />
            </button>
        </div>
    )
}

export default TaskTitle
