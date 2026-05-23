import express from "express"
import userRoutes from "./userRoutes.js"
import taskRoutes from "./taskRoutes.js"
import projectRoutes from "./projectRoutes.js"
import aiRoutes from "./aiRoutes.js"

const router = express.Router()

router.use("/user", userRoutes) //api/user/login
router.use("/task", taskRoutes)
router.use("/project", projectRoutes)
router.use("/ai", aiRoutes)

export default router
