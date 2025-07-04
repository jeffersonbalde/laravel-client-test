import React, { useState, useRef, useMemo, useEffect } from "react";
import JoditEditor from "jodit-react";
import Header from "../../layout/Header";
import AdminSidebar from "../../layout/AdminSidebar";
import Footer from "../../layout/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { token } from "../../../utils/http";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const Create = ({ placeholder }) => {
  const [loading, setLoading] = useState(false);
  const [imageId, setImageID] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const editor = useRef(null);
  const [content, setContent] = useState("");

  const config = useMemo(
    () => ({
      readonly: false, // all options from https://xdsoft.net/jodit/docs/,
      placeholder: placeholder || "Content",
    }),
    [placeholder]
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true); // ✅ enable button loading state
    const newData = { ...data, content: content, imageId: imageId };

    try {
      const confirmResult = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to save this service?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, save it!",
        cancelButtonText: "Cancel",
      });

      if (!confirmResult.isConfirmed) {
        setLoading(false); // ✅ reset loading if cancelled
        return;
      }

      Swal.fire({
        title: "Saving...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await fetch(`${import.meta.env.VITE_LARAVEL_API}/services`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(newData),
      });

      const result = await res.json();
      Swal.close();
      setLoading(false); // ✅ stop spinner

      if (result.status === true) {
        toast.success(result.message);
        navigate("/admin/services");
      } else {
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            toast.error(`${field}: ${messages[0]}`);
          });
        } else {
          toast.error(result.message || "Something went wrong.");
        }
      }
    } catch (error) {
      Swal.close();
      setLoading(false); // ✅ stop spinner
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

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PNG, JPG, JPEG, and GIF files are allowed.");
      e.target.value = ""; // Clear input
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

      // if (result.status === false) {
      //   toast.error(result.errors.image[0]);
      //   setPreviewUrl(null);
      // } else {
      //   // toast.success("Image uploaded successfully.");
      //   setImageID(result.data.id);
      // }

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
                    <h4 className="h5">Services / Create</h4>
                    <Link
                      to="/admin/services"
                      className="btn btn-primary btn-sm"
                    >
                      Back
                    </Link>
                  </div>
                  <hr />

                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className={`${loading ? "pe-none" : ""}`}
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
                        autoFocus
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
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/gif"
                        onChange={handleFile}
                      />
                    </div>

                    {imageLoading ? (
                      <div className="mb-3">
                        <label className="form-label">Preview</label>
                        <div className="image-placeholder">
                          <div className="image-shimmer"></div>
                        </div>
                      </div>
                    ) : previewUrl ? (
                      <div className="mb-3">
                        <label className="form-label">Preview</label>
                        <div className="image-placeholder">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            style={{
                              width: "200px",
                              height: "200px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        </div>
                      </div>
                    ) : null}

                    <div className="mb-3">
                      <label htmlFor="" className="form-label">
                        Status
                      </label>
                      <select {...register("status")} className="form-control">
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading || imageLoading}
                    >
                      {loading || imageLoading ? (
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
                        "Submit"
                      )}
                    </button>
                  </form>
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

export default Create;
