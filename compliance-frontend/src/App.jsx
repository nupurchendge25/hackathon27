import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";

// pages
import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import About from "./pages/About";

// user pages
import UserDashboard from "./pages/user/Dashboard";
import KycUpload from "./pages/user/KycUpload";
import KycDetail from "./pages/user/KycDetail";
import KycPreview from "./pages/user/KycPreview";


// features


// admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import KycList from "./pages/admin/KycList";
import KycReview from "./pages/admin/KycReview";
import AMLAlerts from "./pages/admin/AMLAlerts";
import Rules from "./pages/admin/Rules";
import Reports from "./pages/admin/Reports";
import AuditLogs from "./pages/admin/AuditLogs";

export default function App() {
  return (
    <div className="w-full min-h-screen bg-white text-gray-900">
      <Navbar />

      <main className="pt-24 px-6 lg:px-12 pb-12">
        <Routes>

          {/* general */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* user */}
          <Route path="/user" element={<Navigate to="/user/dashboard" replace />} />
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/user/kyc/new" element={<KycUpload />} />
          <Route path="/user/kyc/preview" element={<KycPreview />} />

          <Route path="/user/kyc/:id" element={<KycDetail />} />

          {/* features */}
         

          {/* admin */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/kyc" element={<KycList />} />
          <Route path="/admin/kyc/:id" element={<KycReview />} />
          <Route path="/admin/aml" element={<AMLAlerts />} />
          <Route path="/admin/rules" element={<Rules />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/audit" element={<AuditLogs />} />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </main>
    </div>
  );
}