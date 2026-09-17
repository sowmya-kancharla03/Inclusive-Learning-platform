import { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";

function CreateCourse() {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description) {
      toast.warning("All fields are required");
      return;
    }

    try {
      setLoading(true);

      await axiosInstance.post("/course-api/create-course", {
        title,
        description
      });

      toast.success("Course created successfully");
      navigate("/teacher/dashboard");

    } catch (err) {
      console.error("Create course error", err);
      toast.error("Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <Card className="shadow-sm mx-auto" style={{ maxWidth: "600px" }}>
        <Card.Body>
          <h4 className="mb-4 text-center">📘 Create New Course</h4>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Course Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter course title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Enter course description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>

            <div className="text-center">
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="px-4"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" animation="border" /> Creating...
                  </>
                ) : (
                  "Create Course"
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default CreateCourse;
