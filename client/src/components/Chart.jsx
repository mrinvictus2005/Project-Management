import React from "react"
import { useSelector } from "react-redux"
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

export const Chart = ({ data }) => {
    const { theme } = useSelector((state) => state.auth)
    const isDark = theme === "dark"

    return (
        <ResponsiveContainer width={"100%"} height={300}>
            <BarChart width={150} height={40} data={data}>
                <XAxis
                    dataKey="name"
                    tick={{ fill: isDark ? "#cbd5e1" : "#475569" }}
                />
                <YAxis tick={{ fill: isDark ? "#cbd5e1" : "#475569" }} />
                <Tooltip />
                <Legend />
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "#334155" : "#e2e8f0"}
                />
                <Bar dataKey="total" fill={isDark ? "#38bdf8" : "#4f46e5"} />
            </BarChart>
        </ResponsiveContainer>
    )
}
