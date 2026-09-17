import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMyCourses() {
      try {
        const res = await axiosInstance.get("/student-api/my-courses");
        setCourses(res.data.courses);
      } catch (err) {
        console.error("My courses error", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMyCourses();
  }, []);

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">My Courses</h2>

      <div className="row">
        {courses.map((course) => (
          <div className="col-md-4 mb-4" key={course._id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{course.title}</h5>
                <p className="card-text">{course.description}</p>

                <button
                  className="btn btn-primary"
                  onClick={() =>
                    navigate(`/student/course/${course._id}`)
                  }
                >
                  Go to Course
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="alert alert-info">
          You have not enrolled in any courses yet.
        </div>
      )}
    </div>
  );
}

export default MyCourses;
