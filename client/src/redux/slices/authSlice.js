import { createSlice } from "@reduxjs/toolkit"
// import { user } from "../../assets/data"

const initialState = {
    user: localStorage.getItem("userInfo")
        ? JSON.parse(localStorage.getItem("userInfo"))
        : null,

    isSidebarOpen: false,
    theme: localStorage.getItem("theme") || "light",
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            state.user = action.payload
            localStorage.setItem("userInfo", JSON.stringify(action.payload))
        },
        logout: (state, action) => {
            state.user = null
            localStorage.removeItem("userInfo")
        },
        setOpenSidebar: (state, action) => {
            state.isSidebarOpen = action.payload
        },
        toggleTheme: (state) => {
            state.theme = state.theme === "dark" ? "light" : "dark"
            localStorage.setItem("theme", state.theme)
        },
    },
})

export const { setCredentials, logout, setOpenSidebar, toggleTheme } =
    authSlice.actions

export default authSlice.reducer
