import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [stage, setStage] = useState("enterEmail");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // OTP
  const OTP_LENGTH = 6;
  const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(""));
  const otpRefs = useRef(Array.from({ length: OTP_LENGTH }, () => React.createRef()));
  const [sentOtp, setSentOtp] = useState(null);

  // Timer
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timer === 0 && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [timer]);

  function validateEmail(e) {
    return /^\S+@\S+\.\S+$/.test(e);
  }

  async function requestOtp(e) {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Enter a valid email address");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));

    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setSentOtp(mockOtp);

    setStage("enterOtp");
    setOtpValues(Array(OTP_LENGTH).fill(""));
    setTimer(30);

    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimer((t) => Math.max(0, t - 1));
      }, 1000);
    }

    setTimeout(() => otpRefs.current[0]?.current?.focus(), 120);
    setLoading(false);
  }

  async function verifyOtp(e) {
    e.preventDefault();
    setError("");

    if (otpValues.join("").length < OTP_LENGTH) {
      setError("Enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    if (otpValues.join("") === sentOtp) {
      setStage("enterPin");
    } else {
      setError("Invalid OTP");
    }

    setLoading(false);
  }

  async function verifyPin(e) {
    e.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(pin)) {
      setError("Security PIN must be 6 digits");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    navigate("/user/dashboard");
  }

  function resendOtp() {
    if (timer > 0) return;

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setSentOtp(newOtp);
    setTimer(30);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-gray-200 grid grid-cols-1 md:grid-cols-2 overflow-hidden">

        {/* LEFT BRAND PANEL */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
          <div>
            <h2 className="text-3xl font-bold">VerifyX</h2>
            <p className="mt-2 text-sm opacity-90 max-w-xs">
              Secure, password-less authentication for compliant platforms.
            </p>
          </div>

          <div className="space-y-4 text-sm opacity-95">
            <p>✔ Email verification</p>
            <p>✔ OTP based authentication</p>
            <p>✔ Secure PIN validation</p>
          </div>

          <p className="text-xs opacity-80">
            Trusted by modern FinTech & compliance teams
          </p>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="p-10 md:p-14 flex flex-col justify-center">
          <h1 className="text-3xl font-semibold text-gray-900">
            Sign in
          </h1>
          <p className="text-gray-600 mt-2 mb-8">
            Verify your identity to continue
          </p>

          {/* EMAIL */}
          {stage === "enterEmail" && (
            <form onSubmit={requestOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-5 py-4 text-base rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-95"
              >
                {loading ? "Sending OTP..." : "Continue"}
              </button>
            </form>
          )}

          {/* OTP */}
          {stage === "enterOtp" && (
            <form onSubmit={verifyOtp} className="space-y-6">
              <p className="text-gray-600">
                Enter the OTP sent to <strong>{email}</strong>
              </p>

              <div className="flex gap-3">
                {otpValues.map((v, i) => (
                  <input
                    key={i}
                    ref={otpRefs.current[i]}
                    value={v}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 1);
                      const next = [...otpValues];
                      next[i] = val;
                      setOtpValues(next);
                      if (val && i < OTP_LENGTH - 1) {
                        otpRefs.current[i + 1]?.current?.focus();
                      }
                    }}
                    maxLength={1}
                    className="w-14 h-14 text-xl text-center rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                ))}
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold"
                >
                  Verify OTP
                </button>

                {timer > 0 ? (
                  <span className="text-sm text-gray-500">
                    Resend in {timer}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={resendOtp}
                    className="text-sm text-blue-600 underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-400">Demo OTP: {sentOtp}</p>
            </form>
          )}

          {/* PIN */}
          {stage === "enterPin" && (
            <form onSubmit={verifyPin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Security PIN
                </label>
                <input
                  type="password"
                  value={pin}
                  maxLength={6}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••••"
                  className="w-full px-5 py-4 text-base tracking-widest rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                className="w-full py-4 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
              >
                Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
