import React, { useState } from "react"
import Title from "../components/Title"
import Button from "../components/Button"
import { IoMdAdd } from "react-icons/io"
import { summary } from "../assets/data"
import { getInitials } from "../utils"
import clsx from "clsx"
import ConfirmatioDialog, { UserAction } from "../components/Dialogs"
import AddUser from "../components/AddUser"
import {
    useDeleteUserMutation,
    useGetTeamListQuery,
    useUserActionMutation,
} from "../redux/slices/api/userApiSlice"
import { toast } from "sonner"

const Users = () => {
    const [openDialog, setOpenDialog] = useState(false)
    const [open, setOpen] = useState(false)
    const [openAction, setOpenAction] = useState(false)
    const [selected, setSelected] = useState(null)

    const { data, isLoading, refetch } = useGetTeamListQuery()
    const [deleteUser] = useDeleteUserMutation()
    const [userAction] = useUserActionMutation()

    const userActionHandler = async () => {
        try {
            const result = await userAction({
                isActive: !selected?.isActive,
                id: selected?._id,
            })

            refetch()
            toast.success(result.data.message)

            setSelected(null)
            setTimeout(() => {
                setOpenAction(false)
            }, 500)
        } catch (err) {
            console.log(err)
            toast.error(err?.data?.message || err.message)
        }
    }
    const deleteHandler = async () => {
        try {
            const result = await deleteUser(selected)

            refetch()
            toast.success("Deleted user successfully.")
            setSelected(null)

            setTimeout(() => {
                setOpenDialog(false)
            }, 500)
        } catch (err) {
            console.log(err)
            toast.error(err?.data?.message || err.message)
        }
    }

    const deleteClick = (id) => {
        setSelected(id)
        setOpenDialog(true)
    }

    const editClick = (el) => {
        setSelected(el)
        setOpen(true)
    }

    const userStatusClick = (el) => {
        setSelected(el)
        setOpenAction(true)
    }

    const TableHeader = () => (
        <thead className="border-b border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50">
            <tr className="text-gray-900 dark:text-gray-100 text-left font-semibold">
                <th className="py-2 px-2">Full Name</th>
                <th className="py-2 px-2">Title</th>
                <th className="py-2 px-2">Email</th>
                <th className="py-2 px-2">Role</th>
                <th className="py-2 px-2">Active</th>
            </tr>
        </thead>
    )

    const TableRow = ({ user }) => (
        <tr className="border-b border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
            <td className="p-2">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm bg-blue-600 dark:bg-blue-700 font-semibold ring-2 ring-blue-200 dark:ring-blue-900">
                        <span className="text-xs md:text-sm text-center">
                            {getInitials(user.name)}
                        </span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                </div>
            </td>

            <td className="p-2 text-sm text-gray-600 dark:text-gray-400">{user.title}</td>
            <td className="p-2 text-sm text-gray-600 dark:text-gray-400">{user.email || "user.emal.com"}</td>
            <td className="p-2 text-sm text-gray-700 dark:text-gray-300">{user.role}</td>

            <td className="p-2">
                <button
                    onClick={() => userStatusClick(user)}
                    className={clsx(
                        "w-fit px-3 py-1 rounded-full text-sm font-medium transition-all",
                        user?.isActive 
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50" 
                            : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
                    )}
                >
                    {user?.isActive ? "Active" : "Disabled"}
                </button>
            </td>

            <td className="p-2 flex gap-4 justify-end">
                <Button
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-semibold sm:px-0 transition-colors"
                    label="Edit"
                    type="button"
                    onClick={() => editClick(user)}
                />

                <Button
                    className="text-red-700 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 font-semibold sm:px-0 transition-colors"
                    label="Delete"
                    type="button"
                    onClick={() => deleteClick(user?._id)}
                />
            </td>
        </tr>
    )

    return (
        <>
            <div className="w-full md:px-1 px-0 mb-6">
                <div className="flex items-center justify-between mb-8">
                    <Title title="Team Members" />
                    <Button
                        label="Add New User"
                        icon={<IoMdAdd className="text-lg" />}
                        className="flex flex-row-reverse gap-1 items-center bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-md 2xl:py-2.5 transition-colors"
                        onClick={() => setOpen(true)}
                    />
                </div>

                <div className="bg-white dark:bg-slate-800 px-2 md:px-4 py-4 shadow-md dark:shadow-lg dark:shadow-slate-900/50 rounded-lg border border-gray-100 dark:border-slate-700">
                    <div className="overflow-x-auto">
                        <table className="w-full mb-5">
                            <TableHeader />
                            <tbody>
                                {data?.map((user, index) => (
                                    <TableRow key={index} user={user} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <AddUser
                open={open}
                setOpen={setOpen}
                userData={selected}
                onSuccess={refetch}
                key={new Date().getTime().toString()}
            />

            <ConfirmatioDialog
                open={openDialog}
                setOpen={setOpenDialog}
                onClick={deleteHandler}
            />

            <UserAction
                open={openAction}
                setOpen={setOpenAction}
                onClick={userActionHandler}
            />
        </>
    )
}

export default Users
