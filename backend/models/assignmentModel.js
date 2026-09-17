import { Schema, model } from "mongoose";

const assignmentSchema = new Schema({
    courseId: { type: Schema.Types.ObjectId, ref: "course", required: true },
    title: String,
    description: String,
    dueDate: Date
});

export const AssignmentModel = model("assignment", assignmentSchema);
