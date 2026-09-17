import express from "express";
import { CourseModel } from "../models/courseModel.js";
import { verifyToken, verifyStudent } from "../middlewares/authMiddleware.js";
import { QuizModel } from "../models/quizModel.js";
import { QuizAttemptModel } from "../models/quizAttemptModel.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import { AssignmentSubmissionModel } from "../models/assignmentSubmissionModel.js";
import { UserModel } from "../models/userModel.js";



export const studentRoute = express.Router();



//  GET ALL COURSES (Students Only)

studentRoute.get("/courses", verifyToken, verifyStudent, async (req, res) => {
    try {
        const courses = await CourseModel.find().select("title description teacherId");

        res.status(200).json({
            message: "Courses fetched successfully",
            courses
        });

    } catch (err) {
        res.status(400).json({
            message: "Error fetching courses",
            reason: err.message
        });
    }
});

//  GET FULL COURSE DETAILS (videos, pdfs, quizzes, assignments)
//  GET FULL COURSE DETAILS (videos, pdfs, quizzes, assignments)
studentRoute.get(
    "/course/:courseId",
    verifyToken,
    verifyStudent,
    async (req, res) => {
        try {
            const { courseId } = req.params;
            const studentId = req.user.id;

            // 1️⃣ Check enrollment
            const student = await UserModel.findById(studentId);

            const isEnrolled = student.enrolledCourses
                .map(id => id.toString())
                .includes(courseId);

            if (!isEnrolled) {
                return res
                    .status(403)
                    .json({ message: "Not enrolled in this course" });
            }

            // 2️⃣ Fetch course
            const course = await CourseModel.findById(courseId)
                .populate("teacherId", "name email")
                .populate("assignments")
                .populate("quizzes", "title questions");

            if (!course) {
                return res.status(404).json({ message: "Course not found" });
            }

            // 3️⃣ Fetch quiz attempts for this student
            const quizAttempts = await QuizAttemptModel.find({
                studentId,
                quizId: { $in: course.quizzes.map(q => q._id) }
            });

            // 4️⃣ Merge quizzes with attempt info
            const quizzesWithAttempts = course.quizzes.map(quiz => {

                
                const attempts = quizAttempts.filter(
                    a => a.quizId.toString() === quiz._id.toString()
                );
            
                let bestScore = null;
            
                
                if (attempts.length > 0) {
                    bestScore = Math.max(
                        ...attempts.map(a => a.score)
                    );
                }
            
                return {
                    _id: quiz._id,
                    title: quiz.title,
                    totalQuestions: quiz.questions.length,
                    attempt: bestScore !== null
                        ? { score: bestScore }
                        : null
                };
            });

            // 5️⃣ Send final response
            res.status(200).json({
                message: "Course details loaded",
                course: {
                    ...course.toObject(),
                    quizzes: quizzesWithAttempts
                }
            });

        } catch (err) {
            res.status(400).json({
                message: "Error loading course details",
                reason: err.message,
            });
        }
    }
);


// GET Quiz

studentRoute.get("/quiz/:quizId", verifyToken, verifyStudent, async (req, res) => {
    try {
        const { quizId } = req.params;
        const studentId = req.user.id;

        //fetch quiz
        const quiz = await QuizModel.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        return res.status(200).json({ message: "successfully fetched quiz", quiz: quiz.questions });
    } catch (err) {
        return res.status(404).json({ message: "Quiz not found",reason:err.message });
    }
})


// SUBMIT QUIZ (Student Only)

studentRoute.post("/quiz/:quizId/submit", verifyToken, verifyStudent, async (req, res) => {
    try {
        const { quizId } = req.params;
        const { answers } = req.body; // array of selected options
        const studentId = req.user.id;

        // Fetch quiz
        const quiz = await QuizModel.findById(quizId);


        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }
        
        // Calculate score
        let score = 0;
        quiz.questions.forEach((q, index) => {
            if (Number(answers[index]) === q.correctOption) {
                score++;
            }
        });


        // Save attempt
        const attempt = new QuizAttemptModel({
            quizId,
            studentId,
            score
        });

        await attempt.save();

        res.status(200).json({
            message: "Quiz submitted successfully",
            score,
            totalQuestions: quiz.questions.length
        });
        

    } catch (err) {
        res.status(400).json({
            message: "Error submitting quiz",
            reason: err.message
        });
    }
}
);



//  SUBMIT ASSIGNMENT (Student Only) // Multer middleware

studentRoute.post("/assignment/:assignmentId/submit", verifyToken, verifyStudent, upload.single("file"), async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const studentId = req.user.id;

        // Ensure file is uploaded
        if (!req.file) {
            return res.status(400).json({ message: "File is required" });
        }

        const fileUrl = `/uploads/assignments/${req.file.filename}`;

        // Save submission
        const submission = new AssignmentSubmissionModel({
            assignmentId,
            studentId,
            fileUrl
        });

        await submission.save();

        res.status(200).json({
            message: "Assignment submitted successfully",
            submission
        });

    } catch (err) {
        res.status(400).json({
            message: "Error submitting assignment",
            reason: err.message
        });
    }
}
);


// STUDENT DASHBOARD ANALYTICS

studentRoute.get(
    "/dashboard",
    verifyToken,
    verifyStudent,
    async (req, res) => {
      try {
        const studentId = req.user.id;
  
        // 1️⃣ Fetch all quiz attempts by student
        const attempts = await QuizAttemptModel.find({ studentId });
  
        // 2️⃣ Group attempts by quizId and get BEST score per quiz
        const quizBestScoreMap = {};
  
        attempts.forEach(attempt => {
          const quizId = attempt.quizId.toString();
          if (
            !quizBestScoreMap[quizId] ||
            attempt.score > quizBestScoreMap[quizId]
          ) {
            quizBestScoreMap[quizId] = attempt.score;
          }
        });
  
        const quizIds = Object.keys(quizBestScoreMap);
  
        // 3️⃣ Fetch quizzes to get total questions
        const quizzes = await QuizModel.find({
          _id: { $in: quizIds }
        });
  
        // 4️⃣ Calculate percentage per quiz
        let totalPercentage = 0;
  
        quizzes.forEach(q => {
          const bestScore = quizBestScoreMap[q._id.toString()];
          const percentage =
            (bestScore / q.questions.length) * 100;
          totalPercentage += percentage;
        });
  
        const bestScoreAverage =
          quizzes.length > 0
            ? Math.round(totalPercentage / quizzes.length)
            : 0;
  
        // 5️⃣ Other dashboard stats
        const student = await UserModel.findById(studentId);
        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }
  
        const uniqueQuizAttempts = quizIds.length;
  
        const assignmentSubs =
          await AssignmentSubmissionModel.countDocuments({ studentId });
  
        res.status(200).json({
          message: "Dashboard analytics loaded",
          analytics: {
            totalCourses: student.enrolledCourses.length,
            quizzesAttempted: uniqueQuizAttempts,
            assignmentsSubmitted: assignmentSubs,
            bestScoreAverage 
          }
        });
  
      } catch (err) {
        console.error("DASHBOARD ERROR:", err);
        res.status(500).json({
          message: "Error loading analytics",
          reason: err.message
        });
      }
    }
  );
  


// Student geting course
// ENROLL IN A COURSE (Student Only)
studentRoute.post(
    "/enroll/:courseId",
    verifyToken,
    verifyStudent,
    async (req, res) => {
        try {
            const studentId = req.user.id;
            const { courseId } = req.params;

            // Validate course
            const courseExists = await CourseModel.findById(courseId);
            if (!courseExists) {
                return res.status(404).json({ message: "Course not found" });
            }

            // Enroll student (prevent duplicates)
            await UserModel.findByIdAndUpdate(studentId, {
                $addToSet: { enrolledCourses: courseId }
            });

            res.status(200).json({ message: "Enrolled successfully" });

        } catch (err) {
            res.status(400).json({ message: "Error enrolling", reason: err.message });
        }
    }
);

// GET ALL ENROLLED COURSES (Student Only)
studentRoute.get(
    "/my-courses",
    verifyToken,
    verifyStudent,
    async (req, res) => {
        try {
            const studentId = req.user.id;

            const student = await UserModel.findById(studentId)
                .populate("enrolledCourses");

            res.status(200).json({
                message: "Enrolled courses fetched",
                courses: student.enrolledCourses
            });

        } catch (err) {
            res.status(400).json({
                message: "Error loading enrolled courses",
                reason: err.message
            });
        }
    }
);
