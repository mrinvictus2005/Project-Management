import { Transition } from "@headlessui/react"
import clsx from "clsx"
import { Fragment, useEffect, useRef } from "react"
import { IoClose } from "react-icons/io5"
import { useDispatch, useSelector } from "react-redux"
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom"
import { Toaster } from "sonner"
import Navbar from "./components/Navbar"
import Sidebar from "./components/Sidebar"
import AIAssistant from "./components/AIAssistant"
import Login from "./pages/Login"
import TaskDetails from "./pages/TaskDetails"
import Tasks from "./pages/Tasks"
import Trash from "./pages/Trash"
import Users from "./pages/Users"
import Dashboard from "./pages/Dashboard"
import Projects from "./pages/Projects"
import Reports from "./pages/Reports"
import { setOpenSidebar } from "./redux/slices/authSlice"

function Layout() {
    const { user } = useSelector((state) => state.auth)

    const location = useLocation()

    return user ? (
        <div className="w-full h-screen flex flex-col md:flex-row bg-[#f3f4f6] dark:bg-slate-950">
            <div className="w-1/5 h-screen bg-white dark:bg-slate-950 sticky top-0 hidden md:block">
                <Sidebar />
            </div>

            <MobileSidebar />

            <div className="flex-1 overflow-y-auto bg-[#f3f4f6] dark:bg-slate-950">
                <Navbar />

                <div className="p-4 2xl:px-10">
                    <Outlet />
                </div>
            </div>
            <AIAssistant />
        </div>
    ) : (
        <Navigate to="/log-in" state={{ from: location }} replace />
    )
}

function AdminRoute() {
    const { user } = useSelector((state) => state.auth)

    return user?.isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />
}

const MobileSidebar = () => {
    const { isSidebarOpen } = useSelector((state) => state.auth)
    const mobileMenuRef = useRef(null)
    const dispatch = useDispatch()

    const closeSidebar = () => {
        dispatch(setOpenSidebar(false))
    }

    return (
        <>
            <Transition
                show={isSidebarOpen}
                as={Fragment}
                enter="transition-opacity duration-700"
                enterFrom="opacity-x-10"
                enterTo="opacity-x-100"
                leave="transition-opacity duration-700"
                leaveFrom="opacity-x-100"
                leaveTo="opacity-x-0"
            >
                {(ref) => (
                    <div
                        ref={(node) => (mobileMenuRef.current = node)}
                        className={clsx(
                            "md:hidden w-full h-full bg-black/40 transition-all duration-700 transform ",
                            isSidebarOpen ? "translate-x-0" : "translate-x-full"
                        )}
                        onClick={() => closeSidebar()}
                    >
                        <div className="bg-white dark:bg-slate-950 w-3/4 h-full">
                            <div className="w-full flex justify-end px-5 mt-5">
                                <button
                                    onClick={() => closeSidebar()}
                                    className="flex justify-end items-end"
                                >
                                    <IoClose size={25} />
                                </button>
                            </div>

                            <div className="-mt-10">
                                <Sidebar />
                            </div>
                        </div>
                    </div>
                )}
            </Transition>
        </>
    )
}

function App() {
    const { theme } = useSelector((state) => state.auth)

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark")
    }, [theme])

    return (
        <main className="w-full min-h-screen bg-[#f3f4f6] text-slate-950 dark:bg-slate-950 dark:text-slate-100 transition-colors">
            <Routes>
                <Route element={<Layout />}>
                    <Route
                        index
                        path="/"
                        element={<Navigate to="/dashboard" />}
                    />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/completed/:status" element={<Tasks />} />
                    <Route path="/in-progress/:status" element={<Tasks />} />
                    <Route path="/todo/:status" element={<Tasks />} />
                    <Route path="/task/:id" element={<TaskDetails />} />
                    <Route element={<AdminRoute />}>
                        <Route path="/team" element={<Users />} />
                        <Route path="/trashed" element={<Trash />} />
                    </Route>
                </Route>

                <Route path="/log-in" element={<Login />} />
            </Routes>

            <Toaster richColors />
        </main>
    )
}

export default App
