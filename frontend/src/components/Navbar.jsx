import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // 🔥 WAIT until auth state is resolved
  if (loading) return null;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <NavLink className="navbar-brand" to="/">
        Classroom LMS
      </NavLink>

      <div className="collapse navbar-collapse">
        <ul className="navbar-nav me-auto">
          {user?.role === "student" && (
            <>
              <li className="nav-item">
                <NavLink className="nav-link" to="/student/dashboard">
                  Dashboard
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/student/my-courses">
                  My Courses
                </NavLink>
              </li>
            </>
          )}

          {user?.role === "teacher" && (
            <>
              <li className="nav-item">
                <NavLink className="nav-link" to="/teacher/dashboard">
                  Dashboard
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/teacher/my-courses">
                  My Courses
                </NavLink>
              </li>
            </>
          )}
        </ul>

        <ul className="navbar-nav ms-auto">
          {!user && (
            <>
              <li className="nav-item">
                <NavLink className="nav-link" to="/login">
                  Login
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/register">
                  Register
                </NavLink>
              </li>
            </>
          )}

          {user && (
            <>
              <li className="nav-item">
                <span className="navbar-text me-3">
                  Hi, {user.name}
                </span>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-sm btn-outline-light"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
