import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useParams } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import Modal from "react-bootstrap/Modal";
import StudentProgressGraph from "./StudentProgressGraph";


function EnrolledStudents() {
  const { courseId } = useParams();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);
  const [studentProgress, setStudentProgress] = useState(null);

  useEffect(() => {
    fetchEnrolledStudents();
  }, []);

  const fetchEnrolledStudents = async () => {
    try {
      const res = await axiosInstance.get(
        `/course-api/${courseId}/enrolled-students`
      );
      setStudents(res.data.students);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentProgress = async (studentId) => {
    try {
      setProgressLoading(true);
      const res = await axiosInstance.get(
        `/course-api/teacher/course/${courseId}/student/${studentId}/progress`
      );
      setStudentProgress(res.data);
      setShowProgressModal(true);
    } catch (err) {
      console.error(err);
    } finally {
      setProgressLoading(false);
    }
  };
  

  if (loading) {
    return (
      <div className="text-center mt-4">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div>
    <Card className="shadow-sm">
      <Card.Body>
        <h5 className="mb-3">👥 Enrolled Students</h5>

        {students.length === 0 ? (
          <p className="text-muted">No students enrolled yet</p>
        ) : (
          <table className="table table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((stu, index) => (
                <tr key={stu._id}>
                  <td>{index + 1}</td>
                  <td>{stu.name}</td>
                  <td>{stu.email}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => fetchStudentProgress(stu._id)}
                    >
                      View Progress
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card.Body>

    </Card>
    <div className="m-5"></div>
   

<Modal.Body>
  {progressLoading ? (
    <div className="text-center py-4">
      <Spinner animation="border" />
    </div>
  ) : !studentProgress ? (
    <p className="text-muted text-center">
      Loading progress...
    </p>
  ) : studentProgress.quizzes.length === 0 ? (
    <div className="text-center text-muted py-4">
      <h6>No activity yet</h6>
      <p>This student hasn’t attempted any quizzes.</p>
    </div>
  ) : (
    <>
      {/* GRAPH */}
      <StudentProgressGraph quizzes={studentProgress.quizzes} />

      {/* TABLE */}
      <table className="table table-bordered align-middle">
        <thead className="table-light sticky-top">
          <tr>
            <th>Quiz</th>
            <th>Attempts</th>
            <th>Best Score</th>
            <th>%</th>
            <th>Last Attempt</th>
          </tr>
        </thead>
        <tbody>
          {studentProgress.quizzes.map(q => (
            <tr key={q.quizId}>
              <td>{q.title}</td>
              <td>{q.attempts}</td>
              <td>{q.bestScore} / {q.totalQuestions}</td>
              <td
                className={
                  q.percentage >= 75
                    ? "text-success fw-bold"
                    : q.percentage >= 40
                    ? "text-warning fw-bold"
                    : "text-danger fw-bold"
                }
              >
                {q.percentage}%
              </td>
              <td>
                {new Date(q.lastAttempted).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )}
</Modal.Body>



  </div>  
  );
}

export default EnrolledStudents;
