import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Modal from "react-bootstrap/Modal";
import EnrolledStudents from "./EnrolledStudents";


function TeacherCourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const [quizAnalytics, setQuizAnalytics] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [studentStats, setStudentStats] = useState([]);
  const [showStudentsModal, setShowStudentsModal] = useState(false);

  /* ================= QUIZ FORM ================= */
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: "",
      questions: [
        {
          question: "",
          options: ["", "", "", ""],
          correctOption: 0
        }
      ]
    }
  });

  const { fields, append } = useFieldArray({
    control,
    name: "questions"
  });

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    fetchCourse();
    fetchQuizAnalytics();
  }, []);   

  const fetchCourse = async () => {
    try {
      const res = await axiosInstance.get(
        `/course-api/teacher/course/${courseId}`
      );
      setCourse(res.data.course);
    } catch {
      toast.error("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizAnalytics = async () => {
    try {
      const res = await axiosInstance.get(
        `/course-api/teacher/course/${courseId}/quiz-analytics`
      );
      setQuizAnalytics(res.data.analytics);
    } catch {
      toast.error("Failed to load quiz analytics");
    }
  };

  const fetchStudentAnalytics = async (quiz) => {
    try {
      const res = await axiosInstance.get(
        `/course-api/teacher/quiz/${quiz.quizId}/students`
      );
      setStudentStats(res.data.students);
      setSelectedQuiz(quiz);
      setShowStudentsModal(true);
    } catch {
      toast.error("Failed to load student analytics");
    }
  };

  /* ================= VIDEO ================= */
  const getEmbedUrl = (url) => {
    try {
      if (url.includes("youtu.be")) {
        const id = url.split("youtu.be/")[1].split("?")[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      if (url.includes("watch?v=")) {
        const id = url.split("watch?v=")[1].split("&")[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      return url;
    } catch {
      return "";
    }
  };

  const addVideo = async () => {
    if (!videoTitle || !videoUrl) {
      toast.warning("Video title and URL required");
      return;
    }

    try {
      await axiosInstance.post(
        `/course-api/add-video/${courseId}`,
        { title: videoTitle, url: videoUrl }
      );
      toast.success("Video added");
      setVideoTitle("");
      setVideoUrl("");
      fetchCourse();
    } catch {
      toast.error("Failed to add video");
    }
  };

  const openVideo = (video) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  /* ================= QUIZ ================= */
  const onSubmitQuiz = async (data) => {
    try {
      await axiosInstance.post(
        `/course-api/add-quiz/${courseId}`,
        data
      );
      toast.success("Quiz added successfully");
      reset();
      fetchCourse();
      fetchQuizAnalytics();
    } catch {
      toast.error("Failed to add quiz");
    }
  };

  /* ================= UI STATES ================= */
  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!course) {
    return (
      <p className="text-danger text-center mt-5">
        Course not found
      </p>
    );
  }

  /* ================= RENDER ================= */
  return (
    <div className="container mt-4">

      {/* COURSE INFO */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h3>{course.title}</h3>
          <p className="text-muted">{course.description}</p>
        </Card.Body>
      </Card>

      <Tabs defaultActiveKey="videos" className="mb-3">

        {/* ========== VIDEOS TAB ========== */}
        <Tab eventKey="videos" title="🎥 Videos">
          <Card className="mb-3">
            <Card.Body>
              <Form.Control
                placeholder="Video title"
                className="mb-2"
                value={videoTitle}
                onChange={e => setVideoTitle(e.target.value)}
              />
              <Form.Control
                placeholder="YouTube URL"
                className="mb-3"
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
              />
              <Button onClick={addVideo}>Add Video</Button>
            </Card.Body>
          </Card>

          {course.videos?.map(video => (
            <Card
              key={video._id}
              className="mb-2"
              style={{ cursor: "pointer" }}
              onClick={() => openVideo(video)}
            >
              <Card.Body className="d-flex justify-content-between">
                <span>▶ {video.title}</span>
                <Button size="sm" variant="outline-primary">
                  Play
                </Button>
              </Card.Body>
            </Card>
          ))}
        </Tab>

        {/* ========== QUIZZES TAB ========== */}
        <Tab eventKey="quizzes" title="📝 Quizzes">
          <Card className="mb-3">
            <Card.Body>
              <Form onSubmit={handleSubmit(onSubmitQuiz)}>

                <Form.Control
                  placeholder="Quiz title"
                  className="mb-3"
                  {...register("title", { required: true })}
                />
                {errors.title && (
                  <small className="text-danger">
                    Quiz title required
                  </small>
                )}

                {fields.map((field, qIndex) => (
                  <Card className="mb-3" key={field.id}>
                    <Card.Body>

                      <Form.Control
                        placeholder={`Question ${qIndex + 1}`}
                        className="mb-2"
                        {...register(
                          `questions.${qIndex}.question`,
                          { required: true }
                        )}
                      />

                      {[0,1,2,3].map(oIndex => (
                        <Form.Control
                          key={oIndex}
                          placeholder={`Option ${oIndex + 1}`}
                          className="mb-2"
                          {...register(
                            `questions.${qIndex}.options.${oIndex}`,
                            { required: true }
                          )}
                        />
                      ))}

                      <Form.Select
                        className="mt-2"
                        {...register(
                          `questions.${qIndex}.correctOption`
                        )}
                      >
                        <option value={0}>Correct: Option 1</option>
                        <option value={1}>Correct: Option 2</option>
                        <option value={2}>Correct: Option 3</option>
                        <option value={3}>Correct: Option 4</option>
                      </Form.Select>

                    </Card.Body>
                  </Card>
                ))}

                <Button
                  variant="secondary"
                  className="me-2"
                  onClick={() =>
                    append({
                      question: "",
                      options: ["", "", "", ""],
                      correctOption: 0
                    })
                  }
                >
                  + Add Question
                </Button>

                <Button type="submit" variant="primary">
                  Save Quiz
                </Button>

              </Form>
            </Card.Body>
          </Card>
        {course.quizzes?.map(q => (
            <Card key={q._id} className="mb-2">
                <Card.Body
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/teacher/quiz-analysis/${q._id}`)}
                >
                    📝 {q.title}
                </Card.Body>
            </Card>
        ))}


        </Tab>

        {/* ========== QUIZ ANALYTICS TAB ========== */}
        <Tab eventKey="analytics" title="📊 Quiz Analytics">
          {quizAnalytics.length === 0 ? (
            <p className="text-muted text-center mt-3">
              No quiz attempts yet
            </p>
          ) : (
            <Card>
              <Card.Body>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Quiz</th>
                      <th>Attempts</th>
                      <th>Avg</th>
                      <th>Best</th>
                      <th>Questions</th>
                      <th>Students</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizAnalytics.map(q => (
                      <tr key={q.quizId}>
                        <td>{q.title}</td>
                        <td>{q.totalAttempts}</td>
                        <td>{q.avgScore}</td>
                        <td>{q.bestScore}</td>
                        <td>{q.totalQuestions}</td>
                        <td>
                          <Button
                            size="sm"
                            onClick={() => fetchStudentAnalytics(q)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card.Body>
            </Card>
          )}
        </Tab>
        {/* Enrolled Students */}
        <Tab eventKey="students" title="👥 Enrolled Students">
          <EnrolledStudents />
        </Tab>

      </Tabs>

      {/* ========== VIDEO MODAL ========== */}
      <Modal
        show={showVideoModal}
        onHide={() => setShowVideoModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedVideo?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {selectedVideo && (
            <iframe
              width="100%"
              height="400"
              src={getEmbedUrl(selectedVideo.url)}
              title={selectedVideo.title}
              allowFullScreen
            />
          )}
        </Modal.Body>
      </Modal>

      {/* ========== STUDENT MODAL ========== */}
      <Modal
        show={showStudentsModal}
        onHide={() => setShowStudentsModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            👨‍🎓 {selectedQuiz?.title} – Students
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {studentStats.length === 0 ? (
            <p className="text-muted text-center">
              No attempts yet
            </p>
          ) : (
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Attempts</th>
                  <th>Best</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {studentStats.map(s => (
                  <tr key={s.studentId}>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.attempts}</td>
                    <td>{s.bestScore}</td>
                    <td>{s.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Modal.Body>
      </Modal>

    </div>
  );
}

export default TeacherCourseDetail;
