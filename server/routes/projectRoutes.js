import express from "express"
import {
    createProject,
    deleteProject,
    getProjects,
    updateProject,
} from "../controllers/projectController.js"
import { isAdminRoute, protectRoute } from "../middlewares/authMiddleware.js"

const router = express.Router()

router.get("/", protectRoute, getProjects)
router.post("/", protectRoute, isAdminRoute, createProject)
router.put("/:id", protectRoute, isAdminRoute, updateProject)
router.delete("/:id", protectRoute, isAdminRoute, deleteProject)

export default router
