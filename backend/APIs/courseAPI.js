import express from "express";
import { CourseModel } from "../models/courseModel.js";
import { verifyToken, verifyTeacher } from "../middlewares/authMiddleware.js";
import { QuizModel } from "../models/quizModel.js";
import { AssignmentModel } from "../models/assignmentModel.js";
import { AssignmentSubmissionModel } from "../models/assignmentSubmissionModel.js";
import { UserModel } from "../models/userModel.js";
import { QuizAttemptModel } from "../models/quizAttemptModel.js";



export const courseRoute = express.Router();


// 1️ Create Course (Teacher Only)

courseRoute.post("/create-course", verifyToken, verifyTeacher, async (req, res) => {
    try {
        const teacherId = req.user.id;

        let newCourse = new CourseModel({
            ...req.body,
            teacherId
        });

        await newCourse.save();

        // ADD this line → Save course under teacher's uploadedCourses
        await UserModel.findByIdAndUpdate(teacherId, {
            $push: { uploadedCourses: newCourse._id }
        });

        res.status(200).json({
            message: "Course created successfully",
            course: newCourse
        });

    } catch (err) {
        res.status(400).json({ message: "Error creating course", reason: err.message });
    }
});



//  Get Teacher’s Courses

courseRoute.get("/teacher/my-courses", verifyToken, verifyTeacher,
    async (req, res) => {
        try {
            const teacher = await UserModel.findById(req.user.id)
                .populate("uploadedCourses");

            res.status(200).json({
                message: "Your uploaded courses",
                courses: teacher.uploadedCourses
            });

        } catch (err) {
            res.status(400).json({ message: "Error fetching courses", reason: err.message });
        }
    }
);



// ADD VIDEO TO COURSE (Teacher Only)

courseRoute.post("/add-video/:courseId",verifyToken,verifyTeacher, async (req, res) => {
        try {
            const { courseId } = req.params;
            const { title, url } = req.body;

            // Validate input
            if (!title || !url) {
                return res.status(400).json({ message: "Title and URL required" });
            }

            // Find course
            const course = await CourseModel.findById(courseId);
            if (!course) {
                return res.status(404).json({ message: "Course not found" });
            }

            // Only the teacher who created the course can add videos
            if (course.teacherId.toString() !== req.user.id) {
                return res.status(403).json({
                    message: "Unauthorized — you cannot modify this course",
                });
            }

            // Add new video to the videos array
            course.videos.push({ title, url });

            await course.save();

            res.status(200).json({
                message: "Video added successfully",
                videos: course.videos,
            });

        } catch (err) {
            res.status(400).json({
                message: "Error adding video",
                reason: err.message,
            });
        }
    }
);

// ADD PDF TO COURSE (Teacher Only)
courseRoute.post("/add-pdf/:courseId",verifyToken,verifyTeacher,async (req, res) => {
        try {
            const { courseId } = req.params;
            const { title, url } = req.body;

            if (!title || !url) {
                return res.status(400).json({ message: "Title and PDF URL required" });
            }

            const course = await CourseModel.findById(courseId);
            if (!course) return res.status(404).json({ message: "Course not found" });

            if (course.teacherId.toString() !== req.user.id)
                return res.status(403).json({ message: "Unauthorized" });

            course.pdfs.push({ title, url });
            await course.save();

            res.status(200).json({
                message: "PDF added",
                pdfs: course.pdfs,
            });

        } catch (err) {
            res.status(400).json({ message: "Error adding PDF", reason: err.message });
        }
    }
);

// ADD QUIZ TO COURSE
courseRoute.post("/add-quiz/:courseId",verifyToken,verifyTeacher,async (req, res) => {
        try {
            const { courseId } = req.params;
            const { title, questions } = req.body;

            if (!title || !questions) {
                return res.status(400).json({ message: "Title and questions are required" });
            }

            const course = await CourseModel.findById(courseId);
            if (!course) return res.status(404).json({ message: "Course not found" });

            if (course.teacherId.toString() !== req.user.id)
                return res.status(403).json({ message: "Unauthorized" });

            // Create quiz
            const quiz = new QuizModel({ courseId, title, questions });
            await quiz.save();

            // Add quiz reference inside course
            course.quizzes.push(quiz._id);
            await course.save();

            res.status(200).json({
                message: "Quiz added",
                quiz
            });

        } catch (err) {
            res.status(400).json({ message: "Error adding quiz", reason: err.message });
        }
    }
);

// ADD ASSIGNMENT TO COURSE
courseRoute.post("/add-assignment/:courseId",verifyToken,verifyTeacher,async (req, res) => {
        try {
            const { courseId } = req.params;
            const { title, description, dueDate } = req.body;

            if (!title || !description || !dueDate) {
                return res.status(400).json({ message: "All fields required" });
            }

            const course = await CourseModel.findById(courseId);
            if (!course) return res.status(404).json({ message: "Course not found" });

            if (course.teacherId.toString() !== req.user.id)
                return res.status(403).json({ message: "Unauthorized" });

            const assignment = new AssignmentModel({
                courseId,
                title,
                description,
                dueDate
            });

            await assignment.save();

            course.assignments.push(assignment._id);
            await course.save();

            res.status(200).json({
                message: "Assignment added",
                assignment
            });

        } catch (err) {
            res.status(400).json({ message: "Error adding assignment", reason: err.message });
        }
    }
);


// VIEW ALL SUBMISSIONS FOR AN ASSIGNMENT (Teacher Only)

courseRoute.get("/assignment/:assignmentId/submissions",verifyToken,verifyTeacher, async (req, res) => {
        try {
            const { assignmentId } = req.params;

            // Get submissions
            const submissions = await AssignmentSubmissionModel.find({ assignmentId })
                .populate("studentId", "name email");

            res.status(200).json({
                message: "Submissions loaded",
                submissions
            });

        } catch (err) {
            res.status(400).json({
                message: "Error loading submissions",
                reason: err.message
            });
        }
    }
);


// GRADE ASSIGNMENT SUBMISSION (Teacher Only)

courseRoute.put("/submission/:submissionId/grade",verifyToken,verifyTeacher,
    async (req, res) => {
        try {
            const { submissionId } = req.params;
            const { marks, feedback } = req.body;

            const updated = await AssignmentSubmissionModel.findByIdAndUpdate(
                submissionId,
                { marks, feedback },
                { new: true }
            );

            res.status(200).json({
                message: "Submission graded successfully",
                submission: updated
            });

        } catch (err) {
            res.status(400).json({
                message: "Error grading submission",
                reason: err.message
            });
        }
    }
);

// TEACHER: View students enrolled in a course
courseRoute.get(
    "/:courseId/enrolled-students",
    verifyToken,
    verifyTeacher,
    async (req, res) => {
        try {
            const { courseId } = req.params;

            const students = await UserModel.find({
                enrolledCourses: courseId
            }).select("name email");

            res.status(200).json({
                message: "Enrolled students fetched",
                students
            });

        } catch (err) {
            res.status(400).json({
                message: "Error fetching enrolled students",
                reason: err.message
            });
        }
    }
);

courseRoute.get("/teacher/dashboard", verifyToken, verifyTeacher, async (req, res) => {
    try {
        const teacherId = req.user.id;

        // 1. Find all courses uploaded by this teacher
        const courses = await CourseModel.find({ teacherId });

        // Basic analytics
        const totalCourses = courses.length;

        // Prepare extended analytics
        const analytics = [];

        for (const course of courses) {
            // Count enrolled students
            const enrolledStudents = await UserModel.countDocuments({
                enrolledCourses: course._id
            });

            // Count quizzes created
            const quizCount = await QuizModel.countDocuments({
                courseId: course._id
            });

            // Count assignments created
            const assignmentCount = course.assignments.length;

            // Count submissions received
            const submissionsReceived =
                await AssignmentSubmissionModel.countDocuments({
                    assignmentId: { $in: course.assignments }
                });

            analytics.push({
                courseTitle: course.title,
                enrolledStudents,
                quizCount,
                assignmentCount,
                submissionsReceived
            });
        }

        res.status(200).json({
            message: "Teacher dashboard analytics loaded",
            totalCourses,
            analytics
        });

    } catch (err) {
        res.status(400).json({
            message: "Error loading teacher analytics",
            reason: err.message
        });
    }
});

courseRoute.get(
    "/teacher/course/:courseId",
    verifyToken,
    verifyTeacher,
    async (req, res) => {
      try {
        const course = await CourseModel.findById(req.params.courseId)
          .populate("videos")
          .populate("quizzes", "title") 
          .populate("teacherId", "name");
  
        res.status(200).json({ course });
      } catch (err) {
        res.status(400).json({ message: "Error", reason: err.message });
      }
    }
  );
  
  // Quiz Analytics
  courseRoute.get(
    "/teacher/course/:courseId/quiz-analytics",
    verifyToken,
    verifyTeacher,
    async (req, res) => {
      try {
        const { courseId } = req.params;
  
        // 1️⃣ Get quizzes of this course
        const quizzes = await QuizModel.find({ courseId });
  
        const analytics = [];
  
        for (const quiz of quizzes) {
          const attempts = await QuizAttemptModel.find({
            quizId: quiz._id
          });
  
          const totalAttempts = attempts.length;
  
          const scores = attempts.map(a => a.score);
          const totalQuestions = quiz.questions.length;
  
          const bestScore =
            scores.length > 0 ? Math.max(...scores) : 0;
  
          const avgScore =
            scores.length > 0
              ? (
                  scores.reduce((a, b) => a + b, 0) /
                  scores.length
                ).toFixed(2)
              : 0;
  
          analytics.push({
            quizId: quiz._id,
            title: quiz.title,
            totalQuestions,
            totalAttempts,
            bestScore,
            avgScore
          });
        }
  
        res.status(200).json({
          message: "Quiz analytics loaded",
          analytics
        });
  
      } catch (err) {
        res.status(400).json({
          message: "Failed to load quiz analytics",
          reason: err.message
        });
      }
    }
  );
// Quiz analysis per student
courseRoute.get(
    "/teacher/quiz/:quizId/students",
    verifyToken,
    verifyTeacher,
    async (req, res) => {
      try {
        const { quizId } = req.params;
  
        // 1️⃣ Fetch quiz (to get total questions)
        const quiz = await QuizModel.findById(quizId);
        if (!quiz) {
          return res.status(404).json({ message: "Quiz not found" });
        }
  
        // 2️⃣ Fetch attempts with student details
        const attempts = await QuizAttemptModel.find({ quizId })
          .populate("studentId", "name email");
  
        // 3️⃣ Group attempts per student
        const studentMap = {};
  
        attempts.forEach(attempt => {
          const studentId = attempt.studentId._id.toString();
  
          if (!studentMap[studentId]) {
            studentMap[studentId] = {
              studentId,
              name: attempt.studentId.name,
              email: attempt.studentId.email,
              attempts: 0,
              bestScore: 0
            };
          }
  
          studentMap[studentId].attempts += 1;
          studentMap[studentId].bestScore = Math.max(
            studentMap[studentId].bestScore,
            attempt.score
          );
        });
  
        // 4️⃣ Prepare response
        const result = Object.values(studentMap).map(s => ({
          ...s,
          percentage: Math.round(
            (s.bestScore / quiz.questions.length) * 100
          )
        }));
  
        res.status(200).json({
          message: "Student-wise quiz analytics loaded",
          totalQuestions: quiz.questions.length,
          students: result
        });
  
      } catch (err) {
        res.status(400).json({
          message: "Failed to load student analytics",
          reason: err.message
        });
      }
    }
  );
  
  // TEACHER: QUIZ ANALYSIS (questions + answers)
courseRoute.get(
  "/teacher/quiz-analysis/:quizId",
  verifyToken,
  verifyTeacher,
  async (req, res) => {
    try {
      const quiz = await QuizModel.findById(req.params.quizId);

      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      res.status(200).json({
        quiz: {
          title: quiz.title,
          questions: quiz.questions
        }
      });
    } catch (err) {
      res.status(400).json({
        message: "Failed to load quiz analysis",
        reason: err.message
      });
    }
  }
);

// TEACHER: View student progress for a course
courseRoute.get(
  "/teacher/course/:courseId/student/:studentId/progress",
  verifyToken,
  verifyTeacher,
  async (req, res) => {
    try {
      const { courseId, studentId } = req.params;

      // 1️⃣ Get quizzes of this course
      const quizzes = await QuizModel.find({ courseId });
      const student = await UserModel.findById(studentId)
        .select("name email");


      const progress = [];

      for (const quiz of quizzes) {
        const attempts = await QuizAttemptModel.find({
          quizId: quiz._id,
          studentId
        });

        if (attempts.length === 0) continue;

        const scores = attempts.map(a => a.score);
        const bestScore = Math.max(...scores);

        progress.push({
          quizId: quiz._id,
          title: quiz.title,
          attempts: attempts.length,
          bestScore,
          totalQuestions: quiz.questions.length,
          percentage: Math.round(
            (bestScore / quiz.questions.length) * 100
          ),
          lastAttempted: attempts.at(-1).submittedAt
        });
      }

      res.status(200).json({
        student,
        quizzes: progress
      });

    } catch (err) {
      res.status(400).json({
        message: "Failed to load student progress",
        reason: err.message
      });
    }
  }
);
