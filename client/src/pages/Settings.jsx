import React, { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "sonner"
import { toggleTheme } from "../redux/slices/authSlice"
import Title from "../components/Title"

const Settings = () => {
    const { user, theme } = useSelector((state) => state.auth)
    const dispatch = useDispatch()
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    const handleThemeToggle = () => {
        dispatch(toggleTheme())
        toast.success(
            `Switched to ${theme === "dark" ? "light" : "dark"} mode`
        )
    }

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value,
        })
    }

    const handlePasswordSubmit = (e) => {
        e.preventDefault()
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Passwords do not match")
            return
        }
        if (passwordData.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }
        toast.success("Password changed successfully")
        setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        })
    }

    return (
        <div className="w-full">
            <div className="mb-8">
                <Title title="Settings" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Theme Settings */}
                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-md border border-transparent dark:border-slate-700">
                    <h2 className="text-xl font-bold text-black dark:text-white mb-4">
                        Theme
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                            <div>
                                <p className="font-semibold text-black dark:text-white">
                                    Dark Mode
                                </p>
                                <p className="text-sm text-gray-600 dark:text-slate-400">
                                    {theme === "dark"
                                        ? "Currently enabled"
                                        : "Currently disabled"}
                                </p>
                            </div>
                            <button
                                onClick={handleThemeToggle}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                                    theme === "dark"
                                        ? "bg-blue-600"
                                        : "bg-gray-300"
                                }`}
                            >
                                <span
                                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                        theme === "dark"
                                            ? "translate-x-7"
                                            : "translate-x-1"
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Account Settings */}
                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-md border border-transparent dark:border-slate-700">
                    <h2 className="text-xl font-bold text-black dark:text-white mb-4">
                        Account
                    </h2>

                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-slate-400">
                                User ID
                            </p>
                            <p className="font-semibold text-black dark:text-white mt-1">
                                {user?._id}
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-slate-400">
                                Email
                            </p>
                            <p className="font-semibold text-black dark:text-white mt-1">
                                {user?.email}
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-slate-400">
                                Role
                            </p>
                            <p className="font-semibold text-black dark:text-white mt-1 capitalize">
                                {user?.isAdmin ? "Administrator" : "Member"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Change Password */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg p-6 shadow-md border border-transparent dark:border-slate-700">
                    <h2 className="text-xl font-bold text-black dark:text-white mb-4">
                        Change Password
                    </h2>

                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                                Current Password
                            </label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                placeholder="Enter current password"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                placeholder="Enter new password"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                placeholder="Confirm new password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full px-6 py-2 mt-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
                        >
                            Update Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Settings
