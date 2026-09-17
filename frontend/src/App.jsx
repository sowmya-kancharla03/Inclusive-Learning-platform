import { useState } from 'react'
import './App.css'
import { createBrowserRouter, RouterProvider} from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import RootLayout from './components/RootLayout';
import ProtectedRoute from './components/ProtectedRoute';
import StudentMyCourses from "./pages/student/MyCourses";
import TeacherMyCourses from "./pages/teacher/TeacherCourses";
import Courses from "./pages/student/Courses";
import CourseDetails from './pages/student/CourseDetails';
import Quiz from './pages/student/Quiz';
import CreateCourse from './pages/teacher/CreateCourse';
import TeacherCourseDetail from "./pages/teacher/TeacherCourseDetail";
import QuizAnalysis from './pages/teacher/QuizAnalysis';
import EnrolledStudents from './pages/teacher/EnrolledStudents';


function App() {
  const browserRouter = createBrowserRouter([
    {
      path:'/',
      element:<RootLayout />,
      children: [
        {
          index:true,
          element:<Login />
        },
        {
          path:'login',
          element:<Login />
        },
        {
          path: 'register',
          element: <Register />,
        },
        {
          path: 'student/dashboard',
          element: (
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          ),
        },
        {
          path: 'teacher/dashboard',
          element:  (
            <ProtectedRoute role="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          ),
        },
        {
          path: 'teacher/enrolled-students/:courseId',
          element:  (
            <ProtectedRoute role="teacher">
              <EnrolledStudents />
            </ProtectedRoute>
          ),
        },
        {
          path: 'student/my-courses',
          element: (
            <ProtectedRoute role="student">
              <StudentMyCourses />
            </ProtectedRoute>
          )
        },
        {
          path: 'teacher/create-course',
          element: (
            <ProtectedRoute role="teacher">
              <CreateCourse />
            </ProtectedRoute>
          )
        },
        {
          path: 'teacher/my-courses',
          element: (
            <ProtectedRoute role="teacher">
              <TeacherMyCourses />
            </ProtectedRoute>
          )
        },
        {
          path: "teacher/course/:courseId",
          element: (
            <ProtectedRoute role="teacher">
              <TeacherCourseDetail />
            </ProtectedRoute>
          )
        },
        {
          path: 'teacher/quiz-analysis/:quizId',
          element:  (
            <ProtectedRoute role="teacher">
              <QuizAnalysis />
            </ProtectedRoute>
          ),
        },
        {
          path: "student/courses",
          element: (
            <ProtectedRoute role="student">
              <Courses />
            </ProtectedRoute>
          ),
        },
        {
          path: "student/course/:courseId",
          element: (
            <ProtectedRoute role="student">
              <CourseDetails />
            </ProtectedRoute>
          )
        },
        {
          path: "student/quiz/:quizId",
          element: (
            <ProtectedRoute role="student">
              <Quiz />
            </ProtectedRoute>
          )
        }
                        

      ]
    }
  ])
  console.log(import.meta.env.VITE_API_URL)

  return (
    <>
      <RouterProvider router={browserRouter} ></RouterProvider>
    </>
  )
}

export default App;
