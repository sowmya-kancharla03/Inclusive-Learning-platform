import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Spinner from "react-bootstrap/Spinner";
import Badge from "react-bootstrap/Badge";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await axiosInstance.get(
          `/student-api/course/${courseId}`
        );
        setCourse(res.data.course);
      } catch (err) {
        if (err.response?.status === 403) {
          toast.error("You are not enrolled in this course");
          navigate("/student/courses");
        } else {
          toast.error("Failed to load course");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [courseId, navigate]);

  const openVideo = (video) => {
    setSelectedVideo(video);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedVideo(null);
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const getEmbedUrl = (url) => {
    try {
      // youtu.be/VIDEO_ID
      if (url.includes("youtu.be")) {
        const id = url.split("youtu.be/")[1].split("?")[0];
        return `https://www.youtube.com/embed/${id}`;
      }
  
      // youtube.com/watch?v=VIDEO_ID
      if (url.includes("watch?v=")) {
        const id = url.split("watch?v=")[1].split("&")[0];
        return `https://www.youtube.com/embed/${id}`;
      }
  
      // already embed
      if (url.includes("/embed/")) {
        return url;
      }
  
      return "";
    } catch {
      return "";
    }
  };
  

  if (!course) return null;

  return (
    <div className="container my-4">

      {/* COURSE HEADER */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <h3 className="mb-2">{course.title}</h3>

          <Badge bg="primary" className="mb-2">
            Instructor: {course.teacherId?.name}
          </Badge>

          <p className="text-muted mt-3 mb-0">
            {course.description}
          </p>
        </Card.Body>
      </Card>

      {/* TABS */}
      <Tabs
        defaultActiveKey="videos"
        className="mb-4"
        justify
      >

        {/* VIDEOS TAB */}
        <Tab eventKey="videos" title="🎥 Videos">
          {course.videos?.length > 0 ? (
            <Card className="shadow-sm">
              <Card.Body className="p-0">
                <div className="list-group list-group-flush">
                  {course.videos.map((video) => (
                    <button
                      key={video._id}
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                      onClick={() => openVideo(video)}
                    >
                      <span>▶ {video.title}</span>
                      <Badge bg="secondary">Play</Badge>
                    </button>
                  ))}
                </div>
              </Card.Body>
            </Card>
          ) : (
            <p className="text-muted text-center">
              No videos available
            </p>
          )}
        </Tab>

        {/* QUIZZES TAB */}
        <Tab eventKey="quizzes" title="📝 Quizzes">
          {course.quizzes?.length > 0 ? (
            <Row>
              {course.quizzes.map((quiz) => {
                const attempted = quiz.attempt !== null;

                const percentage = attempted
                  ? Math.round(
                    (quiz.attempt.score / quiz.totalQuestions) * 100
                  )
                  : null;

                return (
                  <Col md={6} className="mb-3" key={quiz._id}>
                    <Card className="shadow-sm h-100">
                      <Card.Body className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{quiz.title}</h6>

                          {attempted && (
                            <small className="text-success">
                              Best Score: {percentage}%
                            </small>
                          )}

                        </div>

                        {!attempted ? (
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() =>
                              navigate(`/student/quiz/${quiz._id}`, { state: { courseId } })
                            }
                          >
                            Attempt
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant={attempted ? "outline-warning" : "outline-primary"}
                            onClick={() => navigate(`/student/quiz/${quiz._id}`, { state: { courseId } })}
                          >
                            {attempted ? "Re-attempt" : "Attempt"}
                          </Button>

                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          ) : (
            <p className="text-muted text-center">
              No quizzes available
            </p>
          )}
        </Tab>


      </Tabs>

      {/* VIDEO MODAL */}
      <Modal
        show={showModal}
        onHide={closeModal}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedVideo?.title}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-0">
          {selectedVideo && (
            <iframe
              width="100%"
              height="400"
              src={getEmbedUrl(selectedVideo.url)}
              title={selectedVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}

        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default CourseDetails;
