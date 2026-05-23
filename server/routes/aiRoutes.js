import express from "express"
import { chatWithAssistant } from "../controllers/aiController.js"
import { protectRoute } from "../middlewares/authMiddleware.js"

const router = express.Router()

router.post("/chat", protectRoute, chatWithAssistant)

export default router
