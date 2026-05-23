import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import Textbox from "../components/Textbox"
import Button from "../components/Button"
import { useSelector, useDispatch } from "react-redux"
import {
    useLoginMutation,
    useRegisterMutation,
} from "../redux/slices/api/authApiSlice"
import { toast } from "sonner"

import { setCredentials } from "../redux/slices/authSlice"
import Loading from "../components/Loader"

const Login = () => {
    const [mode, setMode] = useState("signup")
    const [loginAs, setLoginAs] = useState("admin")
    const { user } = useSelector((state) => state.auth)
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm()

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [login, { isLoading }] = useLoginMutation()
    const [registerUser, { isLoading: isRegistering }] = useRegisterMutation()

    const isSignup = mode === "signup"

    const submitHandler = async (data) => {
        try {
            const payload = isSignup
                ? {
                      name: data.name,
                      email: data.email,
                      password: data.password,
                      title: data.title,
                      role: data.role,
                      isAdmin: data.accountType === "admin",
                  }
                : data

            const result = isSignup
                ? await registerUser(payload).unwrap()
                : await login(payload).unwrap()

            if (!isSignup && result?.isAdmin !== (loginAs === "admin")) {
                toast.error(
                    `This account is registered as ${
                        result?.isAdmin ? "Admin" : "Member"
                    }. Select the correct login type.`
                )
                return
            }

            dispatch(setCredentials(result))

            navigate("/")
        } catch (error) {
            console.log(error)
            const message = error?.data?.message || error.message

            if (isSignup && message?.toLowerCase().includes("already")) {
                setMode("login")
                toast.info("Account already exists. Please log in.")
                return
            }

            toast.error(message)
        }
    }

    useEffect(() => {
        user && navigate("/dashboard")
    }, [user])

    const switchMode = (nextMode) => {
        setMode(nextMode)
        reset()
    }

    return (
        <div className="auth-shell min-h-screen overflow-hidden bg-[#eef2f7] text-slate-950">
            <div className="ambient-grid" aria-hidden="true"></div>
            <div className="motion-beam beam-one" aria-hidden="true"></div>
            <div className="motion-beam beam-two" aria-hidden="true"></div>
            <div className="floating-node node-one" aria-hidden="true"></div>
            <div className="floating-node node-two" aria-hidden="true"></div>
            <div className="floating-node node-three" aria-hidden="true"></div>
            <div className="ambient-orbit orbit-one" aria-hidden="true"></div>
            <div className="ambient-orbit orbit-two" aria-hidden="true"></div>
            <div className="auth-grid min-h-screen">
                <section className="auth-hero">
                    <nav className="auth-nav">
                        <div className="brand-mark">VF</div>
                        <div>
                            <p className="brand-name">VeyraFlow</p>
                            <p className="brand-subtitle">Team Work OS</p>
                        </div>
                    </nav>

                    <div className="hero-copy">
                        <span className="hero-kicker">Command projects before they drift</span>
                        <h1>Orchestrate every project, task, and deadline.</h1>
                        <p>
                            A polished workspace for admins and members to plan work,
                            assign owners, spot overdue tasks, and keep delivery moving.
                        </p>
                    </div>

                    <div className="proof-strip" aria-hidden="true">
                        <div>
                            <strong>Role-based</strong>
                            <span>Admin / Member access</span>
                        </div>
                        <div>
                            <strong>Live dashboard</strong>
                            <span>Tasks, status, overdue</span>
                        </div>
                        <div>
                            <strong>Project linked</strong>
                            <span>Teams, owners, deadlines</span>
                        </div>
                    </div>

                    <div className="product-stage" aria-hidden="true">
                        <div className="scene-depth"></div>
                        <div className="product-window">
                            <div className="window-bar">
                                <span></span>
                                <span></span>
                                <span></span>
                                <strong>VeyraFlow Mission Control</strong>
                            </div>
                            <div className="product-layout">
                                <aside>
                                    <div className="mini-avatar"></div>
                                    <div className="side-line active"></div>
                                    <div className="side-line"></div>
                                    <div className="side-line short"></div>
                                    <div className="side-line"></div>
                                </aside>
                                <main>
                                    <div className="metric-row">
                                        <div className="metric-card blue">
                                            <span>Tasks</span>
                                            <strong>128</strong>
                                        </div>
                                        <div className="metric-card green">
                                            <span>Done</span>
                                            <strong>74</strong>
                                        </div>
                                        <div className="metric-card red">
                                            <span>Overdue</span>
                                            <strong>06</strong>
                                        </div>
                                    </div>
                                    <div className="board-preview">
                                        <div className="lane">
                                            <p>Project backlog</p>
                                            <div className="task-chip chip-one"></div>
                                            <div className="task-chip"></div>
                                        </div>
                                        <div className="lane">
                                            <p>Active sprint</p>
                                            <div className="task-chip chip-two"></div>
                                            <div className="task-chip"></div>
                                        </div>
                                        <div className="lane">
                                            <p>Delivered</p>
                                            <div className="task-chip chip-three"></div>
                                            <div className="task-chip"></div>
                                        </div>
                                    </div>
                                </main>
                            </div>
                        </div>
                        <div className="glass-chart">
                            <div className="chart-bar tall"></div>
                            <div className="chart-bar"></div>
                            <div className="chart-bar medium"></div>
                            <div className="chart-bar high"></div>
                        </div>
                        <div className="floating-card floating-one">
                            <span></span>
                            <p>Launch plan approved</p>
                        </div>
                        <div className="floating-card floating-two">
                            <span></span>
                            <p>3 overdue tasks flagged</p>
                        </div>
                        <div className="workflow-rail">
                            <div className="workflow-step active">
                                <span>01</span>
                                <p>Create project</p>
                            </div>
                            <div className="workflow-step">
                                <span>02</span>
                                <p>Assign team</p>
                            </div>
                            <div className="workflow-step">
                                <span>03</span>
                                <p>Track delivery</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="auth-panel-wrap">
                    <form
                        onSubmit={handleSubmit(submitHandler)}
                        className="auth-card"
                    >
                        <div className="auth-toggle">
                            <button
                                type="button"
                                className={mode === "login" ? "active" : ""}
                                onClick={() => switchMode("login")}
                            >
                                Login
                            </button>
                            <button
                                type="button"
                                className={mode === "signup" ? "active" : ""}
                                onClick={() => switchMode("signup")}
                            >
                                Sign up
                            </button>
                        </div>

                        <div>
                            <p className="auth-title">
                                {isSignup ? "Create your workspace" : "Welcome back"}
                            </p>
                            <p className="auth-subtitle">
                                {isSignup
                                    ? "Start with an admin account, then invite your team."
                                    : "Sign in to manage projects, tasks, and team progress."}
                            </p>
                        </div>

                        <div className="flex flex-col gap-y-4">
                            {!isSignup && (
                                <div>
                                    <label className="text-slate-800">
                                        Login Type
                                    </label>
                                    <div className="role-toggle">
                                        <button
                                            type="button"
                                            className={
                                                loginAs === "admin"
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={() => setLoginAs("admin")}
                                        >
                                            Admin
                                        </button>
                                        <button
                                            type="button"
                                            className={
                                                loginAs === "member"
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={() => setLoginAs("member")}
                                        >
                                            Member
                                        </button>
                                    </div>
                                </div>
                            )}

                            {isSignup && (
                                <>
                                    <Textbox
                                        placeholder="Your full name"
                                        type="text"
                                        name="name"
                                        label="Full Name"
                                        className="w-full rounded-xl bg-white"
                                        register={register("name", {
                                            required: "Name is required!",
                                        })}
                                        error={errors.name ? errors.name.message : ""}
                                    />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <Textbox
                                            placeholder="Project Manager"
                                            type="text"
                                            name="title"
                                            label="Title"
                                            className="w-full rounded-xl bg-white"
                                            register={register("title", {
                                                required: "Title is required!",
                                            })}
                                            error={
                                                errors.title
                                                    ? errors.title.message
                                                    : ""
                                            }
                                        />
                                        <Textbox
                                            placeholder="Admin"
                                            type="text"
                                            name="role"
                                            label="Role"
                                            className="w-full rounded-xl bg-white"
                                            register={register("role", {
                                                required: "Role is required!",
                                            })}
                                            error={
                                                errors.role ? errors.role.message : ""
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="text-slate-800">
                                            Account Type
                                        </label>
                                        <select
                                            className="w-full rounded-xl bg-white px-3 py-2.5 border border-gray-300 text-gray-900 outline-none focus:ring-2 ring-blue-300"
                                            {...register("accountType")}
                                            defaultValue="admin"
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="member">Member</option>
                                        </select>
                                    </div>
                                </>
                            )}
                            <Textbox
                                placeholder="email@example.com"
                                type="email"
                                name="email"
                                label="Email Address"
                                className="w-full rounded-xl bg-white"
                                register={register("email", {
                                    required: "Email Address is required!",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Enter a valid email address.",
                                    },
                                })}
                                error={errors.email ? errors.email.message : ""}
                            />
                            <Textbox
                                placeholder="Your password"
                                type="password"
                                name="password"
                                label="Password"
                                className="w-full rounded-xl bg-white"
                                register={register("password", {
                                    required: "Password is required!",
                                    minLength: {
                                        value: isSignup ? 6 : 1,
                                        message:
                                            "Password must be at least 6 characters.",
                                    },
                                })}
                                error={
                                    errors.password
                                        ? errors.password.message
                                        : ""
                                }
                            />

                            {!isSignup && (
                                <span className="text-sm text-gray-500">
                                    Use the sign up tab if this is your first account.
                                </span>
                            )}

                            {isLoading || isRegistering ? (
                                <Loading />
                            ) : (
                                <Button
                                    type="submit"
                                    label={isSignup ? "Create Account" : "Login"}
                                    className="w-full h-11 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 transition-colors"
                                />
                            )}

                            <button
                                type="button"
                                onClick={() => switchMode(isSignup ? "login" : "signup")}
                                className="text-sm font-semibold text-blue-700 hover:text-blue-900"
                            >
                                {isSignup
                                    ? "Already registered? Login"
                                    : "New to VeyraFlow? Create an account"}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    )
}

export default Login
