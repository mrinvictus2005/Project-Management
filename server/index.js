import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import morgan from "morgan"

import { errorHandler, routeNotFound } from "./middlewares/errorMiddleware.js"
import routes from "./routes/index.js"
import { dbConnection } from "./utils/index.js"

dotenv.config()

const app = express()

// Database connection
dbConnection()

// Body parsers
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Cookie parser
app.use(cookieParser())

// CORS
app.use(
    cors({
        origin: [
            "https://project-management-production-374c.up.railway.app",
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
)

// Logger
app.use(morgan("dev"))

// Routes
app.use("/api", routes)

// Error handlers
app.use(routeNotFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`)
})