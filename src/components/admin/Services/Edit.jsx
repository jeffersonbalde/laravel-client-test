import React, { useState, useRef, useMemo, useEffect } from "react";
import JoditEditor from "jodit-react";
import Header from "../../layout/Header";
import AdminSidebar from "../../layout/AdminSidebar";
import Footer from "../../layout/Footer";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { token } from "../../../utils/http";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const Edit = ({ placeholder }) => {
  const [imageId, setImageID] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const params = useParams();
  const [services, setServices] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const editor = useRef(null);
  const [content, setContent] = useState("");

  const config = useMemo(
    () => ({
      readonly: false, // all options from https://xdsoft.net/jodit/docs/,
      placeholder: placeholder || "",
    }),
    [placeholder]
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchService = async () => {
      setLoadingData(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_LARAVEL_API}/services/${params.id}`,
          {
            method: "GET",
            headers: {
              "Content-type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token()}`,
            },
          }
        );
        const result = await res.json();
        setServices(result.data);
        setImageID(result.data.image_id); // if needed
        setContent(result.data.content);

        // populate form fields
        setValue("title", result.data.title);
        setValue("slug", result.data.slug);
        setValue("short_description", result.data.short_description);
        setValue("status", result.data.status.toString());

        // console.log(result.data);
      } catch (error) {
        toast.error("Failed to load service data.");
        console.error(error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchService();
  }, [params.id, setValue]);

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const newData = { ...data, content: content, imageId: imageId };

    // 1. Confirm update
    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to update this service?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "Cancel",
    });

    if (!confirmResult.isConfirmed) return; // Exit if cancelled

    // 2. Show loading modal
    Swal.fire({
      title: "Updating...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/services/${params.id}`,
        {
          method: "PUT",
          headers: {
            "Content-type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token()}`,
          },
          body: JSON.stringify(newData),
        }
      );

      const result = await res.json();
      Swal.close();

      if (result.status === true) {
        toast.success(result.message);
        navigate("/admin/services");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      Swal.close();
      toast.error("An error occurred. Please try again.");
      console.error(error);
    }
  };

  const handleFile = async (e) => {
    setImageLoading(true);
    const formData = new FormData();
    const file = e.target.files[0];

    if (!file) {
      toast.error("No file selected.");
      setImageLoading(false);
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));

    formData.append("image", file);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/temp-images`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token()}`,
          },
          body: formData,
        }
      );

      const result = await res.json();
      console.log("Upload response (raw):", result);

      //   if (result.status === false) {
      //     toast.error(result.errors.image[0]);
      //     setPreviewUrl(null);
      //   } else {
      //     // toast.success("Image uploaded successfully.");
      //     setImageID(result.data.id);
      //   }

      if (result.status === true && result.data && result.data.id) {
        setImageID(result.data.id);
      } else {
        toast.error(
          result?.errors?.image?.[0] || result.message || "Upload failed."
        );
        setPreviewUrl(null);
      }
    } catch (error) {
      toast.error("Failed to upload image.");
      setPreviewUrl(null);
      console.error(error);
    } finally {
      setImageLoading(false);
    }
  };

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
                    <h4 className="h5">Services / Edit</h4>
                    <Link
                      to="/admin/services"
                      className="btn btn-primary btn-sm"
                    >
                      Back
                    </Link>
                  </div>
                  <hr />

                  {loadingData ? (
                    <div className="text-center py-5">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      ></div>
                      <p className="mt-3">Loading service data...</p>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className={`${loadingSubmit ? "pe-none" : ""}`}
                    >
                      <div className="mb-3">
                        <label htmlFor="" className="form-label">
                          Name
                        </label>
                        <input
                          {...register("title", {
                            required: "The title field is required",
                          })}
                          type="text"
                          className={`form-control ${
                            errors.title && "is-invalid"
                          }`}
                          placeholder="Name"
                        />
                        {errors.title && (
                          <p className="invalid-feedback">
                            {errors.title?.message}
                          </p>
                        )}
                      </div>
                      <div className="mb-3">
                        <label htmlFor="" className="form-label">
                          Slug
                        </label>
                        <input
                          {...register("slug", {
                            required: "The slug field is required",
                          })}
                          type="text"
                          className={`form-control ${
                            errors.slug && "is-invalid"
                          }`}
                          placeholder="Slug"
                        />
                        {errors.slug && (
                          <p className="invalid-feedback">
                            {errors.slug?.message}
                          </p>
                        )}
                      </div>
                      <div className="mb-3">
                        <label htmlFor="" className="form-label">
                          Description
                        </label>
                        <textarea
                          {...register("short_description")}
                          className="form-control"
                          rows={4}
                          placeholder="Description"
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="" className="form-label">
                          Content
                        </label>
                        <JoditEditor
                          ref={editor}
                          value={content}
                          config={config}
                          tabIndex={1} // tabIndex of textarea
                          onBlur={(newContent) => setContent(newContent)} // preferred to use only this option to update the content for performance reasons
                          onChange={(newContent) => {}}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="" className="form-label">
                          Image
                        </label>
                        <br />
                        <input type="file" onChange={handleFile} />
                      </div>

                      {/* {previewUrl && (
                      <div className="mb-3">
                        <label className="form-label">Preview</label>
                        <div>
                          <img
                            src={previewUrl}
                            alt="Preview"
                            style={{
                              maxWidth: "200px",
                              maxHeight: "200px",
                              borderRadius: "6px",
                            }}
                          />
                        </div>
                      </div>
                    )} */}

                      {/* {services && services.image && (
                        <div className="mb-3">
                          <label className="form-label">Current Image</label>
                          <div>
                            <img
                              src={`${
                                import.meta.env.VITE_LARAVEL_FILE_API
                              }/uploads/services/small/${services.image}`}
                              alt="Current Service"
                              style={{
                                maxWidth: "200px",
                                maxHeight: "200px",
                                borderRadius: "6px",
                              }}
                            />
                          </div>
                        </div>
                      )} */}

                      <div className="mb-3">
                        <label className="form-label">Current Image</label>
                        <div className="image-placeholder">
                          {(!imageLoaded || imageLoading) && (
                            <div className="image-shimmer"></div>
                          )}
                          <img
                            src={
                              previewUrl
                                ? previewUrl
                                : `${
                                    import.meta.env.VITE_LARAVEL_FILE_API
                                  }/uploads/temp/${services.image}`
                            }
                            alt="Current Service"
                            onLoad={() => setImageLoaded(true)}
                            onError={() => setImageLoaded(true)}
                            className={
                              imageLoaded ? "image-loaded" : "image-hidden"
                            }
                            style={{
                              width: "200px",
                              height: "200px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              position: "absolute",
                              top: 0,
                              left: 0,
                            }}
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="" className="form-label">
                          Status
                        </label>
                        <select
                          {...register("status")}
                          className="form-control"
                        >
                          <option value="1">Active</option>
                          <option value="0">Inactive</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loadingSubmit || imageLoading}
                      >
                        {loadingSubmit || imageLoading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            {imageLoading
                              ? "Uploading Image..."
                              : "Submitting..."}
                          </>
                        ) : (
                          "Update"
                        )}
                      </button>
                    </form>
                  )}
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

export default Edit;
