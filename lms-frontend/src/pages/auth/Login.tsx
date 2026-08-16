import { useState, type FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button, Icons } from "../../components/ui";

interface LoginProps {
  onRegister: () => void;
}

export default function Login({ onRegister }: LoginProps) {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-[#E07B39] flex items-center justify-center text-white">
            <Icons.GraduationCap />
          </div>

          <div>
            <p
              className="text-base font-bold text-[#0D1B2E]"
              style={{
                fontFamily: "Instrument Sans, sans-serif",
              }}
            >
              AI University LMS
            </p>

            <p className="text-xs text-[#9BAABF] uppercase tracking-widest">
              Student Portal
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#DEE5F0] shadow-sm p-7">

          <h1 className="text-xl font-bold text-[#0D1B2E] mb-1">
            Welcome back
          </h1>

          <p className="text-sm text-[#5A6A82] mb-6">
            Sign in to your account
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-[#5A6A82] mb-1.5">
                Email address
              </label>

              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="w-full h-10 rounded-lg border border-[#DEE5F0] bg-[#F8FAFB] px-3 text-sm text-[#0D1B2E] placeholder-[#9BAABF] focus:outline-none focus:ring-2 focus:ring-[#1C3D6E]/25 focus:border-[#1C3D6E] transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-[#5A6A82] mb-1.5">
                Password
              </label>

              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 rounded-lg border border-[#DEE5F0] bg-[#F8FAFB] px-3 text-sm text-[#0D1B2E] placeholder-[#9BAABF] focus:outline-none focus:ring-2 focus:ring-[#1C3D6E]/25 focus:border-[#1C3D6E] transition-all"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                <span className="text-red-500 flex-shrink-0">
                  <Icons.AlertCircle />
                </span>

                <p className="text-xs text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* Login */}
            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          {/* Register */}
          <div className="mt-5 text-center">
            <p className="text-xs text-[#9BAABF]">
              Don't have an account?{" "}

              <button
                type="button"
                onClick={onRegister}
                className="font-medium text-[#1C3D6E] hover:underline"
              >
                Register as a student
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-[#9BAABF] mt-5">
          AI University LMS · All rights reserved
        </p>
      </div>
    </div>
  );
}