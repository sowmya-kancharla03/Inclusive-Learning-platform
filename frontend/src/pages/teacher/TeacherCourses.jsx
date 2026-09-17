import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import Spinner from "react-bootstrap/Spinner";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

function TeacherCourses() {

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await axiosInstance.get(
          "/course-api/teacher/my-courses"
        );
        setCourses(res.data.courses);
      } catch (err) {
        console.error("Teacher courses error", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  // LOADING
  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>📚 My Courses</h3>

        <Button
          variant="primary"
          onClick={() => navigate("/teacher/create-course")}
        >
          + Create Course
        </Button>
      </div>

      {courses.length === 0 ? (
        <p className="text-muted text-center">
          No courses created yet
        </p>
      ) : (
        <div className="row">
          {courses.map(course => (
            <div className="col-md-4 mb-3" key={course._id}>
              <Card className="shadow-sm h-100">
                <Card.Body className="d-flex flex-column">
                  <h5>{course.title}</h5>
                  <p className="text-muted flex-grow-1">
                    {course.description}
                  </p>

                  <Button
                    variant="outline-primary"
                    onClick={() =>
                      navigate(`/teacher/course/${course._id}`)
                    }
                  >
                    Manage Course
                  </Button>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TeacherCourses;
