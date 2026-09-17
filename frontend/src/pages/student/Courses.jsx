import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const [coursesRes, myCoursesRes] = await Promise.all([
          axiosInstance.get("/student-api/courses"),
          axiosInstance.get("/student-api/my-courses"),
        ]);

        setCourses(coursesRes.data.courses);
        setMyCourses(myCoursesRes.data.courses);
      } catch (err) {
        console.error("Courses error", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const enrollCourse = async (courseId) => {
    const isAlreadyEnrolled = myCourses.some(
      (course) => course._id === courseId
    );

    if (isAlreadyEnrolled) {
      toast.warn("Already enrolled");
      return;
    }

    try {
      await axiosInstance.post(`/student-api/enroll/${courseId}`);
      toast.success("Enrolled successfully");

      // update UI immediately
      setMyCourses((prev) => [...prev, { _id: courseId }]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Enroll failed");
    }
  };

  const gotoCourse = (courseId) => {
    navigate(`/student/course/${courseId}`);
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Available Courses</h2>

      <div className="row">
        {courses.map((course) => {
          const isEnrolled = myCourses.some(
            (c) => c._id === course._id
          );

          return (
            <div className="col-md-4 mb-4" key={course._id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{course.title}</h5>
                  <p className="card-text">{course.description}</p>

                  <button
                    className="btn btn-success me-2"
                    disabled={isEnrolled}
                    onClick={() => enrollCourse(course._id)}
                  >
                    {isEnrolled ? "Enrolled" : "Enroll"}
                  </button>

                  <button
                    className="btn btn-outline-primary"
                    onClick={() => gotoCourse(course._id)}
                  >
                    Go to Course
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {courses.length === 0 && (
        <div className="alert alert-info">
          No courses available at the moment.
        </div>
      )}
    </div>
  );
}

export default Courses;
