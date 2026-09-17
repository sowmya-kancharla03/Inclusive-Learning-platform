import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import Spinner from "react-bootstrap/Spinner";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import { useNavigate } from "react-router-dom";

function QuizAnalysis() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizAnalysis();
  }, []);

  const fetchQuizAnalysis = async () => {
    try {
      const res = await axiosInstance.get(
        `/course-api/teacher/quiz-analysis/${quizId}`
      );
      setQuiz(res.data.quiz);
    } catch (err) {
      console.error("Quiz analysis error", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <p className="text-danger text-center mt-5">
        Quiz not found
      </p>
    );
  }

  return (
    <div className="container mt-4">

      <h3 className="mb-4">📊 Quiz Analysis</h3>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5>{quiz.title}</h5>
        </Card.Body>
      </Card>

      {quiz.questions.map((q, index) => (
        <Card key={index} className="mb-3 shadow-sm">
          <Card.Body>

            <h6>
              {index + 1}. {q.question}
            </h6>

            <ul className="mt-3">
              {q.options.map((opt, i) => (
                <li key={i}>
                  {opt}
                  {q.correctOption === i && (
                    <Badge bg="success" className="ms-2">
                      Correct
                    </Badge>
                  )}
                </li>
              ))}
            </ul>

          </Card.Body>
        </Card>
      ))}
    <button type="button" className="btn btn-dark" onClick={()=> navigate(-1)}>Back</button>
    </div>
  );
}

export default QuizAnalysis;
