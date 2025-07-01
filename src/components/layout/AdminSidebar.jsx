import React, { useContext } from "react";
import { AuthContext } from "../../context/Auth";

const AdminSidebar = () => {
  const { logout } = useContext(AuthContext);
  return (
    <div className="card shadow border-0 admin-sidebar">
      <div className="card-body p-4 ">
        <h4>Sidebar</h4>
        <ul>
          <li>
            <a href="#">Dashboard</a>
          </li>
          <li>
            <a href="#">Services</a>
          </li>
          <li>
            <a href="#">Projects</a>
          </li>

          <li>
            <a href="#">Articles</a>
          </li>
          <li>
            <button onClick={logout} className="btn btn-primary mt-4">Logout</button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminSidebar;
