import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    phone: "",
    pin: "",
    confirmPin: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    if (!form.email || !form.phone || !form.pin || !form.confirmPin) {
      return "All fields are required";
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      return "Enter a valid email address";
    }
    if (!/^\d{10}$/.test(form.phone)) {
      return "Phone number must be 10 digits";
    }
    if (!/^\d{6}$/.test(form.pin)) {
      return "Security PIN must be 6 digits";
    }
    if (form.pin !== form.confirmPin) {
      return "PINs do not match";
    }
    return null;
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/login");
    }, 1000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-xl shadow-blue-100/40 p-8">

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
            C
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mt-4">
            Create your account
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Secure onboarding for KYC & AML compliance
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="10 digit mobile number"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Security PIN
              </label>
              <input
                type="password"
                name="pin"
                value={form.pin}
                onChange={handleChange}
                placeholder="••••••"
                maxLength={6}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Confirm PIN
              </label>
              <input
                type="password"
                name="confirmPin"
                value={form.confirmPin}
                onChange={handleChange}
                placeholder="••••••"
                maxLength={6}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl text-sm font-semibold tracking-wide hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-sm text-gray-600 mt-6 text-center">
          Already registered?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-600 font-medium cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
