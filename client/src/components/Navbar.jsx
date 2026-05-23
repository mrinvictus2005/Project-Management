import React from "react"
import { MdDarkMode, MdLightMode, MdOutlineSearch } from "react-icons/md"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { setOpenSidebar, toggleTheme } from "../redux/slices/authSlice"
import NotificationPanel from "./NotificationPanel"
import UserAvatar from "./UserAvatar"

const Navbar = () => {
    const { theme } = useSelector((state) => state.auth)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleSearch = (e) => {
        if (e.key !== "Enter") return
        const value = e.target.value.trim()
        navigate(value ? `/tasks?search=${encodeURIComponent(value)}` : "/tasks")
    }

    return (
        <div className="flex justify-between items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur px-4 py-3 2xl:py-4 sticky z-10 top-0 border-b border-transparent dark:border-slate-800 transition-colors">
            <div className="flex gap-4">
                <button
                    onClick={() => dispatch(setOpenSidebar(true))}
                    className="text-2xl text-gray-500 dark:text-slate-300 block md:hidden"
                >
                    ☰
                </button>

                <div className="w-64 2xl:w-[400px] flex items-center py-2 px-3 gap-2 rounded-full bg-[#f3f4f6] dark:bg-slate-800 border border-transparent dark:border-slate-700">
                    <MdOutlineSearch className="text-gray-500 dark:text-slate-300 text-xl" />

                    <input
                        type="text"
                        placeholder="Search..."
                        onKeyDown={handleSearch}
                        className="flex-1 outline-none bg-transparent placeholder:text-gray-500 dark:placeholder:text-slate-400 text-gray-800 dark:text-slate-100"
                    />
                </div>
            </div>

            <div className="flex gap-2 items-center">
                <button
                    type="button"
                    onClick={() => dispatch(toggleTheme())}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-slate-700 transition-colors"
                    title={
                        theme === "dark"
                            ? "Switch to light mode"
                            : "Switch to dark mode"
                    }
                >
                    {theme === "dark" ? <MdLightMode /> : <MdDarkMode />}
                </button>

                <NotificationPanel />

                <UserAvatar />
            </div>
        </div>
    )
}

export default Navbar
