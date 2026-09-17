import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import Spinner from "react-bootstrap/Spinner";
import Table from "react-bootstrap/Table";
import Hero from "../../components/Hero";
import { useNavigate } from "react-router-dom";

function TeacherDashboard() {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await axiosInstance.get(
          "/course-api/teacher/dashboard"
        );
        setData(res.data);
      } catch (err) {
        console.error("Teacher dashboard error", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!data) {
    return (
      <p className="text-danger text-center mt-5">
        Failed to load dashboard
      </p>
    );
  }

  return (
    <div className="m-3">
      <Hero />

      {/* SUMMARY */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h6>Total Courses</h6>
              <h2>{data.totalCourses}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* COURSE ANALYTICS */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Course Analytics</h5>

          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>Course</th>
                <th>Enrolled Students</th>
                <th>Quizzes</th>
              </tr>
            </thead>
            <tbody>
              {data.analytics.map((course, index) => (
                <tr key={index}>
                  <td>{course.courseTitle}</td>
                  <td>{course.enrolledStudents}</td>
                  <td>{course.quizCount}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
      <div className="m-3 d-flex justify-content-center gap-3">
        <button type="button" className="btn btn-primary p-3 rounded-5 " onClick={() => navigate(`/teacher/create-course`)}>
          Add Course
        </button>
      </div>
    </div>
  );
}

export default TeacherDashboard;
