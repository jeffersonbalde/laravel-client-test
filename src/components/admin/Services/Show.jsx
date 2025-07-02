import React, { useEffect, useState } from "react";
import Header from "../../layout/Header";
import AdminSidebar from "../../layout/AdminSidebar";
import Footer from "../../layout/Footer";
import { token } from "../../../utils/http";
import { Link } from "react-router-dom";

const Show = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_LARAVEL_API}/services`, {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token()}`,
        },
      });

      const result = await res.json();
      setServices(result.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

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
            <div className="col-md-9">
              {/* Dashboard */}
              <div className="card shadow border-0">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between">
                    <h4 className="h5">Services</h4>
                    <Link
                      to="/admin/services/create"
                      className="btn btn-primary btn-sm"
                    >
                      Create
                    </Link>
                  </div>
                  <hr />

                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Slug</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="5" className="text-center">
                            <div
                              className="spinner-border text-primary"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </div>
                          </td>
                        </tr>
                      ) : services.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center">
                            No services found.
                          </td>
                        </tr>
                      ) : (
                        services.map((service) => (
                          <tr key={`service-${service.id}`}>
                            <td>{service.id}</td>
                            <td>{service.title}</td>
                            <td>{service.slug}</td>
                            <td>
                              {service.status == 1 ? "Active" : "Inactive"}
                            </td>
                            <td>
                              <a href="#" className="btn btn-primary btn-sm">
                                Edit
                              </a>
                              <a
                                href="#"
                                className="btn btn-secondary btn-sm ms-2"
                              >
                                Delete
                              </a>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
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

export default Show;
