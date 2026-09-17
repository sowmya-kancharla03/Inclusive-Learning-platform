import { Schema, model } from "mongoose";

const quizSchema = new Schema({
    courseId: { type: Schema.Types.ObjectId, ref: "course", required: true },
    title: String,
    questions: [
        {
            question: String,
            options: [String],
            correctOption: Number
        }
    ]
});

export const QuizModel = model("quiz", quizSchema);
