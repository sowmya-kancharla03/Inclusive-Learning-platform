import { Schema, model } from "mongoose";

const courseSchema = new Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    teacherId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },

    videos: [
        {
            title: String,
            url: String
        }
    ],

    pdfs: [
        {
            title: String,
            url: String
        }
    ],

    quizzes: [
        { type: Schema.Types.ObjectId, ref: "quiz" }
    ],

    assignments: [
        { type: Schema.Types.ObjectId, ref: "assignment" }
    ]
});

export const CourseModel = model("course", courseSchema);
