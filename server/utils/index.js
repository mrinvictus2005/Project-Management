import jwt from "jsonwebtoken"
import mongoose from "mongoose"

export const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)

        console.log("DB connection established")
    } catch (error) {
        console.log("DB Error: " + error)
    }
}

export const createJWT = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    })

 res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    domain: ".up.railway.app",
    maxAge: 1 * 24 * 60 * 60 * 1000,
})