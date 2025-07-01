import React from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import AdminSidebar from "../../components/layout/AdminSidebar";

const Dashboard = () => {
  return (
    <div>
      <Header />

      <main>
        <div className="container my-5">
          <div className="row">
            <div className="col-md-3">
                <AdminSidebar />
              {/* Sidebar */}
            </div>
            <div className="col-md-9 dashboard">
              {/* Dashboard */}
              <div className="card shadow border-0">
                <div className="card-body d-flex justify-content-center align-items-center">
                  <h4>Dashboard</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
