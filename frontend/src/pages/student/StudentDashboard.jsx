import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import Hero from "../../components/Hero";

function StudentDashboard() {

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await axiosInstance.get("/student-api/dashboard");
        setAnalytics(res.data.analytics);
      } catch (err) {
        console.error("Dashboard error", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);


  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border" role="status" />
      </div>
    );
  }


  if (!analytics) {
    return (
      <div className="text-center mt-5 text-danger">
        Failed to load dashboard
      </div>
    );
  }

  return (
    <div>
      <Hero />
      <h3 className="my-3 text-center fw-bold text-danger"> -- Analytics -- </h3>

      {/* ANALYTICS CARDS */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h5>Total Courses</h5>
              <h2>{analytics.totalCourses}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h5>Quizzes Attempted</h5>
              <h2>{analytics.quizzesAttempted}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h5>Assignments Submitted</h5>
              <h2>{analytics.assignmentsSubmitted}</h2>
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card text-center shadow-sm">
          <div className="card-body">
            <h5>Best Score Avg</h5>
            <h2>{analytics.bestScoreAverage}%</h2>
          </div>
        </div>
      </div>


      {/* ACTION BUTTONS */}
      <h3 className="my-3 text-center fw-bold text-danger"> -- Courses -- </h3>
      <div className="m-3 d-flex justify-content-center gap-3">
        
        <button
          className="btn btn-primary"
          onClick={() => navigate("/student/my-courses")}
        >
          My Courses
        </button>

        <button
          className="btn btn-outline-primary"
          onClick={() => navigate("/student/courses")}
        >
          Browse Courses
        </button>
      </div>
    </div>
  );
}

export default StudentDashboard;
