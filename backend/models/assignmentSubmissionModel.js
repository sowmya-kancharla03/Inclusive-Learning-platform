import { Schema, model } from "mongoose";

const assignmentSubmissionSchema = new Schema({
    assignmentId: { type: Schema.Types.ObjectId, ref: "assignment", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    fileUrl: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },
    marks: { type: Number, default: null },
    feedback: { type: String, default: "" }
});

export const AssignmentSubmissionModel = model("assignment_submission", assignmentSubmissionSchema);
