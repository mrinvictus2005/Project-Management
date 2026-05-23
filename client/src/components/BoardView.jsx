import React from "react"
import TaskCard from "./TaskCard"

const BoardView = ({ tasks }) => {
    return (
        <div className="w-full py-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 2xl:gap-10 bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-950 rounded-lg p-4">
            {tasks.map((task, index) => (
                <TaskCard task={task} key={index} />
            ))}
        </div>
    )
}

export default BoardView
