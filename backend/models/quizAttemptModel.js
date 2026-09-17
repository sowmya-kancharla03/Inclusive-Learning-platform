import { Schema, model } from "mongoose";

const quizAttemptSchema = new Schema({
    quizId: { type: Schema.Types.ObjectId, ref: "quiz", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    score: Number,
    submittedAt: { type: Date, default: Date.now }
});

export const QuizAttemptModel = model("quiz_attempt", quizAttemptSchema);
