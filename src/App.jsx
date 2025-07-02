  import "bootstrap/dist/css/bootstrap.min.css";
  import { BrowserRouter, Routes, Route } from "react-router-dom";
  import Home from "./pages/Home/Home";
  import About from "./pages/About/About";
  import "./styles/style.scss";
  import Login from "./pages/Login/Login";
  import { ToastContainer, toast } from "react-toastify";
  import Dashboard from "./pages/Dashboard/Dashboard";
  import RequireAuth from "./context/RequireAuth";
  import { default as ShowServices } from "./components/admin/Services/Show";
  import { default as CreateServices } from "./components/admin/Services/Create";

  function App() {
    return (
      <>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin/login" element={<Login />} />
            <Route
              path="/admin/dashboard"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/services"
              element={
                <RequireAuth>
                  <ShowServices />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/services/create"
              element={
                <RequireAuth>
                  <CreateServices />
                </RequireAuth>
              }
            />
          </Routes>
        </BrowserRouter>
        <ToastContainer position="top-center" />
      </>
    );
  }

  export default App;
