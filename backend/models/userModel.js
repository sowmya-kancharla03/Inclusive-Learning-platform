import { model, Schema } from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["student", "teacher"],
        required: true
    },

    // STUDENT: courses they enrolled in
    enrolledCourses: [
        { type: Schema.Types.ObjectId, ref: "course" }
    ],

    // TEACHER: courses they created
    uploadedCourses: [
        { type: Schema.Types.ObjectId, ref: "course" }
    ]

});

export const UserModel = model("user", userSchema);
