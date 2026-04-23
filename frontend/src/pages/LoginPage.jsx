import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import api from "../services/api";
import { saveAuth } from "../utils/auth";

function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", form);
      const { access_token, user } = response.data;

      saveAuth(access_token, user);
      navigate("/notes");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-[420px]">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-xl shadow-violet-500/20 mb-3">
            <FiLock className="text-white text-[26px]" />
          </div>

          <h1 className="text-[30px] sm:text-[35px] font-semibold leading-none">Welcome back</h1>
          <p className="mt-3 text-white/55 text-sm sm:text-lg">
            Sign in to access your encrypted notes
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#070708] p-7">
          {error && (
            <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="h-10 rounded-xl bg-white/10 border border-white/10 flex items-center px-4">
                <FiMail className="text-white/40 text-[18px]" />
                <input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  className="flex-1 bg-transparent outline-none px-3 text-sm placeholder:text-white/30"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="h-10 rounded-xl bg-white/10 border border-white/10 flex items-center px-4">
                <FiLock className="text-white/40 text-[18px]" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="flex-1 bg-transparent outline-none px-3 text-sm placeholder:text-white/30"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-white/40 hover:text-white/70 transition"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-10 w-full rounded-2xl bg-white text-black font-medium hover:bg-white/90 transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-white/55 mt-6">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-white font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center text-sm text-white/35 flex items-center justify-center gap-2">
          <FiLock className="text-[13px]" />
          <span>Your data is encrypted end-to-end</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
