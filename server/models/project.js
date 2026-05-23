import mongoose, { Schema } from "mongoose"

const projectSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true, default: "" },
        status: {
            type: String,
            default: "active",
            enum: ["active", "completed", "archived"],
        },
        dueDate: { type: Date },
        team: [{ type: Schema.Types.ObjectId, ref: "User" }],
        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
)

const Project = mongoose.model("Project", projectSchema)

export default Project
