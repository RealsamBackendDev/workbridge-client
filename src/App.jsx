import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Jobs from "./pages/Jobs";
import MyJobs from "./pages/MyJobs";
import JobDetail from "./pages/JobDetail";
import MyProposals from "./pages/MyProposals";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Wallet from "./pages/Wallet";
import Messages from "./pages/Messages";
import profile from "./pages/profile";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
       <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="max-w-5xl mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/my" element={<ProtectedRoute roles={["CLIENT"]}><MyJobs /></ProtectedRoute>} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/proposals/my" element={<ProtectedRoute roles={["FREELANCER"]}><MyProposals /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute roles={["CLIENT", "FREELANCER"]}><Projects /></ProtectedRoute>} />
            <Route path="/projects/:id" element={<ProtectedRoute roles={["CLIENT", "FREELANCER"]}><ProjectDetail /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
        </main>
        <Footer />
        </div> 
      </BrowserRouter>
    </AuthProvider>
  );
}