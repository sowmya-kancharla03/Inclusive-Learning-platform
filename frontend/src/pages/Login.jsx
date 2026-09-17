import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { AuthContext } from "../context/AuthContext";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onLoginFormSubmit = async (userObj) => {
    try {
      const loggedInUser = await login(userObj);
      toast.success("Login successful");

      if (loggedInUser.role === "student") {
        navigate("/student/dashboard");
      } else if (loggedInUser.role === "teacher") {
        navigate("/teacher/dashboard");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Invalid email or password"
      );
    }
  };

  return (
    <div className="card shadow-sm p-4 w-50 mx-auto mt-5">
      <form
        className="w-50 mx-auto mt-5"
        onSubmit={handleSubmit(onLoginFormSubmit)}
      >
        <div className="form-floating mb-3">
          <input
            type="email"
            autoFocus
            className="form-control"
            placeholder="Email"
            {...register("email", { required: true })}
          />
          <label>Email</label>
          {errors.email && (
            <small className="text-danger">Email is required</small>
          )}
        </div>

        <div className="form-floating mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            aria-invalid={errors.password ? "true" : "false"}
            {...register("password", { required: true })}
          />
          <label>Password</label>
          {errors.password && (
            <small className="text-danger">Password is required</small>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>

        <p className="text-center mt-3">
          Not registered? <NavLink to="/register">Register</NavLink>
        </p>
      </form>
    </div>
  );
}

export default Login;
