import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import ProgressBar from "react-bootstrap/ProgressBar";
import { useLocation } from "react-router-dom";

function Quiz() {

  const location = useLocation();
  const courseId = location.state?.courseId;
  
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);


  // FETCH QUIZ
  useEffect(() => {
    async function fetchQuiz() {
      try {
        const res = await axiosInstance.get(
          `/student-api/quiz/${quizId}`
        );

        setQuestions(res.data.quiz); // 👈 IMPORTANT
      } catch (err) {
        toast.error("Unable to load quiz");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [quizId, navigate]);

  // HANDLE ANSWER CHANGE
  const handleChange = (qIndex, option) => {
    setAnswers((prev) => ({
      ...prev,
      [qIndex]: option
    }));
  };

  // SUBMIT QUIZ
  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      toast.warning("Please answer all questions");
      return;
    }

    try {
      setSubmitting(true);

      await axiosInstance.post(
        `/student-api/quiz/${quizId}/submit`,
        { answers }
      );

      toast.success("Quiz submitted successfully");
      navigate(`/student/course/${courseId}`);
    } catch (err) {
      toast.error("Quiz submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  // LOADING
  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="container my-4">
      <h3 className="mb-3">📝 Quiz</h3>

      {/* PROGRESS */}
      <ProgressBar
        now={(Object.keys(answers).length / questions.length) * 100}
        className="mb-4"
      />

      {/* QUESTIONS */}
      {questions.map((q, qIndex) => (
        <Card className="mb-3 shadow-sm" key={qIndex}>
          <Card.Body>
            <h6>
              {qIndex + 1}. {q.question}
            </h6>

            <Form className="mt-3">
              {q.options.map((opt, i) => (
                <Form.Check
                  key={i}
                  type="radio"
                  name={`question-${qIndex}`}
                  label={opt}
                  checked={answers[qIndex] === i}
                  onChange={() => handleChange(qIndex, i)}
                  className="mb-2"
                />
              ))}
            </Form>
          </Card.Body>
        </Card>
      ))}

      {/* SUBMIT */}
      <div className="text-end">
        <Button
          variant="success"
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting ? "Submitting..." : "Submit Quiz"}
        </Button>
      </div>
    </div>
  );
}

export default Quiz;
