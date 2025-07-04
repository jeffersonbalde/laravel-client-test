import React, { useEffect, useState } from "react";
import Header from "../../layout/Header";
import AdminSidebar from "../../layout/AdminSidebar";
import Footer from "../../layout/Footer";
import { token } from "../../../utils/http";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { toast } from "react-toastify";

const Show = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const MySwal = withReactContent(Swal);

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

  const deleteServices = async (id) => {
    if (deleting) return;

    const confirmResult = await MySwal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirmResult.isConfirmed) {
      setDeleting(true);

      Swal.fire({
        title: "Deleting...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const res = await fetch(
          `${import.meta.env.VITE_LARAVEL_API}/services/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token()}`,
            },
          }
        );

        const result = await res.json();
        Swal.close(); // Close the loading modal

        if (result.status === true) {
          toast.success(result.message);
          await fetchServices(); // Refresh list
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        Swal.close();
        toast.error("An error occurred. Please try again.");
      } finally {
        setDeleting(false);
      }
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
                              <div className="d-flex gap-2">
                                <Link
                                  to={`/admin/services/edit/${service.id}`}
                                  className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                                >
                                  <i className="bi bi-pencil-square"></i> Edit
                                </Link>
                                <button
                                  onClick={() => deleteServices(service.id)}
                                  className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                                >
                                  <i className="bi bi-trash"></i> Delete
                                </button>
                              </div>
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

      {/* {deleting && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="text-center text-white">
            <div className="spinner-border text-light" role="status"></div>
            <div className="mt-3 fw-bold">Deleting service, please wait...</div>
          </div>
        </div>
      )} */}

      <Footer />
    </div>
  );
};

export default Show;
