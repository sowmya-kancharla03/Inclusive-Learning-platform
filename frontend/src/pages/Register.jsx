import React from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const registerUser = async (userObj) => {
    try {
      await axiosInstance.post("/user-api/register", userObj);
      toast.success("Registration successful. Please login.");
      navigate("/login");
    } catch (err) {
      console.log("err is ", err.response?.data?.message);
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="card shadow-sm border-0 p-4 w-50 mx-auto mt-5">
      <form onSubmit={handleSubmit(registerUser)}>
        
        {/* Username */}
        <div className="form-floating mb-3">
          <input
            type="text"
            className="form-control"
            id="name"
            placeholder="Username"
            {...register("name", { required: true, minLength: 6, maxLength: 12 })}
          />
          <label htmlFor="name">Username</label>
          {errors.name?.type === "required" && <small className="text-danger">Username is required</small>}
          {errors.name?.type === "minLength" && <small className="text-danger">Minimum length must be 6</small>}
          {errors.name?.type === "maxLength" && <small className="text-danger">Maximum length must be 12</small>}
        </div>

        {/* Email */}
        <div className="form-floating mb-3">
          <input
            type="email"
            className="form-control"
            id="email"
            placeholder="Email"
            {...register("email", { required: true })}
          />
          <label htmlFor="email">Email</label>
          {errors.email?.type === "required" && <small className="text-danger">Email is required</small>}
        </div>

        {/* Password */}
        <div className="form-floating mb-3">
          <input
            type="password"
            className="form-control"
            id="password"
            placeholder="Password"
            {...register("password", { required: true, minLength: 8 })}
          />
          <label htmlFor="password">Password</label>
          {errors.password?.type === "required" && <small className="text-danger">Password is required</small>}
          {errors.password?.type === "minLength" && <small className="text-danger">Minimum length must be 8</small>}
        </div>

        {/* Role Selection */}
        <div className="mb-3">
          <label htmlFor="role" className="form-label">Role</label>
          <select className="form-select" id="role" {...register("role", { required: true })}>
            <option value="">Select role</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
          {errors.role && <small className="text-danger">Role is required</small>}
        </div>

        {/* Submit */}
        <button type="submit" className="btn btn-primary w-100">Register</button>
      </form>
    </div>
  );
}

export default Register;